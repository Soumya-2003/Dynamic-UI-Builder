sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../utils/TableManager",
    "../utils/ListManager",
    "../utils/TreeManager",
    "../utils/TreeUtil",
    "../utils/HistoryManager",
    "../utils/CanvasManager",
    "../utils/PropertyManager",
    "../utils/DialogManager",
    "../utils/ImportExportManager",
    "../utils/PreviewManager"
], function (
    Controller,
    JSONModel,
    TableManager,
    ListManager,
    TreeManager,
    TreeUtil,
    HistoryManager,
    CanvasManager,
    PropertyManager,
    DialogManager,
    ImportExportManager,
    PreviewManager
) {
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

            this._aHistoryStack = [JSON.stringify([])];
            this._aRedoStack = [];

            window.handleCSVUpload = function (event) {
                var file = event.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (e) { that._parseCSV(e.target.result); };
                reader.readAsText(file);
            };
        },

        _findArrayAndIndex: function (aNodes, sId) {
            return TreeUtil.findArrayAndIndex(aNodes, sId);
        },

        _findNodeById: function (aNodes, sId) {
            return TreeUtil.findNodeById(aNodes, sId);
        },

        onDeviceSwitch: function (oEvent) {
            CanvasManager.onDeviceSwitch(this, oEvent);
        },

        _saveState: function () {
            HistoryManager.saveState(this);
        },

        onUndo: function () {
            HistoryManager.onUndo(this);
        },

        onRedo: function () {
            HistoryManager.onRedo(this);
        },

        onDrop: function (oEvent) {
            CanvasManager.onDrop(this, oEvent);
        },

        _buildControlTree: function (oMetadata) {
            return CanvasManager.buildControlTree(this, oMetadata);
        },

        _renderCanvas: function () {
            CanvasManager.renderCanvas(this);
        },

        onControlSelect: function (oControl, oEvent) {
            PropertyManager.onControlSelect(this, oControl, oEvent);
        },

        _generatePropertiesUI: function (oMetadata) {
            PropertyManager.generatePropertiesUI(this, oMetadata);
        },

        onLivePropertyChange: function () {
            PropertyManager.onLivePropertyChange(this);
        },

        onDeleteSelectedControl: function () {
            PropertyManager.onDeleteSelectedControl(this);
        },

        onOpenDataConfig: function () {
            DialogManager.onOpenDataConfig(this);
        },

        onCloseDataConfig: function () {
            DialogManager.onCloseDataConfig(this);
        },

        onApplyDataConfig: function () {
            DialogManager.onApplyDataConfig(this);
        },

        onDropDialogColumn: function (oEvent) {
            TableManager.onDropDialogColumn(this, oEvent);
        },

        onDropDialogRow: function (oEvent) {
            TableManager.onDropDialogRow(this, oEvent);
        },

        onDropDialogListItem: function (oEvent) {
            ListManager.onDropDialogListItem(this, oEvent);
        },

        onDropDialogTreeNode: function (oEvent) {
            TreeManager.onDropDialogTreeNode(this, oEvent);
        },

        onAddColumn: function () {
            TableManager.onAddColumn(this);
        },
        onDeleteColumn: function (oEvent) {
            TableManager.onDeleteColumn(this, oEvent);
        },
        onDuplicateColumn: function (oEvent) {
            TableManager.onDuplicateColumn(this, oEvent);
        },
        onAddRow: function () {
            TableManager.onAddRow(this);
        },
        onDeleteRow: function (oEvent) {
            TableManager.onDeleteRow(this, oEvent);
        },
        onAddListItem: function () {
            ListManager.onAddListItem(this);
        },
        onDeleteListItem: function (oEvent) {
            ListManager.onDeleteListItem(this, oEvent);
        },
        onAddTreeNode: function () {
            TreeManager.onAddTreeNode(this);
        },
        onDeleteTreeNode: function (oEvent) {
            TreeManager.onDeleteTreeNode(this, oEvent);
        },

        onAddCustomAction: function () {
            DialogManager.onAddCustomAction(this);
        },

        onDeleteCustomAction: function (oEvent) {
            DialogManager.onDeleteCustomAction(this, oEvent);
        },

        onTriggerCSVImport: function () {
            ImportExportManager.onTriggerCSVImport();
        },
        _parseCSV: function (sText) {
            ImportExportManager.parseCSV(this, sText);
        },

        _buildPreviewTree: function (oMetadata) {
            return PreviewManager.buildPreviewTree(this, oMetadata);
        },

        onPreview: function () {
            PreviewManager.onPreview(this);
        },

        onClosePreview: function () { 
            PreviewManager.onClosePreview(this);
         },

        onViewJson: function () {
            ImportExportManager.onViewJson(this);
        },

        onApplyJson: function () {
            ImportExportManager.onApplyJson(this);
        },

        onCloseJson: function () { 
            ImportExportManager.onCloseJson(this);
         },

        onExport: function () {
            ImportExportManager.onExport(this);
        },

        onOpenCodeEditor: function (oEvent) {
            DialogManager.onOpenCodeEditor(this, oEvent);
        },

        onSaveCodeEditor: function () {
            DialogManager.onSaveCodeEditor(this);
        },

        onCloseCodeEditor: function () {
            DialogManager.onCloseCodeEditor(this);
        },
    });
});