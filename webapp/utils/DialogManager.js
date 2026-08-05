sap.ui.define([], function () {
    "use strict";
    return {
        onOpenDataConfig: function (oController) {
            var oSelectedData = oController.getView().getModel("selected").getData();
            oController.getView().getModel("dialog").setData(JSON.parse(JSON.stringify(oSelectedData)));
            oController.byId("dataConfigDialog").open();
        },
        onCloseDataConfig: function (oController) { oController.byId("dataConfigDialog").close(); },
        onApplyDataConfig: function (oController) {
            var oEditedData = oController.getView().getModel("dialog").getData();
            var oLayoutModel = oController.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");
            var oResult = oController._findArrayAndIndex(aControls, oEditedData.id);
            if (oResult) {
                oResult.array[oResult.index] = oEditedData;
                oLayoutModel.setProperty("/controls", aControls);
            }
            oController.getView().getModel("selected").setData(oEditedData);
            oController._renderCanvas();
            oController.byId("dataConfigDialog").close();
            sap.m.MessageToast.show("Data Control configurations applied successfully!");
            oController._saveState();
        },
        onAddCustomAction: function (oController) {
            var oDialogModel = oController.getView().getModel("dialog");
            var aActions = oDialogModel.getProperty("/customActions") || [];
       
            var sControlType = oDialogModel.getProperty("/type");
            
            var sDefaultLogic = "sap.m.MessageToast.show('You clicked ' + rowData.rowId);"; 
            
            if (sControlType === "List") {
                sDefaultLogic = "sap.m.MessageToast.show('You clicked ' + rowData.itemId);";
            } else if (sControlType === "Tree") {
                sDefaultLogic = "sap.m.MessageToast.show('You clicked ' + rowData.nodeId);";
            }

            aActions.push({ 
                actionId: "act_" + Date.now().toString().slice(-4), 
                label: "New Action", 
                icon: "sap-icon://action", 
                buttonType: "Default", 
                logic: sDefaultLogic 
            });
            
            oDialogModel.setProperty("/customActions", aActions);
        },
        onDeleteCustomAction: function (oController, oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aActions = oController.getView().getModel("dialog").getProperty("/customActions");
            aActions.splice(iIndex, 1);
            oController.getView().getModel("dialog").setProperty("/customActions", aActions);
        },
        onOpenCodeEditor: function (oController, oEvent) {
            var oContext = oEvent.getSource().getBindingContext("dialog");
            oController._sActiveActionContextPath = oContext.getPath();
            oController.getView().getModel("dialog").setProperty("/currentActionLogic", oContext.getProperty("logic"));
            oController.byId("codeEditorDialog").open();
        },
        onSaveCodeEditor: function (oController) {
            var oDialogModel = oController.getView().getModel("dialog");
            if (oController._sActiveActionContextPath) {
                oDialogModel.setProperty(oController._sActiveActionContextPath + "/logic", oDialogModel.getProperty("/currentActionLogic"));
            }
            oController.byId("codeEditorDialog").close();
            sap.m.MessageToast.show("JavaScript logic saved successfully!");
        },
        onCloseCodeEditor: function (oController) { oController.byId("codeEditorDialog").close(); }
    };
});