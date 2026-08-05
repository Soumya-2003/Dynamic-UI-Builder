sap.ui.define([
    "./ControlFactory",
    "./ControlMetadataFactory"
], function (ControlFactory, ControlMetadataFactory) {
    "use strict";
    return {
        onDeviceSwitch: function (oController, oEvent) {
            var sWidth = oEvent.getParameter("item").getKey();
            var oCanvas = oController.byId("canvas");
            oCanvas.setWidth(sWidth);
            if (sWidth !== "100%") {
                oCanvas.addStyleClass("sapUiAutoMarginLeft").addStyleClass("sapUiAutoMarginRight");
            } else {
                oCanvas.removeStyleClass("sapUiAutoMarginLeft").removeStyleClass("sapUiAutoMarginRight");
            }
        },
        onDrop: function (oController, oEvent) {
            var oDraggedControl = oEvent.getParameter("draggedControl");
            var oDroppedControl = oEvent.getParameter("droppedControl");
            var sDropPosition = oEvent.getParameter("dropPosition");
            var oModel = oController.getView().getModel("layout");
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
                        var oTargetNode = oController._findNodeById(aControls, sDroppedMetaId);
                        if (oTargetNode && oTargetNode.controls) oTargetNode.controls.push(oMetadata);
                    } else {
                        var oResult = oController._findArrayAndIndex(aControls, sDroppedMetaId);
                        if (oResult) {
                            var iNewIndex = oResult.index + (sDropPosition === "After" ? 1 : 0);
                            oResult.array.splice(iNewIndex, 0, oMetadata);
                        }
                    }
                }
            }
            oModel.setProperty("/controls", aControls);
            oController._renderCanvas();
            oController._saveState();
        },
        buildControlTree: function (oController, oMetadata) {
            var oInnerControl = ControlFactory.createControl(oMetadata);
            if (!oInnerControl) return null;

            if (oMetadata.customCssClass) oInnerControl.addStyleClass(oMetadata.customCssClass);
            if (oInnerControl.setWidth) { try { oInnerControl.setWidth(oMetadata.width || "100%"); } catch (e) { } }

            var oSizingWrapper = new sap.m.VBox({
                width: "auto",
                height: oMetadata.height || "auto",
                alignItems: oMetadata.hAlign || "Start",
                layoutData: new sap.m.FlexItemData({ growFactor: 1 }),
                items: [oInnerControl]
            });

            if (oMetadata.margin && oMetadata.margin !== "None") oSizingWrapper.addStyleClass("sapUi" + oMetadata.margin + "Margin");

            oSizingWrapper.data("metaId", oMetadata.id.toString());
            oSizingWrapper.addEventDelegate({ onclick: oController.onControlSelect.bind(oController, oSizingWrapper) }, oController);
            oSizingWrapper.addDragDropConfig(new sap.ui.core.dnd.DragInfo({ groupName: "uiBuilder" }));

            if (["Panel", "VBox", "HBox", "SimpleForm"].indexOf(oMetadata.type) > -1) {
                oInnerControl.addStyleClass("designTimeContainer");
                if (oMetadata.type === "SimpleForm") {
                    oSizingWrapper.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
                        targetAggregation: "items", dropPosition: "On", groupName: "uiBuilder", drop: oController.onDrop.bind(oController)
                    }));
                } else {
                    var sAgg = (oMetadata.type === "Panel") ? "content" : "items";
                    oInnerControl.addDragDropConfig(new sap.ui.core.dnd.DropInfo({
                        targetAggregation: sAgg, dropPosition: "OnOrBetween", groupName: "uiBuilder", drop: oController.onDrop.bind(oController)
                    }));
                }
                if (oMetadata.controls) {
                    oMetadata.controls.forEach(function (childMeta) {
                        var oChildWrapper = oController._buildControlTree(childMeta);
                        if (oChildWrapper) {
                            if (oMetadata.type === "SimpleForm") {
                                var bIsLabel = (childMeta.type === "Label");
                                oChildWrapper.setLayoutData(new sap.ui.layout.GridData({ span: bIsLabel ? "XL4 L4 M4 S12" : "XL8 L8 M8 S12", linebreakL: bIsLabel, linebreakM: bIsLabel }));
                                oInnerControl.addContent(oChildWrapper);
                            }
                            else if (oMetadata.type === "Panel") oInnerControl.addContent(oChildWrapper);
                            else oInnerControl.addItem(oChildWrapper);
                        }
                    });
                }
            }
            return oSizingWrapper;
        },
        renderCanvas: function (oController) {
            var oModel = oController.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls") || [];
            var oCanvas = oController.byId("canvas");
            oCanvas.destroyItems();

            if (aControls.length === 0) {
                var oDropTextItem = new sap.m.CustomListItem({ content: [new sap.m.Text({ text: "Drop Controls Here" }).addStyleClass("sapUiMediumMargin")] }).addStyleClass("canvasListItemClean sapUiNoContentPadding");
                oCanvas.addItem(oDropTextItem);
                return;
            }
            aControls.forEach(function (oMetadata) {
                var oNode = oController._buildControlTree(oMetadata);
                if (oNode) {
                    var oCustomItem = new sap.m.CustomListItem({ content: [oNode] });
                    oCustomItem.addStyleClass("canvasListItemClean sapUiNoContentPadding");
                    oCustomItem.data("metaId", oMetadata.id.toString());
                    oCanvas.addItem(oCustomItem);
                }
            });
        }
    };
});