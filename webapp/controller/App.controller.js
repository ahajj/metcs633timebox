sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'com/metcs633/model/formatter'
], function (Controller, formatter) {
	'use strict'

	return Controller.extend('com.metcs633.controller.App', {
		formatter: formatter,
		onInit: function () { }
	})
})
