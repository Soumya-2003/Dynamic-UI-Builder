sap.ui.define([], function () {
    "use strict";

    return {
        getMetadata: function (sControlName) {
            var oBaseMetadata = {
                id: Date.now(),
                type: sControlName,
                visible: true
            };

            var oSpecificMetadata = {};

            switch (sControlName) {
                case "Input":
                case "SearchField":
                case "ComboBox":
                case "MultiComboBox":
                    oSpecificMetadata = { 
                        placeholder: "Enter value", 
                        width: "100%", 
                        editable: true, 
                        enabled: true };
                    break;
                case "TextArea":
                    oSpecificMetadata = { 
                        placeholder: "Enter long text", 
                        width: "100%", 
                        editable: true, 
                        enabled: true, 
                        rows: 4 };
                    break;
                case "DatePicker":
                case "TimePicker":
                case "DateTimePicker":
                    oSpecificMetadata = { 
                        value: "", 
                        width: "100%", 
                        editable: true, 
                        enabled: true };
                    break;

                case "Button":
                case "Menu Button":
                    oSpecificMetadata = { 
                        text: sControlName, 
                        width: "100%", 
                        enabled: true };
                    break;
                case "Segmented Button":
                    oSpecificMetadata = { 
                        selectedKey: "", 
                        enabled: true };
                    break;

                case "CheckBox":
                case "RadioButton":
                    oSpecificMetadata = { 
                        text: sControlName, 
                        selected: false, 
                        enabled: true };
                    break;
                case "Switch":
                    oSpecificMetadata = { 
                        state: false, 
                        enabled: true };
                    break;
                case "Select":
                    oSpecificMetadata = { 
                        selectedKey: "", 
                        width: "100%", 
                        enabled: true };
                    break;

                case "Label":
                case "Text":
                    oSpecificMetadata = { 
                        text: "Sample " + sControlName, 
                        width: "100%" };
                    break;
                case "Link":
                    oSpecificMetadata = { 
                        text: "Click Here", 
                        href: "#", 
                        width: "100%", 
                        enabled: true };
                    break;
                case "Avatar":
                    oSpecificMetadata = { 
                        initials: "UI", 
                        displaySize: "M" };
                    break;
                case "Icon":
                    oSpecificMetadata = { 
                        src: "sap-icon://sys-enter-2", 
                        color: "#000000" };
                    break;

                case "Panel":
                case "Table":
                case "List":
                case "Tree":
                    oSpecificMetadata = { 
                        headerText: sControlName + " Header", 
                        width: "100%" };
                    break;
                case "SimpleForm":
                    oSpecificMetadata = { 
                        title: "Simple Form", 
                        width: "100%", 
                        editable: true };
                    break;
                case "VBox":
                case "HBox":
                    oSpecificMetadata = { 
                        width: "100%", 
                        height: "100px" };
                    break;

                case "Slider":
                    oSpecificMetadata = { 
                        min: 0, 
                        max: 100, 
                        value: 50, 
                        width: "100%", 
                        enabled: true };
                    break;
                case "Progress Indicator":
                    oSpecificMetadata = { 
                        percentValue: 50, 
                        displayValue: "50%", 
                        state: "Success", 
                        width: "100%" };
                    break;
                case "Object Status":
                    oSpecificMetadata = { 
                        text: "Status Name", 
                        state: "Success", 
                        icon: "sap-icon://sys-enter-2" };
                    break;
                case "Object Identifier":
                    oSpecificMetadata = { 
                        title: "Item Title", 
                        text: "Item Description" };
                    break;

                default:
                    oSpecificMetadata = { text: sControlName };
            }

            
            return Object.assign({}, oBaseMetadata, oSpecificMetadata);
        }
    };
});