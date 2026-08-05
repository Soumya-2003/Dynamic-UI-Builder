sap.ui.define([], function () {
    "use strict";
    return {
        onControlSelect: function (oController, oControl, oEvent) {
            if (oEvent && oEvent.stopPropagation) oEvent.stopPropagation();
            var sMetaId = oControl.data("metaId");
            var aControls = oController.getView().getModel("layout").getProperty("/controls");
            var oSelectedMetadata = oController._findNodeById(aControls, sMetaId);
            if (oSelectedMetadata) {
                oController.getView().getModel("selected").setData(oSelectedMetadata);
                oController._generatePropertiesUI(oSelectedMetadata);
            }
        },
        generatePropertiesUI: function (oController, oMetadata) {
            var oContainer = oController.byId("propertiesContainer");
            oContainer.destroyItems();
            var aIgnoredKeys = [
                "id", "type", "ui5Id", "columns", "rows", "items", "flatNodes", "customActions",
                "sortBy", "sortOrder", "enableSearch", "showSearch", "enableCustomActions", 
                "customActionsHeader", "inlineEditing", "stickyHeader", "alternateRowColors", "selectionMode"
            ];
            Object.keys(oMetadata).forEach(function (sKey) {
                if (aIgnoredKeys.indexOf(sKey) !== -1) return;
                var vValue = oMetadata[sKey];
                var sLabelText = sKey.charAt(0).toUpperCase() + sKey.slice(1);
                oContainer.addItem(new sap.m.Label({ text: sLabelText }));

                var oInputControl;
                if (sKey === "margin") {
                    oInputControl = new sap.m.Select({ selectedKey: "{selected>/" + sKey + "}", change: oController.onLivePropertyChange.bind(oController), items: [ new sap.ui.core.Item({ key: "None", text: "None" }), new sap.ui.core.Item({ key: "Tiny", text: "Tiny" }), new sap.ui.core.Item({ key: "Small", text: "Small" }), new sap.ui.core.Item({ key: "Medium", text: "Medium" }), new sap.ui.core.Item({ key: "Large", text: "Large" }) ] });
                } else if (sKey === "hAlign") {
                    oInputControl = new sap.m.Select({ selectedKey: "{selected>/" + sKey + "}", change: oController.onLivePropertyChange.bind(oController), items: [ new sap.ui.core.Item({ key: "Start", text: "Left (Start)" }), new sap.ui.core.Item({ key: "Center", text: "Center" }), new sap.ui.core.Item({ key: "End", text: "Right (End)" }) ] });
                } else if (typeof vValue === "boolean") {
                    oInputControl = new sap.m.CheckBox({ selected: "{selected>/" + sKey + "}", select: oController.onLivePropertyChange.bind(oController) });
                } else if (typeof vValue === "number") {
                    oInputControl = new sap.m.Input({ value: "{selected>/" + sKey + "}", type: "Number", change: oController.onLivePropertyChange.bind(oController) });
                } else {
                    oInputControl = new sap.m.Input({ value: "{selected>/" + sKey + "}", change: oController.onLivePropertyChange.bind(oController) });
                }
                oInputControl.addStyleClass("sapUiTinyMarginBottom");
                oContainer.addItem(oInputControl);
            });
        },
        onLivePropertyChange: function (oController) {
            var oSelectedData = oController.getView().getModel("selected").getData();
            if (!oSelectedData || !oSelectedData.id) return;
            var oLayoutModel = oController.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");
            var oResult = oController._findArrayAndIndex(aControls, oSelectedData.id);
            if (oResult) {
                oResult.array[oResult.index] = oSelectedData;
                oLayoutModel.setProperty("/controls", aControls);
                oController._renderCanvas();
                oController._saveState();
            }
        },
        onDeleteSelectedControl: function (oController) {
            var oSelectedData = oController.getView().getModel("selected").getData();
            if (!oSelectedData || !oSelectedData.id) return sap.m.MessageToast.show("Please select a control first.");
            var oLayoutModel = oController.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");
            var oResult = oController._findArrayAndIndex(aControls, oSelectedData.id);
            if (oResult) {
                oResult.array.splice(oResult.index, 1);
                oLayoutModel.setProperty("/controls", aControls);
                oController.getView().getModel("selected").setData({});
                oController.byId("propertiesContainer").destroyItems();
                oController._renderCanvas();
                sap.m.MessageToast.show("Control deleted successfully.");
                oController._saveState();
            }
        }
    };
});