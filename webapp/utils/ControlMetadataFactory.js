sap.ui.define([], function () {
    "use strict";

    return {
        getMetadata: function (sControlName) {
            var oBaseMetadata = {
                id: Date.now(),
                type: sControlName,
                visible: true,
                width: "100%",        
                height: "auto",   
                margin: "Tiny",
                hAlign: "Start",
                customCssClass: ""
            };

            var oSpecificMetadata = {};

            switch (sControlName) {
                case "Input":
                case "SearchField":
                    oSpecificMetadata = { 
                        placeholder: "Enter value", 
                        width: "100%", 
                        editable: true, 
                        enabled: true 
                    };
                    break;
                case "ComboBox":
                case "MultiComboBox":
                case "Select":
                    oSpecificMetadata = { 
                        placeholder: "Select an option", 
                        width: "100%", 
                        editable: true, 
                        enabled: true,
                        items: [
                            { text: "Option A", key: "A" },
                            { text: "Option B", key: "B" }
                        ]
                    };
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
                        enabled: true,
                        items: [
                            { text: "Edit", key: "edit" },
                            { text: "Delete", key: "delete" }
                        ]
                    };
                    break;
                case "Segmented Button":
                    oSpecificMetadata = { 
                        selectedKey: "", 
                        enabled: true,
                        items: [
                            { text: "List View", key: "list" },
                            { text: "Map View", key: "map" }
                        ]
                    };
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
                case "Table":
                    oSpecificMetadata = {
                        headerText: "Enterprise Table",
                        width: "100%",
                        stickyHeader: true,
                        growing: true,
                        growingThreshold: 10,
                        alternateRowColors: true,
                        selectionMode: "MultiSelect", 
                        inlineEditing: false,
                        enableSearch: false,
                        enableActions: false,
                        enableCustomActions: false, 
                        customActionsHeader: "Custom Actions",
                        customActions: [
                            { 
                                actionId: "act1", 
                                label: "Approve", 
                                icon: "sap-icon://accept", 
                                buttonType: "Accept", 
                                logic: "sap.m.MessageToast.show('Approving Item: ' + rowData.col1);" 
                            }
                        ],
                        sortBy: "None",    
                        sortOrder: "Asc",   
                        columns: [
                            { columnId: "col1", name: "Product Name", width: "auto" },
                            { columnId: "col2", name: "Category", width: "auto" },
                            { columnId: "col3", name: "Price", width: "120px" }
                        ],
                        rows: [
                            { rowId: "row1", col1: "Laptop Pro", col2: "Electronics", col3: "1200", status: "Success" }, 
                            { rowId: "row2", col1: "Ergonomic Chair", col2: "Furniture", col3: "350", status: "Warning" },
                            { rowId: "row3", col1: "Mechanical Keyboard", col2: "Electronics", col3: "150", status: "None" }
                        ]
                    };
                    break;
                case "List":
                    oSpecificMetadata = {
                        headerText: "Dynamic List",
                        width: "100%",
                        selectionMode: "SingleSelectMaster",
                        showSearch: true,
                        growing: true,
                        itemType: "StandardListItem",
                        items: [
                            { itemId: "item1", title: "Task Order #1042", description: "Pending Approval", status: "Warning" },
                            { itemId: "item2", title: "Invoice #9821", description: "Completed", status: "Success" }
                        ]
                    };
                    break;
                case "Tree":
                    oSpecificMetadata = {
                        headerText: "Hierarchical Tree",
                        width: "100%",
                        mode: "SingleSelectMaster",
                        flatNodes: [
                            { nodeId: "node1", text: "Root Directory", parentId: "" },
                            { nodeId: "node2", text: "Source Code", parentId: "node1" },
                            { nodeId: "node3", text: "Assets", parentId: "node1" },
                            { nodeId: "node4", text: "Images", parentId: "node3" }
                        ]
                    };
                    break;
                case "SimpleForm":
                    oSpecificMetadata = { 
                        title: "Simple Form", 
                        width: "100%",
                        controls: [] 
                     };
                    break;
                case "Panel":
                    oSpecificMetadata = { 
                        headerText: "New Panel", 
                        width: "100%", controls: [] 
                    };
                    break;
                case "VBox":
                    oSpecificMetadata = { 
                        width: "100%", 
                        controls: [] 
                    };
                    break;
                case "HBox":
                    oSpecificMetadata = { 
                        width: "100%", 
                        controls: [] 
                    };
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

            var oMergedMetadata = Object.assign({}, oBaseMetadata, oSpecificMetadata);
            return JSON.parse(JSON.stringify(oMergedMetadata));
        }
    };
});