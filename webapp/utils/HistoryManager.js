sap.ui.define([], function () {
    "use strict";
    return {
        saveState: function (oController) {
            clearTimeout(oController._stateTimeout);
            oController._stateTimeout = setTimeout(function () {
                var aControls = oController.getView().getModel("layout").getProperty("/controls");
                var sState = JSON.stringify(aControls || []);
                if (oController._aHistoryStack[oController._aHistoryStack.length - 1] !== sState) {
                    oController._aHistoryStack.push(sState);
                    oController._aRedoStack = [];
                }
            }, 500);
        },
        onUndo: function (oController) {
            if (oController._aHistoryStack.length > 1) {
                var sCurrentState = oController._aHistoryStack.pop();
                oController._aRedoStack.push(sCurrentState);
                var sPreviousState = oController._aHistoryStack[oController._aHistoryStack.length - 1];
                oController.getView().getModel("layout").setProperty("/controls", JSON.parse(sPreviousState));
                oController.getView().getModel("selected").setData({});
                oController.byId("propertiesContainer").destroyItems();
                oController._renderCanvas();
                sap.m.MessageToast.show("Action Undone");
            } else {
                sap.m.MessageToast.show("Nothing to undo.");
            }
        },
        onRedo: function (oController) {
            if (oController._aRedoStack.length > 0) {
                var sNextState = oController._aRedoStack.pop();
                oController._aHistoryStack.push(sNextState);
                oController.getView().getModel("layout").setProperty("/controls", JSON.parse(sNextState));
                oController.getView().getModel("selected").setData({});
                oController.byId("propertiesContainer").destroyItems();
                oController._renderCanvas();
                sap.m.MessageToast.show("Action Redone");
            } else {
                sap.m.MessageToast.show("Nothing to redo.");
            }
        }
    };
});