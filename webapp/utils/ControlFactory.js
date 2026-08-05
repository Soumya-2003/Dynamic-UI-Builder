sap.ui.define([
    "sap/m/Table",
    "sap/m/Column",
    "sap/m/ColumnListItem",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/List",
    "sap/m/StandardListItem",
    "sap/m/Tree",
    "sap/m/StandardTreeItem",
    "sap/ui/layout/form/SimpleForm"
], function (Table, Column, ColumnListItem, Label, Text, List, StandardListItem, Tree, StandardTreeItem, SimpleForm) {
    "use strict";

    return {
        createControl: function (oMetadata) {
            var oControl;

            switch (oMetadata.type) {
                case "Table":
                    oControl = new Table({
                        width: oMetadata.width || "100%",
                        mode: oMetadata.selectionMode || "None",
                        growing: oMetadata.growing === true,
                        growingThreshold: parseInt(oMetadata.growingThreshold) || 10,
                        sticky: oMetadata.stickyHeader ? ["ColumnHeaders", "HeaderToolbar"] : [],
                        alternateRowColors: oMetadata.alternateRowColors === true
                    });

                    var aToolbarContent = [
                        new sap.m.Title({ text: oMetadata.headerText || "Table" }),
                        new sap.m.ToolbarSpacer()
                    ];

                    if (oMetadata.enableSearch) {
                        aToolbarContent.push(new sap.m.SearchField({
                            placeholder: "Search table...",
                            width: "250px",
                            liveChange: function (oEvent) {
                                var sQuery = oEvent.getParameter("newValue").toLowerCase();
                                var oBinding = oControl.getBinding("items");
                                if (oBinding) {
                                    var aFilters = oMetadata.columns.map(function(col) {
                                        return new sap.ui.model.Filter(col.columnId, sap.ui.model.FilterOperator.Contains, sQuery);
                                    });
                                    oBinding.filter(new sap.ui.model.Filter({ filters: aFilters, and: false }));
                                }
                            }
                        }));
                    }

                    // if (oMetadata.selectionMode === "MultiSelect") {
                    //     aToolbarContent.push(new sap.m.Button({
                    //         text: "Delete Selected",
                    //         icon: "sap-icon://delete",
                    //         type: "Reject",
                    //         press: function () {
                    //             var aSelected = oControl.getSelectedItems();
                    //             if (aSelected.length === 0) return sap.m.MessageToast.show("Select a row.");
                    //             aSelected.forEach(function (oItem) { oControl.removeItem(oItem); });
                    //         }
                    //     }));
                    // }

                    if (aToolbarContent.length > 2) oControl.setHeaderToolbar(new sap.m.Toolbar({ content: aToolbarContent }));
                    else oControl.setHeaderText(oMetadata.headerText || "Table");

                    if (oMetadata.columns) {
                        oMetadata.columns.forEach(function (col) {
                            oControl.addColumn(new sap.m.Column({ header: new sap.m.Label({ text: col.name }), width: col.width || "auto" }));
                        });
                    }
                    if (oMetadata.enableCustomActions && oMetadata.customActions && oMetadata.customActions.length > 0) {
                        oControl.addColumn(new sap.m.Column({ header: new sap.m.Label({ text: oMetadata.customActionsHeader || "Actions" }), hAlign: "End", width: "auto" }));
                    }

                    // BINDING ENGINE FOR TABLE
                    var aRowsToRender = oMetadata.rows ? oMetadata.rows.slice() : [];
                    aRowsToRender.sort(function (a, b) {
                            var rawA = a[oMetadata.sortBy];
                            var rawB = b[oMetadata.sortBy];
                            
                            if (rawA === undefined || rawA === null) rawA = "";
                            if (rawB === undefined || rawB === null) rawB = "";

                            // Attempt to parse as numbers
                            var numA = parseFloat(rawA);
                            var numB = parseFloat(rawB);

                            // If BOTH values are valid numbers, do a Mathematical Sort
                            if (!isNaN(numA) && !isNaN(numB)) {
                                if (numA < numB) return oMetadata.sortOrder === "Desc" ? 1 : -1;
                                if (numA > numB) return oMetadata.sortOrder === "Desc" ? -1 : 1;
                                return 0;
                            } 
                            // Otherwise, fallback to Alphabetical String Sort
                            else {
                                var strA = rawA.toString().toLowerCase();
                                var strB = rawB.toString().toLowerCase();
                                if (strA < strB) return oMetadata.sortOrder === "Desc" ? 1 : -1;
                                if (strA > strB) return oMetadata.sortOrder === "Desc" ? -1 : 1;
                                return 0;
                            }
                        });

                    oControl.setModel(new sap.ui.model.json.JSONModel({ items: aRowsToRender }), "dataModel");
                    oControl.bindItems({
                        path: "dataModel>/items",
                        factory: function(sId, oContext) {
                            var rowData = oContext.getObject();
                            var aCells = [];
                            if (oMetadata.columns) {
                                oMetadata.columns.forEach(function (col) {
                                    aCells.push(oMetadata.inlineEditing ? new sap.m.Input({ value: rowData[col.columnId] || "" }) : new sap.m.Text({ text: rowData[col.columnId] || "" }));
                                });
                            }
                            if (oMetadata.enableCustomActions && oMetadata.customActions && oMetadata.customActions.length > 0) {
                                var aCustomButtons = oMetadata.customActions.map(function (act) {
                                    return new sap.m.Button({
                                        text: act.label, icon: act.icon, type: act.buttonType,
                                        press: function () { eval(act.logic); }
                                    }).addStyleClass("sapUiTinyMarginEnd");
                                });
                                aCells.push(new sap.m.HBox({ justifyContent: "End", items: aCustomButtons }));
                            }
                            var oListItem = new sap.m.ColumnListItem({ cells: aCells });
                            if (rowData.status && rowData.status !== "None") oListItem.setHighlight(rowData.status);
                            return oListItem;
                        }
                    });
                    break;

                case "List":
                    oControl = new sap.m.List({
                        width: "100%",
                        mode: oMetadata.selectionMode || "None",
                        growing: oMetadata.growing === true,
                        growingThreshold: parseInt(oMetadata.growingThreshold) || 10,
                        sticky: oMetadata.stickyHeader ? ["HeaderToolbar"] : []
                    });


                    var aListToolbar = [
                        new sap.m.Title({ text: oMetadata.headerText || "List" }),
                        new sap.m.ToolbarSpacer()
                    ];

                    if (oMetadata.enableSearch || oMetadata.showSearch) {
                        aListToolbar.push(new sap.m.SearchField({
                            placeholder: "Search list...",
                            width: "250px",
                            liveChange: function (oEvent) {
                                var sQuery = oEvent.getParameter("newValue");
                                var oBinding = oControl.getBinding("items");
                                
                                if (oBinding) {
                                    // Search across both Title and Description
                                    var oFilterTitle = new sap.ui.model.Filter({ path: "title", operator: sap.ui.model.FilterOperator.Contains, value1: sQuery, caseSensitive: false });
                                    var oFilterDesc = new sap.ui.model.Filter({ path: "description", operator: sap.ui.model.FilterOperator.Contains, value1: sQuery, caseSensitive: false });
                                    
                                    oBinding.filter(new sap.ui.model.Filter({ filters: [oFilterTitle, oFilterDesc], and: false }));
                                }
                            }
                        }));
                    }

                    if (aListToolbar.length > 2) {
                        oControl.setHeaderToolbar(new sap.m.Toolbar({ content: aListToolbar }));
                    } else {
                        oControl.setHeaderText(oMetadata.headerText || "List");
                    }

                    var aItemsToRender = oMetadata.items ? oMetadata.items.slice() : [];
                    
                    if (oMetadata.sortBy && oMetadata.sortBy !== "None") {
                        aItemsToRender.sort(function (a, b) {
                            var rawA = a[oMetadata.sortBy];
                            var rawB = b[oMetadata.sortBy];
                            
                            if (rawA === undefined || rawA === null) rawA = "";
                            if (rawB === undefined || rawB === null) rawB = "";

                            // Attempt to parse as numbers
                            var numA = parseFloat(rawA);
                            var numB = parseFloat(rawB);

                            // If BOTH values are valid numbers, do a Mathematical Sort
                            if (!isNaN(numA) && !isNaN(numB)) {
                                if (numA < numB) return oMetadata.sortOrder === "Desc" ? 1 : -1;
                                if (numA > numB) return oMetadata.sortOrder === "Desc" ? -1 : 1;
                                return 0;
                            } 
                            // Otherwise, fallback to Alphabetical String Sort
                            else {
                                var strA = rawA.toString().toLowerCase();
                                var strB = rawB.toString().toLowerCase();
                                if (strA < strB) return oMetadata.sortOrder === "Desc" ? 1 : -1;
                                if (strA > strB) return oMetadata.sortOrder === "Desc" ? -1 : 1;
                                return 0;
                            }
                        });
                    }

                    oControl.setModel(new sap.ui.model.json.JSONModel({ items: aItemsToRender }), "dataModel");
                    oControl.bindItems({
                        path: "dataModel>/items",
                        factory: function(sId, oContext) {
                            var rowData = oContext.getObject();
                            if (oMetadata.enableCustomActions && oMetadata.customActions && oMetadata.customActions.length > 0) {
                                var aActionButtons = oMetadata.customActions.map(function(act) {
                                    return new sap.m.Button({ icon: act.icon, text: act.label, type: act.buttonType, press: function() { eval(act.logic); } }).addStyleClass("sapUiTinyMarginBegin");
                                });
                                var oCustomContent = new sap.m.HBox({
                                    justifyContent: "SpaceBetween", alignItems: "Center", width: "100%",
                                    items: [
                                        new sap.m.HBox({ alignItems: "Center", items: [ new sap.ui.core.Icon({ src: rowData.icon, size: "1.5rem" }).addStyleClass("sapUiSmallMarginEnd"), new sap.m.VBox({ items: [ new sap.m.Title({ text: rowData.title }), new sap.m.Text({ text: rowData.description }) ] }) ] }).addStyleClass("sapUiSmallMargin"),
                                        new sap.m.HBox({ items: aActionButtons }).addStyleClass("sapUiSmallMarginEnd")
                                    ]
                                });
                                var oCustomListItem = new sap.m.CustomListItem({ content: [oCustomContent] });
                                if (rowData.status && rowData.status !== "None") oCustomListItem.setHighlight(rowData.status);
                                return oCustomListItem;
                            } else {
                                var oStandardItem = new sap.m.StandardListItem({ title: rowData.title, description: rowData.description, icon: rowData.icon });
                                if (rowData.status && rowData.status !== "None") oStandardItem.setHighlight(rowData.status);
                                return oStandardItem;
                            }
                        }
                    });
                    break;

                case "Tree":
                    oControl = new sap.m.Tree({
                        width: "100%",
                        mode: oMetadata.selectionMode || "None"
                    });

                    // TREE ALGORITHM FIX: Convert Flat JSON to Nested JSON for SAP Model Binding!
                    var aFlatNodes = oMetadata.flatNodes || [];
                    var buildNested = function(parentId) {
                        return aFlatNodes.filter(function(n) { return (n.parentId || "") === (parentId || ""); }).map(function(n) {
                            var oNode = Object.assign({}, n);
                            oNode.children = buildNested(n.nodeId);
                            return oNode;
                        });
                    };

                    // BINDING ENGINE FOR TREE
                    oControl.setModel(new sap.ui.model.json.JSONModel({ nodes: buildNested("") }), "dataModel");
                    oControl.bindItems({
                        path: "dataModel>/nodes",
                        parameters: { arrayNames: ["children"] },
                        factory: function(sId, oContext) {
                            var rowData = oContext.getObject();
                            if (oMetadata.enableCustomActions && oMetadata.customActions && oMetadata.customActions.length > 0) {
                                var aActionButtons = oMetadata.customActions.map(function(act) {
                                    return new sap.m.Button({ icon: act.icon, type: act.buttonType, press: function() { eval(act.logic); } }).addStyleClass("sapUiTinyMarginBegin");
                                });
                                var oCustomTreeContent = new sap.m.HBox({
                                    justifyContent: "SpaceBetween", alignItems: "Center", width: "100%",
                                    items: [ new sap.m.Text({ text: rowData.text }), new sap.m.HBox({ items: aActionButtons }) ]
                                });
                                return new sap.m.CustomTreeItem({ content: [oCustomTreeContent] });
                            } else {
                                return new sap.m.StandardTreeItem({ title: rowData.text });
                            }
                        }
                    });
                    break;

                case "Panel":
                    oControl = new sap.m.Panel({
                        headerText: oMetadata.headerText || "Panel",
                        expandable: true,
                        expanded: true
                    });
                    break;
                case "VBox":
                    oControl = new sap.m.VBox();
                    break;
                case "HBox":
                    oControl = new sap.m.HBox();
                    break;
                case "SimpleForm":
                    oControl = new SimpleForm({
                        title: oMetadata.headerText || "Form",
                        layout: "ResponsiveGridLayout",
                        editable: true
                    });
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