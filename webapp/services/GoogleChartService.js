// Author: Andrew Hajj
// Purpose: functions to get calendar info from google

sap.ui.define('com/metcs633/services/GoogleChartService', [
], function () {
	'use strict';

	var Utils = {};

	Utils.drawChart = function (catData, controller, callback) {
		// Create the data table.
		var eventDataHolder = [];
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Event');
		data.addColumn('number', 'Hours');
		data.addRows(catData);
		// Set chart options

		var width = 800;
		var height = 800;

		if (sap.ui.Device.system.phone) {
			width = 350;
			height = 350;
		}

		var options = {
			'title': 'Hours per Category',
			'width': width,
			'height': height,
			'legend': { 'position':'bottom'}
		};
		var HBoxDomRef = controller.getView().byId('barChartPanel').getDomRef();
		// Instantiate and draw our chart, passing in our HBox.
		var chart = {};
		if (controller.isColumnChart) {
			chart = new google.visualization.ColumnChart(HBoxDomRef);
		} else {

			chart = new google.visualization.PieChart(HBoxDomRef);
		}
		google.visualization.events.addListener(chart, 'ready', function () {
			google.visualization.events.addListener(chart, 'select', function () {
				// grab a few details before redirecting
				console.log('eventDataHolder', eventDataHolder);
				if (eventDataHolder.length === 0) {
					eventDataHolder = controller.parsedEvents;
				}
				var pickedEvents = eventDataHolder.filter(e =>
					e.category === data.getValue(chart.getSelection()[0].row, 0)
				);
				// now we get the filtered events and show it in the table
				var listModel = new sap.ui.model.json.JSONModel();
				listModel.setData(pickedEvents);
				controller.getView().byId('eventsTable').setModel(listModel);

				// First set the table step as the current step
				// this will activate and show it if it hasn't already been activated
				controller._wizard.setCurrentStep(controller.getView().byId("showTable"));

				// go to step will jump to the given step on the page
				controller._wizard.goToStep(controller.getView().byId("showTable"));
			
			});
		});

		chart.draw(data, options);
		controller.chart = chart;
		callback();
		controller._wizard.goToStep(controller.getView().byId("showChart"));
	};

	return Utils;
}, true /* bExport */);