sap.ui.define([], function () {
    "use strict";
    return {
        findArrayAndIndex: function (aNodes, sId) {
            for (var i = 0; i < aNodes.length; i++) {
                if (aNodes[i].id.toString() === sId.toString()) return { array: aNodes, index: i };
                if (aNodes[i].controls) {
                    var oResult = this.findArrayAndIndex(aNodes[i].controls, sId);
                    if (oResult) return oResult;
                }
            }
            return null;
        },
        findNodeById: function (aNodes, sId) {
            var oResult = this.findArrayAndIndex(aNodes, sId);
            return oResult ? oResult.array[oResult.index] : null;
        }
    };
});