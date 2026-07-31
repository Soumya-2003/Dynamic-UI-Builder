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

                    // 1. DYNAMIC COLUMNS (Single Loop)
                    if (oMetadata.columns) {
                        oMetadata.columns.forEach(function (col) {
                            oControl.addColumn(new Column({
                                header: new Label({ text: col.name }),
                                width: col.width || "auto"
                            }));
                        });
                    }

                    // 2. SORTING ENGINE
                    var aRowsToRender = oMetadata.rows ? oMetadata.rows.slice() : [];
                    
                    if (oMetadata.sortBy && oMetadata.sortBy !== "None") {
                        aRowsToRender.sort(function(a, b) {
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
                            
                            // Map the "status" text to standard UI5 ValueStates
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
                        // 1. Establish the mapping variables
                        var aNestedNodes = [];
                        var oMap = {};

                        // 2. Create a dictionary map of all nodes and prepare their child arrays
                        oMetadata.flatNodes.forEach(function(node) {
                            oMap[node.nodeId] = { text: node.text, nodes: [] };
                        });

                        // 3. Loop through again and push children into their parent's arrays!
                        oMetadata.flatNodes.forEach(function(node) {
                            if (node.parentId && oMap[node.parentId]) {
                                // If it has a parent, push it into the parent's nodes array
                                oMap[node.parentId].nodes.push(oMap[node.nodeId]);
                            } else {
                                // If it has no parent, it is a Root Node
                                aNestedNodes.push(oMap[node.nodeId]);
                            }
                        });

                        // 4. Create an isolated JSON Model specifically for this Tree instance
                        var oTreeModel = new sap.ui.model.json.JSONModel({ rootNodes: aNestedNodes });
                        oControl.setModel(oTreeModel, "treeData");

                        // 5. Native UI5 Tree Binding with array nesting parameters
                        oControl.bindItems({
                            path: "treeData>/rootNodes",
                            template: new sap.m.StandardTreeItem({ title: "{treeData>text}" }),
                            parameters: { arrayNames: ["nodes"] } // Tells UI5 to look for children inside the 'nodes' array
                        });
                    }
                    break;

                // Standard controls fallback
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

            // Apply all initial metadata properties dynamically
            if (oControl) {
                // FIX: Added custom structural keys to the ignore list so setProperty doesn't crash
                var aIgnoredKeys = [
                    "id", "type", "ui5Id", 
                    "columns", "rows", "items", "nodes", // Ignore data aggregations
                    "stickyHeader", "alternateRowColors", "selectionMode" // Ignore custom builder flags
                ];
                
                Object.keys(oMetadata).forEach(function(sKey) {
                    if (aIgnoredKeys.indexOf(sKey) === -1) {
                        try {
                            if (oControl.setProperty) {
                                oControl.setProperty(sKey, oMetadata[sKey]);
                            }
                        } catch (e) {
                            // Silently ignore properties the control doesn't support
                        }
                    }
                });
            }

            return oControl;
        }
    };
});