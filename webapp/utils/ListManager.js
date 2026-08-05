sap.ui.define([], function () {
    "use strict";

    return {
        onAddListItem: function (oController) {
            var oDialogModel = oController.getView().getModel("dialog");
            var aItems = oDialogModel.getProperty("/items") || [];
            aItems.push({ itemId: "item_" + Date.now(), title: "New List Item", description: "Enter details here", icon: "sap-icon://task", status: "None" });
            oDialogModel.setProperty("/items", aItems);
        },

        onDeleteListItem: function (oController, oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aItems = oController.getView().getModel("dialog").getProperty("/items");
            aItems.splice(iIndex, 1);
            oController.getView().getModel("dialog").setProperty("/items", aItems);
        },

        onDropDialogListItem: function (oController, oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = oController.getView().getModel("dialog");
            var aItems = oDialogModel.getProperty("/items");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedItem = aItems.splice(iDraggedIndex, 1)[0];
            aItems.splice(iNewIndex, 0, oMovedItem);
            oDialogModel.setProperty("/items", aItems);
        }
    };
});