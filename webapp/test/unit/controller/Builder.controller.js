/*global QUnit*/

sap.ui.define([
	"dynamicuibuilder/controller/Builder.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Builder Controller");

	QUnit.test("I should test the Builder controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
