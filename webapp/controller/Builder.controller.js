sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../utils/ControlFactory",
    "../utils/ControlMetadataFactory"
], function (Controller, JSONModel, ControlFactory, ControlMetadataFactory) {
    "use strict";

    return Controller.extend("dynamicuibuilder.controller.Builder", {
        onInit: function () {
            var oData = { controls: [] };
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "layout");

            var oSelectedModel = new JSONModel({});
            this.getView().setModel(oSelectedModel, "selected");

            var oDialogModel = new JSONModel({ jsonString: "" });
            this.getView().setModel(oDialogModel, "dialog");

            var that = this;
            window.handleCSVUpload = function (event) {
                var file = event.target.files[0];
                if (!file) return;

                var reader = new FileReader();
                reader.onload = function (e) {
                    var text = e.target.result;
                    that._parseCSV(text);
                };
                reader.readAsText(file);
            };

            this._aHistoryStack = [JSON.stringify([])];
            this._aRedoStack = [];
        },

        _findArrayAndIndex: function (aNodes, sId) {
            for (var i = 0; i < aNodes.length; i++) {
                if (aNodes[i].id.toString() === sId.toString()) return { array: aNodes, index: i };
                // If this node has a controls array, search deeper!
                if (aNodes[i].controls) {
                    var oResult = this._findArrayAndIndex(aNodes[i].controls, sId);
                    if (oResult) return oResult;
                }
            }
            return null;
        },

        _findNodeById: function (aNodes, sId) {
            var oResult = this._findArrayAndIndex(aNodes, sId);
            return oResult ? oResult.array[oResult.index] : null;
        },

        onDeviceSwitch: function (oEvent) {
            var sWidth = oEvent.getParameter("item").getKey();
            var oCanvas = this.byId("canvas");
            
            oCanvas.setWidth(sWidth);
            
            if (sWidth !== "100%") {
                oCanvas.addStyleClass("sapUiAutoMarginLeft").addStyleClass("sapUiAutoMarginRight");
            } else {
                oCanvas.removeStyleClass("sapUiAutoMarginLeft").removeStyleClass("sapUiAutoMarginRight");
            }
        },

        _saveState: function () {
            clearTimeout(this._stateTimeout);
            this._stateTimeout = setTimeout(function () {
                var aControls = this.getView().getModel("layout").getProperty("/controls");
                var sState = JSON.stringify(aControls || []);
                
                
                if (this._aHistoryStack[this._aHistoryStack.length - 1] !== sState) {
                    this._aHistoryStack.push(sState);
                    this._aRedoStack = []; 
                }
            }.bind(this), 500);
        },

        onUndo: function () {
            if (this._aHistoryStack.length > 1) {
                var sCurrentState = this._aHistoryStack.pop();
                this._aRedoStack.push(sCurrentState); 
                
                var sPreviousState = this._aHistoryStack[this._aHistoryStack.length - 1];
                this.getView().getModel("layout").setProperty("/controls", JSON.parse(sPreviousState));
                
                this.getView().getModel("selected").setData({});
                this.byId("propertiesContainer").destroyItems();
                this._renderCanvas();
                sap.m.MessageToast.show("Action Undone");
            } else {
                sap.m.MessageToast.show("Nothing to undo.");
            }
        },

        onRedo: function () {
            if (this._aRedoStack.length > 0) {
                var sNextState = this._aRedoStack.pop();
                this._aHistoryStack.push(sNextState); 
                
                this.getView().getModel("layout").setProperty("/controls", JSON.parse(sNextState));
                
                this.getView().getModel("selected").setData({});
                this.byId("propertiesContainer").destroyItems();
                this._renderCanvas();
                sap.m.MessageToast.show("Action Redone");
            } else {
                sap.m.MessageToast.show("Nothing to redo.");
            }
        },

        onDrop: function (oEvent) {
            var oDraggedControl = oEvent.getParameter("draggedControl");
            var oDroppedControl = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oModel = this.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls") || [];

            var getMetaId = function (oCtrl) {
                while (oCtrl && typeof oCtrl.data === "function") {
                    var sId = oCtrl.data("metaId");
                    if (sId) return sId.toString();
                    oCtrl = oCtrl.getParent ? oCtrl.getParent() : null;
                }
                return null;
            };

            var sDroppedMetaId = getMetaId(oDroppedControl);

            if (oDraggedControl.isA("sap.m.StandardListItem")) {
                var oMetadata = ControlMetadataFactory.getMetadata(oDraggedControl.getTitle());
                
                if (!sDroppedMetaId) {
                    aControls.push(oMetadata); 
                } else {
                    if (sDropPosition === "On") {
                        var oTargetNode = this._findNodeById(aControls, sDroppedMetaId);
                        if (oTargetNode && oTargetNode.controls) oTargetNode.controls.push(oMetadata);
                    } else {
                        var oResult = this._findArrayAndIndex(aControls, sDroppedMetaId);
                        if (oResult) {
                            var iNewIndex = oResult.index + (sDropPosition === "After" ? 1 : 0);
                            oResult.array.splice(iNewIndex, 0, oMetadata);
                        }
                    }
                }
            }

            oModel.setProperty("/controls", aControls);
            this._renderCanvas();
            this._saveState();
        },

        _buildControlTree: function(oMetadata) {
            var oInnerControl = ControlFactory.createControl(oMetadata);
            if (!oInnerControl) return null;

            if (oMetadata.customCssClass) oInnerControl.addStyleClass(oMetadata.customCssClass);

            // 1. EXACT SIZING: Applied directly to the control (No margins here = no overflow!)
            if (oInnerControl.setWidth) { 
                try { oInnerControl.setWidth(oMetadata.width || "100%"); } catch (e) {} 
            }

            // 2. THE MASTER WRAPPER: VBox handles horizontal alignment flawlessly via 'alignItems'
            var oSizingWrapper = new sap.m.VBox({
                width: "auto", // Prevents margin overflow
                height: oMetadata.height || "auto",
                alignItems: oMetadata.hAlign || "Start", // Left, Center, or Right
                layoutData: new sap.m.FlexItemData({ growFactor: 1 }), // Stretches to fill available screen perfectly
                items: [oInnerControl]
            });

            // 3. MARGINS: Applied safely to the wrapper so Flexbox absorbs them
            if (oMetadata.margin && oMetadata.margin !== "None") {
                oSizingWrapper.addStyleClass("sapUi" + oMetadata.margin + "Margin");
            }

            // Tag for DOM Crawler
            oSizingWrapper.data("metaId", oMetadata.id.toString());
            oSizingWrapper.addEventDelegate({ onclick: this.onControlSelect.bind(this, oSizingWrapper) }, this);

            // Make the wrapper draggable and link it to the group
            oSizingWrapper.addDragDropConfig(new sap.ui.core.dnd.DragInfo({
                groupName: "uiBuilder"
            }));

            // Dynamic Drop Zones for Containers
            if (["Panel", "VBox", "HBox", "SimpleForm"].indexOf(oMetadata.type) > -1) {
                oInnerControl.addStyleClass("designTimeContainer"); 

                if (oMetadata.type === "SimpleForm") {
                    oSizingWrapper.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
                        targetAggregation: "items", 
                        dropPosition: "On",
                        groupName: "uiBuilder",
                        drop: this.onDrop.bind(this)
                    }));
                } else {
                    var sAgg = (oMetadata.type === "Panel") ? "content" : "items";
                    oInnerControl.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
                        targetAggregation: sAgg,
                        dropPosition: "OnOrBetween",
                        groupName: "uiBuilder",
                        drop: this.onDrop.bind(this)
                    }));
                }

                // Recurse deeper
                if (oMetadata.controls) {
                    oMetadata.controls.forEach(function(childMeta) {
                        var oChildWrapper = this._buildControlTree(childMeta);
                        if (oChildWrapper) {
                            if (oMetadata.type === "SimpleForm") {
                                var bIsLabel = (childMeta.type === "Label");
                                // This GridData gracefully overwrites the FlexItemData above!
                                oChildWrapper.setLayoutData(new sap.ui.layout.GridData({
                                    span: bIsLabel ? "XL4 L4 M4 S12" : "XL8 L8 M8 S12",
                                    linebreakL: bIsLabel,
                                    linebreakM: bIsLabel
                                }));
                                oInnerControl.addContent(oChildWrapper);
                            } 
                            else if (oMetadata.type === "Panel") {
                                oInnerControl.addContent(oChildWrapper);
                            } 
                            else {
                                oInnerControl.addItem(oChildWrapper);
                            }
                        }
                    }.bind(this));
                }
            }
            return oSizingWrapper;
        },

        _renderCanvas: function () {
            var oModel = this.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls") || [];
            var oCanvas = this.byId("canvas");
            
            oCanvas.destroyItems();

            if (aControls.length === 0) {
                var oDropTextItem = new sap.m.CustomListItem({
                    content: [new sap.m.Text({ text: "Drop Controls Here" }).addStyleClass("sapUiMediumMargin")]
                }).addStyleClass("canvasListItemClean sapUiNoContentPadding");
                oCanvas.addItem(oDropTextItem);
                return;
            }

            aControls.forEach(function (oMetadata) {
                var oNode = this._buildControlTree(oMetadata);
                if (oNode) {
                    var oCustomItem = new sap.m.CustomListItem({ content: [oNode] });
                    oCustomItem.addStyleClass("canvasListItemClean sapUiNoContentPadding");
                    oCustomItem.data("metaId", oMetadata.id.toString());
                    oCanvas.addItem(oCustomItem);
                }
            }.bind(this));
        },

        onControlSelect: function (oControl, oEvent) {
            if (oEvent && oEvent.stopPropagation) oEvent.stopPropagation();

            var sMetaId = oControl.data("metaId");
            var aControls = this.getView().getModel("layout").getProperty("/controls");

            var oSelectedMetadata = this._findNodeById(aControls, sMetaId);

            // var oSelectedMetadata = aControls.find(function (c) {
            //     return c.id.toString() === sMetaId.toString();
            // });
            if (oSelectedMetadata) {
                this.getView().getModel("selected").setData(oSelectedMetadata);
                this._generatePropertiesUI(oSelectedMetadata);
            }

            // if (oSelectedMetadata) {
            //     oSelectedMetadata.ui5Id = oControl.getId();
            //     this.getView().getModel("selected").setData(oSelectedMetadata);
            //     this._generatePropertiesUI(oSelectedMetadata);
            // }
        },

        _generatePropertiesUI: function (oMetadata) {
            var oContainer = this.byId("propertiesContainer");
            oContainer.destroyItems();
            var aIgnoredKeys = ["id", "type", "ui5Id"];

            Object.keys(oMetadata).forEach(function (sKey) {
                if (aIgnoredKeys.indexOf(sKey) !== -1) return;

                var vValue = oMetadata[sKey];
                var sLabelText = sKey.charAt(0).toUpperCase() + sKey.slice(1);
                oContainer.addItem(new sap.m.Label({ text: sLabelText }));

                var oInputControl;
                if (sKey === "margin") {
                    oInputControl = new sap.m.Select({
                        selectedKey: "{selected>/" + sKey + "}",
                        change: this.onLivePropertyChange.bind(this),
                        items: [
                            new sap.ui.core.Item({ key: "None", text: "None" }),
                            new sap.ui.core.Item({ key: "Tiny", text: "Tiny" }),
                            new sap.ui.core.Item({ key: "Small", text: "Small" }),
                            new sap.ui.core.Item({ key: "Medium", text: "Medium" }),
                            new sap.ui.core.Item({ key: "Large", text: "Large" })
                        ]
                    });
                }
                else if (sKey === "hAlign") {
                    oInputControl = new sap.m.Select({
                        selectedKey: "{selected>/" + sKey + "}",
                        change: this.onLivePropertyChange.bind(this),
                        items: [
                            new sap.ui.core.Item({ key: "Start", text: "Left (Start)" }),
                            new sap.ui.core.Item({ key: "Center", text: "Center" }),
                            new sap.ui.core.Item({ key: "End", text: "Right (End)" })
                        ]
                    });
                }
                else if (typeof vValue === "boolean") {
                    oInputControl = new sap.m.CheckBox({
                        selected: "{selected>/" + sKey + "}",
                        select: this.onLivePropertyChange.bind(this)
                    });
                } else if (typeof vValue === "number") {
                    oInputControl = new sap.m.Input({
                        value: "{selected>/" + sKey + "}",
                        type: "Number",
                        change: this.onLivePropertyChange.bind(this)
                    });
                } else {
                    oInputControl = new sap.m.Input({
                        value: "{selected>/" + sKey + "}",
                        change: this.onLivePropertyChange.bind(this)
                    });
                }
                oInputControl.addStyleClass("sapUiTinyMarginBottom");
                oContainer.addItem(oInputControl);
            }.bind(this));
        },

        onLivePropertyChange: function () {
            var oSelectedData = this.getView().getModel("selected").getData();
            if (!oSelectedData || !oSelectedData.id) return;

            var oLayoutModel = this.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");

            // 1. Find the deeply nested control
            var oResult = this._findArrayAndIndex(aControls, oSelectedData.id);
            
            if (oResult) {
                // 2. THE FIX: Update the specific node with the newly edited data (DO NOT SPLICE/DELETE!)
                oResult.array[oResult.index] = oSelectedData;
                
                // 3. Save and re-render
                oLayoutModel.setProperty("/controls", aControls);
                this._renderCanvas(); 
                this._saveState();
            }
        },

        onDeleteSelectedControl: function () {
            var oSelectedData = this.getView().getModel("selected").getData();
            if (!oSelectedData || !oSelectedData.id) {
                sap.m.MessageToast.show("Please select a control first.");
                return;
            }

            var oLayoutModel = this.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");

            // THE ARCHITECT'S FIX: Use the recursive crawler to find exactly where the control lives
            var oResult = this._findArrayAndIndex(aControls, oSelectedData.id);
            
            if (oResult) {
                // Splice it out of whichever nested array it belongs to
                oResult.array.splice(oResult.index, 1);
                
                oLayoutModel.setProperty("/controls", aControls);
                this.getView().getModel("selected").setData({});
                this.byId("propertiesContainer").destroyItems();

                this._renderCanvas();
                sap.m.MessageToast.show("Control deleted successfully.");
                this._saveState();
            }
        },

        onOpenDataConfig: function () {
            var oSelectedData = this.getView().getModel("selected").getData();
            var oClonedData = JSON.parse(JSON.stringify(oSelectedData));
            this.getView().getModel("dialog").setData(oClonedData);
            this.byId("dataConfigDialog").open();
        },

        onCloseDataConfig: function () {
            this.byId("dataConfigDialog").close();
        },

        onApplyDataConfig: function () {
            var oEditedData = this.getView().getModel("dialog").getData();
            var oLayoutModel = this.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");

            // THE ARCHITECT'S FIX: Use recursive search to find the nested Table/List
            var oResult = this._findArrayAndIndex(aControls, oEditedData.id);
            
            if (oResult) {
                // Overwrite the old metadata with the newly configured data
                oResult.array[oResult.index] = oEditedData;
                oLayoutModel.setProperty("/controls", aControls);
            }

            this.getView().getModel("selected").setData(oEditedData);
            this._renderCanvas();
            this.byId("dataConfigDialog").close();
            sap.m.MessageToast.show("Data Control configurations applied successfully!");
            this._saveState();
        },

        onDropDialogColumn: function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = this.getView().getModel("dialog");
            var aColumns = oDialogModel.getProperty("/columns");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedColumn = aColumns.splice(iDraggedIndex, 1)[0];
            aColumns.splice(iNewIndex, 0, oMovedColumn);
            oDialogModel.setProperty("/columns", aColumns);
        },

        onDropDialogRow: function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = this.getView().getModel("dialog");
            var aRows = oDialogModel.getProperty("/rows");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedRow = aRows.splice(iDraggedIndex, 1)[0];
            aRows.splice(iNewIndex, 0, oMovedRow);
            oDialogModel.setProperty("/rows", aRows);
        },

        onDropDialogListItem: function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = this.getView().getModel("dialog");
            var aItems = oDialogModel.getProperty("/items");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedItem = aItems.splice(iDraggedIndex, 1)[0];
            aItems.splice(iNewIndex, 0, oMovedItem);
            oDialogModel.setProperty("/items", aItems);
        },

        onDropDialogTreeNode: function (oEvent) {
            var oDraggedItem = oEvent.getParameter("draggedControl");
            var oDroppedOnItem = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");

            var oDialogModel = this.getView().getModel("dialog");
            var aNodes = oDialogModel.getProperty("/flatNodes");

            var iDraggedIndex = oDraggedItem.getParent().indexOfItem(oDraggedItem);
            var iDroppedIndex = oDroppedOnItem.getParent().indexOfItem(oDroppedOnItem);
            var iNewIndex = iDroppedIndex + (sDropPosition === "After" ? 1 : 0);
            if (iDraggedIndex < iNewIndex) { iNewIndex--; }

            var oMovedNode = aNodes.splice(iDraggedIndex, 1)[0];
            aNodes.splice(iNewIndex, 0, oMovedNode);
            oDialogModel.setProperty("/flatNodes", aNodes);
        },

        
        onAddColumn: function () {
            var oDialogModel = this.getView().getModel("dialog");
            var aColumns = oDialogModel.getProperty("/columns") || [];
            aColumns.push({ columnId: "col" + (aColumns.length + 1) + "_" + Date.now().toString().slice(-4), name: "New Column", width: "auto" });
            oDialogModel.setProperty("/columns", aColumns);
        },
        onDeleteColumn: function (oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aColumns = this.getView().getModel("dialog").getProperty("/columns");
            aColumns.splice(iIndex, 1);
            this.getView().getModel("dialog").setProperty("/columns", aColumns);
        },
        onDuplicateColumn: function (oEvent) {
            var oColumnData = oEvent.getSource().getParent().getBindingContext("dialog").getObject();
            var oDialogModel = this.getView().getModel("dialog");
            var aColumns = oDialogModel.getProperty("/columns");
            var oClonedColumn = JSON.parse(JSON.stringify(oColumnData));
            oClonedColumn.columnId = "col" + (aColumns.length + 1) + "_" + Date.now().toString().slice(-4);
            oClonedColumn.name = oClonedColumn.name + " (Copy)";
            aColumns.push(oClonedColumn);
            oDialogModel.setProperty("/columns", aColumns);
        },
        onAddRow: function () {
            var oDialogModel = this.getView().getModel("dialog");
            var aRows = oDialogModel.getProperty("/rows") || [];
            aRows.push({ rowId: "row_" + Date.now().toString().slice(-4), col1: "New Data", col2: "New Data", col3: "New Data" });
            oDialogModel.setProperty("/rows", aRows);
        },
        onDeleteRow: function (oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aRows = this.getView().getModel("dialog").getProperty("/rows");
            aRows.splice(iIndex, 1);
            this.getView().getModel("dialog").setProperty("/rows", aRows);
        },
        onAddListItem: function () {
            var oDialogModel = this.getView().getModel("dialog");
            var aItems = oDialogModel.getProperty("/items") || [];
            aItems.push({ itemId: "item_" + Date.now(), title: "New List Item", description: "Enter details here", icon: "sap-icon://task", status: "None" });
            oDialogModel.setProperty("/items", aItems);
        },
        onDeleteListItem: function (oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aItems = this.getView().getModel("dialog").getProperty("/items");
            aItems.splice(iIndex, 1);
            this.getView().getModel("dialog").setProperty("/items", aItems);
        },
        onAddTreeNode: function () {
            var oDialogModel = this.getView().getModel("dialog");
            var aNodes = oDialogModel.getProperty("/flatNodes") || [];
            aNodes.push({ nodeId: "node_" + Date.now().toString().slice(-4), text: "New Node", parentId: "" });
            oDialogModel.setProperty("/flatNodes", aNodes);
        },
        onDeleteTreeNode: function (oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aNodes = this.getView().getModel("dialog").getProperty("/flatNodes");
            aNodes.splice(iIndex, 1);
            this.getView().getModel("dialog").setProperty("/flatNodes", aNodes);
        },

        onAddCustomAction: function () {
            var oDialogModel = this.getView().getModel("dialog");
            var aActions = oDialogModel.getProperty("/customActions") || [];

            aActions.push({
                actionId: "act_" + Date.now().toString().slice(-4),
                label: "New Action",
                icon: "sap-icon://action",
                buttonType: "Default",
                logic: "sap.m.MessageToast.show('You clicked ' + rowData.rowId);"
            });

            oDialogModel.setProperty("/customActions", aActions);
        },

        onDeleteCustomAction: function (oEvent) {
            var iIndex = parseInt(oEvent.getParameter("listItem").getBindingContext("dialog").getPath().split("/")[2], 10);
            var aActions = this.getView().getModel("dialog").getProperty("/customActions");

            aActions.splice(iIndex, 1);
            this.getView().getModel("dialog").setProperty("/customActions", aActions);
        },

        onTriggerCSVImport: function () {
            var oFileUploader = document.getElementById("csvUploader");
            if (oFileUploader) oFileUploader.click();
        },
        _parseCSV: function (sCSVText) {
            var aLines = sCSVText.split("\n").filter(function (line) { return line.trim() !== ""; });
            if (aLines.length < 2) return sap.m.MessageToast.show("Invalid CSV: Must have headers and at least one row of data.");

            var oDialogModel = this.getView().getModel("dialog");
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
                oDialogModel.setProperty("/columns", aNewColumns);
                oDialogModel.setProperty("/rows", aNewRows);
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

        _buildPreviewTree: function(oMetadata) {
            var oInnerControl = ControlFactory.createControl(oMetadata);
            if (!oInnerControl) return null;

            if (oMetadata.customCssClass) oInnerControl.addStyleClass(oMetadata.customCssClass);

            // 1. EXACT SIZING
            if (oInnerControl.setWidth) { 
                try { oInnerControl.setWidth(oMetadata.width || "100%"); } catch (e) {} 
            }

            // 2. MASTER PREVIEW WRAPPER
            var oPreviewWrapper = new sap.m.VBox({
                width: "auto",
                height: oMetadata.height || "auto",
                alignItems: oMetadata.hAlign || "Start",
                layoutData: new sap.m.FlexItemData({ growFactor: 1 }),
                items: [oInnerControl]
            });

            // 3. MARGINS
            if (oMetadata.margin && oMetadata.margin !== "None") {
                oPreviewWrapper.addStyleClass("sapUi" + oMetadata.margin + "Margin");
            }

            // RECURSION
            if (["Panel", "VBox", "HBox", "SimpleForm"].indexOf(oMetadata.type) > -1 && oMetadata.controls) {
                oMetadata.controls.forEach(function(childMeta) {
                    var oChildWrapper = this._buildPreviewTree(childMeta);
                    if (oChildWrapper) {
                        if (oMetadata.type === "SimpleForm") {
                            var bIsLabel = (childMeta.type === "Label");
                            oChildWrapper.setLayoutData(new sap.ui.layout.GridData({
                                span: bIsLabel ? "XL4 L4 M4 S12" : "XL8 L8 M8 S12",
                                linebreakL: bIsLabel,
                                linebreakM: bIsLabel
                            }));
                            oInnerControl.addContent(oChildWrapper);
                        } 
                        else if (oMetadata.type === "Panel") {
                            oInnerControl.addContent(oChildWrapper);
                        } 
                        else {
                            oInnerControl.addItem(oChildWrapper);
                        }
                    }
                }.bind(this));
            }

            return oPreviewWrapper;
        },

        onPreview: function () {
            var oModel = this.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls") || [];
            var oPreviewCanvas = this.byId("previewCanvas");
            
            // Clear the old preview
            oPreviewCanvas.destroyItems();

            // Recursively build the pure UI
            aControls.forEach(function (oMetadata) {
                var oNode = this._buildPreviewTree(oMetadata);
                if (oNode) {
                    oPreviewCanvas.addItem(oNode);
                }
            }.bind(this));

            this.byId("previewDialog").open();
        },
        onClosePreview: function () { this.byId("previewDialog").close(); },
        onViewJson: function () {
            var aControls = this.getView().getModel("layout").getProperty("/controls");
            var sJson = JSON.stringify(aControls, null, 4);
            this.getView().getModel("dialog").setProperty("/jsonString", sJson);
            this.byId("jsonDialog").open();
        },
        onApplyJson: function () {
            var sEditedJson = this.getView().getModel("dialog").getProperty("/jsonString");
            try {
                var aParsedData = JSON.parse(sEditedJson);
                this.getView().getModel("layout").setProperty("/controls", aParsedData);
                this._renderCanvas();
                this.byId("jsonDialog").close();
                sap.m.MessageToast.show("Layout successfully updated!");
                this._saveState();
            } catch (e) {
                sap.m.MessageToast.show("Failed to apply changes. Check console for details.");
            }
        },
        onCloseJson: function () { this.byId("jsonDialog").close(); },
        onExport: function () {
            var sJSON = this.getView().getModel("layout").getJSON();
            var oBlob = new Blob([sJSON], { type: "application/json" });
            var sURL = URL.createObjectURL(oBlob);
            var oLink = document.createElement("a");
            oLink.href = sURL;
            oLink.download = "MyDynamicLayout.json";
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);
        },

        onOpenCodeEditor: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext("dialog");

            this._sActiveActionContextPath = oContext.getPath();
            var sCurrentLogic = oContext.getProperty("logic");

            var oDialogModel = this.getView().getModel("dialog");
            oDialogModel.setProperty("/currentActionLogic", sCurrentLogic);

            this.byId("codeEditorDialog").open();
        },

        onSaveCodeEditor: function () {
            var oDialogModel = this.getView().getModel("dialog");
            var sUpdatedLogic = oDialogModel.getProperty("/currentActionLogic");

            if (this._sActiveActionContextPath) {
                oDialogModel.setProperty(this._sActiveActionContextPath + "/logic", sUpdatedLogic);
            }

            this.byId("codeEditorDialog").close();
            sap.m.MessageToast.show("JavaScript logic saved successfully!");
        },

        onCloseCodeEditor: function () {
            this.byId("codeEditorDialog").close();
        },
    });
});