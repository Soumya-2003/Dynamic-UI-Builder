sap.ui.define([
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Tree",
    "sap/m/StandardTreeItem"
], function (Table, Column, ColumnListItem, Label, Text, List, StandardListItem, Tree, StandardTreeItem) {
    "use strict";

    return {
        createControl: function (oMetadata) {
            var oControl;

            switch (oMetadata.type) {
                case "Table":
                    oControl = new Table({
                        headerText: oMetadata.headerText,
                        width: oMetadata.width,
                        growing: oMetadata.growing,
                        growingThreshold: oMetadata.growingThreshold,
                        mode: oMetadata.selectionMode || "None"
                    });

                    if (oMetadata.enableSearch) {
                        var oSearchField = new sap.m.SearchField({
                            placeholder: "Search register...",
                            width: "300px",
                            liveChange: function (oEvent) {
                                var sQuery = oEvent.getParameter("newValue").toLowerCase();
                                var aItems = oControl.getItems();

                                // Universal DOM filter: Checks every cell in the row
                                aItems.forEach(function (oItem) {
                                    var bMatch = false;
                                    oItem.getCells().forEach(function (oCell) {
                                        var sText = "";
                                        if (oCell.isA("sap.m.Text") || oCell.isA("sap.m.Label")) sText = oCell.getText();
                                        else if (oCell.isA("sap.m.Input")) sText = oCell.getValue();

                                        if (sText.toLowerCase().indexOf(sQuery) > -1) {
                                            bMatch = true;
                                        }
                                    });
                                    oItem.setVisible(bMatch); // Hide/Show row natively
                                });
                            }
                        });

                        oControl.setHeaderToolbar(new sap.m.Toolbar({
                            content: [
                                new sap.m.Title({ text: oMetadata.headerText || "Table" }),
                                new sap.m.ToolbarSpacer(),
                                oSearchField
                            ]
                        }));
                    } else {
                        oControl.setHeaderText(oMetadata.headerText || "Table");
                    }

                    // 1. DYNAMIC COLUMNS (Single Loop)
                    if (oMetadata.columns) {
                        oMetadata.columns.forEach(function (col) {
                            oControl.addColumn(new Column({
                                header: new Label({ text: col.name }),
                                width: col.width || "auto"
                            }));
                        });
                    }

                    if (oMetadata.enableActions) {
                        oControl.addColumn(new Column({
                            header: new Label({ text: "Actions" }),
                            hAlign: "End",
                            width: "100px"
                        }));
                    }

                    if (oMetadata.enableCustomActions && oMetadata.customActions && oMetadata.customActions.length > 0) {
                        oControl.addColumn(new Column({
                            header: new Label({ text: oMetadata.customActionsHeader || "Custom Actions" }),
                            hAlign: "End",
                            width: "auto"
                        }));
                    }

                    // 2. SORTING ENGINE
                    var aRowsToRender = oMetadata.rows ? oMetadata.rows.slice() : [];

                    if (oMetadata.sortBy && oMetadata.sortBy !== "None") {
                        aRowsToRender.sort(function (a, b) {
                            var valA = (a[oMetadata.sortBy] || "").toString().toLowerCase();
                            var valB = (b[oMetadata.sortBy] || "").toString().toLowerCase();

                            if (valA < valB) return oMetadata.sortOrder === "Desc" ? 1 : -1;
                            if (valA > valB) return oMetadata.sortOrder === "Desc" ? -1 : 1;
                            return 0;
                        });
                    }

                    // 3. DYNAMIC ROWS (Single Loop)
                    if (aRowsToRender.length > 0) {
                        aRowsToRender.forEach(function (rowData) {
                            var aCells = [];

                            // Standard Data Cells
                            if (oMetadata.columns) {
                                oMetadata.columns.forEach(function (col, index) {
                                    var sKey = "col" + (index + 1);
                                    if (oMetadata.inlineEditing) {
                                        aCells.push(new sap.m.Input({ value: rowData[sKey] || "" }));
                                    } else {
                                        aCells.push(new sap.m.Text({ text: rowData[sKey] || "" }));
                                    }
                                });
                            }

                            if (oMetadata.enableActions) {
                                var oActionBox = new sap.m.HBox({
                                    justifyContent: "End",
                                    items: [
                                        new sap.m.Button({ icon: "sap-icon://edit", type: "Transparent", tooltip: "Edit Entry" }).addStyleClass("sapUiTinyMarginEnd"),
                                        new sap.m.Button({ icon: "sap-icon://delete", type: "Transparent", tooltip: "Delete Entry" })
                                    ]
                                });
                                aCells.push(oActionBox);
                            }

                            if (oMetadata.enableCustomActions && oMetadata.customActions && oMetadata.customActions.length > 0) {
                                var aCustomButtons = oMetadata.customActions.map(function(act) {
                                    return new sap.m.Button({
                                        text: act.label,
                                        icon: act.icon,
                                        type: act.buttonType,
                                        press: function() {
                                            try {
                                                var fnCustomLogic = new Function("rowData", act.logic);
                                                fnCustomLogic(rowData); 
                                            } catch (e) {
                                                sap.m.MessageToast.show("Custom Logic Error: " + e.message);
                                                console.error("Logic Error:", e);
                                            }
                                        }
                                    }).addStyleClass("sapUiTinyMarginEnd");
                                });

                                var oCustomActionBox = new sap.m.HBox({
                                    justifyContent: "End",
                                    items: aCustomButtons
                                });
                                
                                aCells.push(oCustomActionBox);
                            }

                            oControl.addItem(new ColumnListItem({
                                cells: aCells,
                                highlight: rowData.status || "None"
                            }));
                        });
                    }
                    break;

                case "List":
                    oControl = new List({
                        headerText: oMetadata.headerText,
                        width: oMetadata.width,
                        growing: oMetadata.growing,
                        mode: oMetadata.selectionMode || "None"
                    });

                    if (oMetadata.items) {
                        oMetadata.items.forEach(function (itemData) {

                            var sInfoState = itemData.status && itemData.status !== "None" ? itemData.status : "None";
                            var sInfoText = itemData.status && itemData.status !== "None" ? itemData.status : "";

                            oControl.addItem(new StandardListItem({
                                title: itemData.title,
                                description: itemData.description,
                                icon: itemData.icon || "sap-icon://task",
                                info: sInfoText,
                                infoState: sInfoState
                            }));
                        });
                    }
                    break;

                case "Tree":
                    oControl = new Tree({
                        headerText: oMetadata.headerText || "Hierarchical Tree",
                        width: oMetadata.width || "100%",
                        mode: oMetadata.selectionMode || "None"
                    });

                    if (oMetadata.flatNodes && oMetadata.flatNodes.length > 0) {
                        var aNestedNodes = [];
                        var oMap = {};

                        oMetadata.flatNodes.forEach(function (node) {
                            oMap[node.nodeId] = { text: node.text, nodes: [] };
                        });

                        oMetadata.flatNodes.forEach(function (node) {
                            if (node.parentId && oMap[node.parentId]) {
                                oMap[node.parentId].nodes.push(oMap[node.nodeId]);
                            } else {
                                aNestedNodes.push(oMap[node.nodeId]);
                            }
                        });

                        var oTreeModel = new sap.ui.model.json.JSONModel({ rootNodes: aNestedNodes });
                        oControl.setModel(oTreeModel, "treeData");

                        oControl.bindItems({
                            path: "treeData>/rootNodes",
                            template: new sap.m.StandardTreeItem({ title: "{treeData>text}" }),
                            parameters: { arrayNames: ["nodes"] }
                        });
                    }
                    break;

                case "Button": oControl = new sap.m.Button(); break;
                case "Input": oControl = new sap.m.Input(); break;
                case "CheckBox": oControl = new sap.m.CheckBox(); break;
                case "Label": oControl = new sap.m.Label(); break;
                case "TextArea": oControl = new sap.m.TextArea(); break;
                case "ComboBox": oControl = new sap.m.ComboBox(); break;
                case "DatePicker": oControl = new sap.m.DatePicker(); break;
                case "Switch": oControl = new sap.m.Switch(); break;
                case "Slider": oControl = new sap.m.Slider(); break;
                case "Progress Indicator": oControl = new sap.m.ProgressIndicator(); break;

                default:
                    oControl = new sap.m.Text({ text: oMetadata.type || "Control" });
                    break;
            }

            if (oControl) {
                var aIgnoredKeys = [
                    "id", "type", "ui5Id",
                    "columns", "rows", "items", "nodes", "flatNodes", "customActions", 
                    "stickyHeader", "alternateRowColors", "selectionMode", "inlineEditing",
                    "enableSearch", "enableActions", "enableCustomActions", "customActionsHeader", "sortBy", "sortOrder"
                ];

                Object.keys(oMetadata).forEach(function (sKey) {
                    if (aIgnoredKeys.indexOf(sKey) === -1) {
                        try {
                            if (oControl.setProperty) {
                                oControl.setProperty(sKey, oMetadata[sKey]);
                            }
                        } catch (e) {
                        }
                    }
                });
            }

            return oControl;
        }
    };
});