sap.ui.define([
    "./ControlFactory"
], function (ControlFactory) {
    "use strict";
    return {
        buildPreviewTree: function (oController, oMetadata) {
            var oInnerControl = ControlFactory.createControl(oMetadata);
            if (!oInnerControl) return null;

            if (oMetadata.customCssClass) oInnerControl.addStyleClass(oMetadata.customCssClass);
            if (oInnerControl.setWidth) { try { oInnerControl.setWidth(oMetadata.width || "100%"); } catch (e) { } }

            var oPreviewWrapper = new sap.m.VBox({
                width: "auto", height: oMetadata.height || "auto", alignItems: oMetadata.hAlign || "Start",
                layoutData: new sap.m.FlexItemData({ growFactor: 1 }), items: [oInnerControl]
            });

            if (oMetadata.margin && oMetadata.margin !== "None") oPreviewWrapper.addStyleClass("sapUi" + oMetadata.margin + "Margin");

            if (["Panel", "VBox", "HBox", "SimpleForm"].indexOf(oMetadata.type) > -1 && oMetadata.controls) {
                oMetadata.controls.forEach(function (childMeta) {
                    var oChildWrapper = oController._buildPreviewTree(childMeta);
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
            return oPreviewWrapper;
        },
        onPreview: function (oController) {
            var oModel = oController.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls") || [];
            var oPreviewCanvas = oController.byId("previewCanvas");
            oPreviewCanvas.destroyItems();
            aControls.forEach(function (oMetadata) {
                var oNode = oController._buildPreviewTree(oMetadata);
                if (oNode) oPreviewCanvas.addItem(oNode);
            });
            oController.byId("previewDialog").open();
        },
        onClosePreview: function (oController) { oController.byId("previewDialog").close(); }
    };
});