sap.ui.define([], function () {
    "use strict";

    return {
        createControl: function (oMetadata) {
            var oControl;

            switch (oMetadata.type) {
                // Input
                case "Input": oControl = new sap.m.Input(); break;
                case "TextArea": oControl = new sap.m.TextArea(); break;
                case "ComboBox": oControl = new sap.m.ComboBox(); break;
                case "DatePicker": oControl = new sap.m.DatePicker(); break;
                case "TimePicker": oControl = new sap.m.TimePicker(); break;
                case "DateTimePicker": oControl = new sap.m.DateTimePicker(); break;
                case "SearchField": oControl = new sap.m.SearchField(); break;

                // Action
                case "Button": oControl = new sap.m.Button(); break;
                case "Menu Button": oControl = new sap.m.MenuButton(); break;
                case "Segmented Button": oControl = new sap.m.SegmentedButton(); break;

                // Selection
                case "CheckBox": oControl = new sap.m.CheckBox(); break;
                case "RadioButton": oControl = new sap.m.RadioButton(); break;
                case "Switch": oControl = new sap.m.Switch(); break;
                case "Select": oControl = new sap.m.Select(); break;
                case "MultiComboBox": oControl = new sap.m.MultiComboBox(); break;

                // Display
                case "Label": oControl = new sap.m.Label(); break;
                case "Text": oControl = new sap.m.Text(); break;
                case "Link": oControl = new sap.m.Link(); break;
                case "Avatar": oControl = new sap.m.Avatar(); break;
                case "Icon": oControl = new sap.ui.core.Icon(); break;

                // Container & Data
                case "Panel": oControl = new sap.m.Panel(); break;
                case "VBox": oControl = new sap.m.VBox(); break;
                case "HBox": oControl = new sap.m.HBox(); break;
                case "SimpleForm": oControl = new sap.ui.layout.form.SimpleForm(); break;
                case "Table": oControl = new sap.m.Table(); break;
                case "List": oControl = new sap.m.List(); break;
                case "Tree": oControl = new sap.m.Tree(); break;

                // Advanced
                case "Slider": oControl = new sap.m.Slider(); break;
                case "Progress Indicator": oControl = new sap.m.ProgressIndicator(); break;
                case "Object Status": oControl = new sap.m.ObjectStatus(); break;
                case "Object Identifier": oControl = new sap.m.ObjectIdentifier(); break;

                default: return null;
            }

            // Apply all initial metadata properties dynamically to the newly created control
            var aIgnoredKeys = ["id", "type", "ui5Id"];
            Object.keys(oMetadata).forEach(function (sKey) {
                if (aIgnoredKeys.indexOf(sKey) === -1) {
                    try {
                        oControl.setProperty(sKey, oMetadata[sKey]);
                    } catch (e) {
                        console.warn("Property mapping failed for: " + sKey);
                    }
                }
            });

            return oControl;
        }
    };
});