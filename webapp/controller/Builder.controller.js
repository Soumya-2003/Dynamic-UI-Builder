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
        },

        addControlToModel: function (sControlName) {
            var oModel = this.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls");

            var oMetadata = ControlMetadataFactory.getMetadata(sControlName);
            aControls.push(oMetadata);
            oModel.refresh();

            return oMetadata;
        },

        onDrop: function (oEvent) {
            var oDraggedControl = oEvent.getParameter("draggedControl");
            var sControlName = oDraggedControl.getTitle();

            var oModel = this.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls");
            
            var oMetadata = ControlMetadataFactory.getMetadata(sControlName);
            aControls.push(oMetadata);
            oModel.refresh();

            var oControl = ControlFactory.createControl(oMetadata);
            
            if (oControl) {
                oControl.data("metaId", oMetadata.id);
                oControl.addEventDelegate({
                    onclick: this.onControlSelect.bind(this, oControl)
                }, this);

                this.byId("dropText").setVisible(false);
                this.byId("canvas").addItem(oControl);
            }
        },

        onControlSelect: function (oControl, oEvent) {
            if (oEvent && oEvent.stopPropagation) {
                oEvent.stopPropagation();
            }

            var sMetaId = oControl.data("metaId");

            var oModel = this.getView().getModel("layout");
            var aControls = oModel.getProperty("/controls");

            var oSelectedMetadata = aControls.find(function (c) {
                return c.id === sMetaId;
            });

            if (oSelectedMetadata) {
                oSelectedMetadata.ui5Id = oControl.getId();

                // Dump the rich metadata directly into the 'selected' model
                this.getView().getModel("selected").setData(oSelectedMetadata);
                this._generatePropertiesUI(oSelectedMetadata);

                console.log("Success: Dynamic Properties Panel generated!", oSelectedMetadata);
            }
        },

        onPropertyChange: function () {
            var oSelectedData = this.getView().getModel("selected").getData();
            var oLayoutModel = this.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");

            var iIndex = aControls.findIndex(function(c) {
                return c.id === oSelectedData.id;
            });

            if (iIndex !== -1) {
                aControls[iIndex] = oSelectedData;
                oLayoutModel.setProperty("/controls", aControls);
            }

            var oPhysicalControl = sap.ui.getCore().byId(oSelectedData.ui5Id);
            if (oPhysicalControl) {
                var aIgnoredKeys = ["id", "type", "ui5Id"];
                
                Object.keys(oSelectedData).forEach(function(sKey) {
                    if (aIgnoredKeys.indexOf(sKey) === -1) {
                        try {
                            oPhysicalControl.setProperty(sKey, oSelectedData[sKey]);
                        } catch (e) {
                        }
                    }
                });
            }
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

                if (typeof vValue === "boolean") {
                    oInputControl = new sap.m.CheckBox({
                        selected: "{selected>/" + sKey + "}",
                        select: this.onPropertyChange.bind(this)
                    });
                } else if (typeof vValue === "number") {
                    oInputControl = new sap.m.Input({
                        value: "{selected>/" + sKey + "}",
                        type: "Number",
                        change: this.onPropertyChange.bind(this)
                    });
                } else {
                    oInputControl = new sap.m.Input({
                        value: "{selected>/" + sKey + "}",
                        change: this.onPropertyChange.bind(this)
                    });
                }

                oInputControl.addStyleClass("sapUiTinyMarginBottom");
                oContainer.addItem(oInputControl);
            }.bind(this));
        },

        onPreview: function () {
            var oPreviewCanvas = this.byId("previewCanvas");
            var aControls = this.getView().getModel("layout").getProperty("/controls");

            oPreviewCanvas.destroyItems();

            aControls.forEach(function (oData) {
                var oControl = ControlFactory.createControl(oData);
                if (oControl) {
                    oPreviewCanvas.addItem(oControl);
                }
            });

            this.byId("previewDialog").open();
        },

        onClosePreview: function () {
            this.byId("previewDialog").close();
        },

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
                
                var oCanvas = this.byId("canvas");
                
                oCanvas.destroyItems(); 
                
                aParsedData.forEach(function (oMetadata) {
                    var oControl = ControlFactory.createControl(oMetadata);
                    
                    if (oControl) {
                        oControl.data("metaId", oMetadata.id);
                        oControl.addEventDelegate({
                            onclick: this.onControlSelect.bind(this, oControl)
                        }, this);
                        
                        oCanvas.addItem(oControl);
                    }
                }.bind(this));
                
                this.byId("jsonDialog").close();
                sap.m.MessageToast.show("Layout successfully updated!");
                
            } catch (e) {
                console.error("JSON Apply Error: ", e);
                sap.m.MessageToast.show("Failed to apply changes. Check console for details.");
            }
        },

        onCloseJson: function () {
            this.byId("jsonDialog").close();
        },

        onExport: function () {
            var oModel = this.getView().getModel("layout");
            var sJSON = oModel.getJSON();
            
            var oBlob = new Blob([sJSON], { type: "application/json" });
            var sURL = URL.createObjectURL(oBlob);
            
            var oLink = document.createElement("a");
            oLink.href = sURL;
            oLink.download = "MyDynamicLayout.json";
            
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);
        },

        onDeleteSelectedControl: function () {
            var oSelectedData = this.getView().getModel("selected").getData();
            
            if (!oSelectedData || !oSelectedData.id) {
                sap.m.MessageToast.show("Please select a control first.");
                return;
            }

            var sTargetId = oSelectedData.id;

            var oLayoutModel = this.getView().getModel("layout");
            var aControls = oLayoutModel.getProperty("/controls");

  
            var aUpdatedControls = aControls.filter(function (oControlData) {
                return oControlData.id !== sTargetId;
            });

            oLayoutModel.setProperty("/controls", aUpdatedControls);

            this.getView().getModel("selected").setData({});
            this.byId("propertiesContainer").destroyItems();

            var oCanvas = this.byId("canvas");
            oCanvas.destroyItems();

            aUpdatedControls.forEach(function (oMetadata) {
                var oControl = ControlFactory.createControl(oMetadata);
                
                if (oControl) {
                    oControl.data("metaId", oMetadata.id);
                    oControl.addEventDelegate({
                        onclick: this.onControlSelect.bind(this, oControl)
                    }, this);
                    
                    oCanvas.addItem(oControl);
                }
            }.bind(this));

            if (aUpdatedControls.length === 0) {
                var oDropText = new sap.m.Text({ id: this.createId("dropText"), text: "Drop Controls Here" });
                oCanvas.addItem(oDropText);
            }

            sap.m.MessageToast.show("Control deleted successfully.");
        }
    });
});