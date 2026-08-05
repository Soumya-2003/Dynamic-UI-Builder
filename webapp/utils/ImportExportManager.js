sap.ui.define([], function () {
    "use strict";
    return {
        onTriggerCSVImport: function () {
            var oFileUploader = document.getElementById("csvUploader");
            if (oFileUploader) oFileUploader.click();
        },
        parseCSV: function (oController, sCSVText) {
            var aLines = sCSVText.split("\n").filter(function (line) { return line.trim() !== ""; });
            if (aLines.length < 2) return sap.m.MessageToast.show("Invalid CSV: Must have headers and at least one row of data.");
            var oDialogModel = oController.getView().getModel("dialog");
            var sControlType = oDialogModel.getProperty("/type");
            var aHeaders = aLines[0].split(",").map(function (h) { return h.trim(); });

            if (sControlType === "Table") {
                var aNewColumns = []; var aNewRows = [];
                aHeaders.forEach(function (sHeader, index) { aNewColumns.push({ columnId: "col" + (index + 1), name: sHeader, width: "auto" }); });
                for (var i = 1; i < aLines.length; i++) {
                    var aDataTbl = aLines[i].split(",");
                    var oRowData = { rowId: "row_" + i, status: "None" };
                    aNewColumns.forEach(function (oCol, index) { oRowData[oCol.columnId] = aDataTbl[index] ? aDataTbl[index].trim() : ""; });
                    aNewRows.push(oRowData);
                }
                oDialogModel.setProperty("/columns", aNewColumns); oDialogModel.setProperty("/rows", aNewRows);
            } else if (sControlType === "List") {
                var aNewItems = [];
                for (var j = 1; j < aLines.length; j++) {
                    var aDataList = aLines[j].split(",");
                    aNewItems.push({ itemId: "item_" + Date.now() + "_" + j, title: aDataList[0] ? aDataList[0].trim() : "New Item", description: aDataList[1] ? aDataList[1].trim() : "", icon: aDataList[2] ? aDataList[2].trim() : "sap-icon://task", status: aDataList[3] ? aDataList[3].trim() : "None" });
                }
                oDialogModel.setProperty("/items", aNewItems);
            } else if (sControlType === "Tree") {
                var aNewNodes = [];
                for (var k = 1; k < aLines.length; k++) {
                    var aDataTree = aLines[k].split(",");
                    aNewNodes.push({ nodeId: aDataTree[0] ? aDataTree[0].trim() : "node_" + Date.now() + "_" + k, text: aDataTree[1] ? aDataTree[1].trim() : "New Node", parentId: aDataTree[2] ? aDataTree[2].trim() : "" });
                }
                oDialogModel.setProperty("/flatNodes", aNewNodes);
            }
            document.getElementById("csvUploader").value = "";
            sap.m.MessageToast.show(sControlType + " data imported successfully!");
        },
        onViewJson: function (oController) {
            var aControls = oController.getView().getModel("layout").getProperty("/controls");
            oController.getView().getModel("dialog").setProperty("/jsonString", JSON.stringify(aControls, null, 4));
            oController.byId("jsonDialog").open();
        },
        onApplyJson: function (oController) {
            try {
                var aParsedData = JSON.parse(oController.getView().getModel("dialog").getProperty("/jsonString"));
                oController.getView().getModel("layout").setProperty("/controls", aParsedData);
                oController._renderCanvas();
                oController.byId("jsonDialog").close();
                sap.m.MessageToast.show("Layout successfully updated!");
                oController._saveState();
            } catch (e) { sap.m.MessageToast.show("Failed to apply changes. Check console for details."); }
        },
        onCloseJson: function (oController) { oController.byId("jsonDialog").close(); },
        onExport: function (oController) {
            var oBlob = new Blob([oController.getView().getModel("layout").getJSON()], { type: "application/json" });
            var oLink = document.createElement("a");
            oLink.href = URL.createObjectURL(oBlob);
            oLink.download = "MyDynamicLayout.json";
            document.body.appendChild(oLink); oLink.click(); document.body.removeChild(oLink);
        }
    };
});