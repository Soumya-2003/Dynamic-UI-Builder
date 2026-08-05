sap.ui.define([], function () {
    "use strict";

    return {
        onAddTreeNode: function (oController) {
            var oDialogModel = oController.getView().getModel("dialog");
            var aNodes = oDialogModel.getProperty("/flatNodes") || [];
            aNodes.push({ nodeId: "node_" + Date.now().toString().slice(-4), text: "New Node", parentId: "" });
            oDialogModel.setProperty("/flatNodes", aNodes);
        },

        onDeleteTreeNode: function (oController, oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aNodes = oController.getView().getModel("dialog").getProperty("/flatNodes");
            aNodes.splice(iIndex, 1);
            oController.getView().getModel("dialog").setProperty("/flatNodes", aNodes);
        },

        onDropDialogTreeNode: function (oController, oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = oController.getView().getModel("dialog");
            var aNodes = oDialogModel.getProperty("/flatNodes");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedNode = aNodes.splice(iDraggedIndex, 1)[0];
            aNodes.splice(iNewIndex, 0, oMovedNode);
            oDialogModel.setProperty("/flatNodes", aNodes);
        }
    };
});