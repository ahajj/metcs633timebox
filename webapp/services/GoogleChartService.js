// Author: Andrew Hajj
// Purpose: functions to get calendar info from google

sap.ui.define('com/metcs633/services/GoogleChartService', [
], function () {
	'use strict';

	var Utils = {};

	Utils.drawChart = function (catData, controller, callback = function () { }) {
		// Create the data table.
		var data = new google.visualization.DataTable();
		data.addColumn('string', 'Event');
		data.addColumn('number', 'Hours');
		data.addRows(catData);
		// Set chart options

		var width = 800;
		var height = 800;

		if (sap.ui.Device.system.phone) {
			width = 200;
			height = 200;
		}

		var options = {
			'title': 'Hours per Category',
			'width': width,
			'height': height
		};
		var HBoxDomRef = controller.getView().byId('barChartPanel').getDomRef();
		// Instantiate and draw our chart, passing in our HBox.
		if (controller.isColumnChart) {
			var chart = new google.visualization.ColumnChart(HBoxDomRef);
		} else {

			var chart = new google.visualization.PieChart(HBoxDomRef);
		}
		google.visualization.events.addListener(chart, 'ready', function () {
			google.visualization.events.addListener(chart, 'select', function () {
				// grab a few details before redirecting
				var events = controller.parsedEvents;
				var pickedEvents = events.filter(e =>
					e.category === data.getValue(chart.getSelection()[0].row, 0)
				);

				// now we get the filtered events and show it in the table
				var listModel = new sap.ui.model.json.JSONModel();
				listModel.setData(pickedEvents);
				controller.getView().byId('eventsTable').setModel(listModel);
				controller.getView().byId('page').scrollToElement(controller.getView().byId('eventsTable'));
			});
		});

		chart.draw(data, options);

		callback();
		controller.getView().byId('page').scrollToElement(controller.getView().byId('barChartPanel'));
	};

	return Utils;
}, true /* bExport */);