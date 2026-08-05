sap.ui.define([], function () {
    "use strict";

    return {
        onAddColumn: function (oController) {
            var oDialogModel = oController.getView().getModel("dialog");
            var aColumns = oDialogModel.getProperty("/columns") || [];
            aColumns.push({ columnId: "col" + (aColumns.length + 1) + "_" + Date.now().toString().slice(-4), name: "New Column", width: "auto" });
            oDialogModel.setProperty("/columns", aColumns);
        },

        onDeleteColumn: function (oController, oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aColumns = oController.getView().getModel("dialog").getProperty("/columns");
            aColumns.splice(iIndex, 1);
            oController.getView().getModel("dialog").setProperty("/columns", aColumns);
        },

        onDuplicateColumn: function (oController, oEvent) {
            var oColumnData = oEvent.getSource().getParent().getBindingContext("dialog").getObject();
            var oDialogModel = oController.getView().getModel("dialog");
            var aColumns = oDialogModel.getProperty("/columns");
            var oClonedColumn = JSON.parse(JSON.stringify(oColumnData));
            
            oClonedColumn.columnId = "col" + (aColumns.length + 1) + "_" + Date.now().toString().slice(-4);
            oClonedColumn.name = oClonedColumn.name + " (Copy)";
            aColumns.push(oClonedColumn);
            oDialogModel.setProperty("/columns", aColumns);
        },

        onAddRow: function (oController) {
            var oDialogModel = oController.getView().getModel("dialog");
            var aRows = oDialogModel.getProperty("/rows") || [];
            aRows.push({ rowId: "row_" + Date.now().toString().slice(-4), col1: "New Data", col2: "New Data", col3: "New Data" });
            oDialogModel.setProperty("/rows", aRows);
        },

        onDeleteRow: function (oController, oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aRows = oController.getView().getModel("dialog").getProperty("/rows");
            aRows.splice(iIndex, 1);
            oController.getView().getModel("dialog").setProperty("/rows", aRows);
        },

        onDropDialogColumn: function (oController, oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = oController.getView().getModel("dialog");
            var aColumns = oDialogModel.getProperty("/columns");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedColumn = aColumns.splice(iDraggedIndex, 1)[0];
            aColumns.splice(iNewIndex, 0, oMovedColumn);
            oDialogModel.setProperty("/columns", aColumns);
        },

        onDropDialogRow: function (oController, oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = oController.getView().getModel("dialog");
            var aRows = oDialogModel.getProperty("/rows");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedRow = aRows.splice(iDraggedIndex, 1)[0];
            aRows.splice(iNewIndex, 0, oMovedRow);
            oDialogModel.setProperty("/rows", aRows);
        }
    };
});