//Authors: Andrew Hajj

sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'../model/formatter',
	'../services/GoogleCalendarService',
	'../services/GoogleChartService',
	'../services/O365CalendarService'
], function (Controller, formatter, GoogleCalendarService, GoogleChartService, O365CalendarService) {
	'use strict';

	var signedInGoogle = false;
	var signedInO365 = false;


	return Controller.extend('com.metcs633.controller.App', {

		formatter: formatter,
		GoogleCalendarService: GoogleCalendarService,

		// Connect to Google api by default to grab the calendar
		onInit: function () {
			var configLabel = this.getView().byId('configLabel');
			configLabel.setText('Connecting to Google...');
			GoogleCalendarService.connectToGoogle(this);
		},

		afterLogin: function () {
			this.getView().byId('signButton').setEnabled(true);
			this.getView().byId('configLabel').setText('Connected to Google! Now click Sign In.');
		},


		onSignInOutGooglePress: function (event) {
			if (signedInGoogle) {
				GoogleCalendarService.signOut(this);
			}
			else {
				GoogleCalendarService.signIn(this);
			}
			signedInGoogle = !signedInGoogle;
		},

		onSignInOutO365Press: function (event) {

			if (signedInO365) {
				O365CalendarService.signOut(this);
			} else {
				O365CalendarService.signIn(this);
			}
			signedInO365 = !signedInO365;
		},
		onGetCalendarsPress: function (event) {

		},

		validateCalendarStartEndDate: function (event) {
			// only enable the Go button if
			// A calendar is selected, a start date and an end date are selected
			var calendarDropDown = this.getView().byId('calendarComboBox');
			var dtpStart = this.getView().byId('DTP1');
			var dtpEnd = this.getView().byId('DTP2');

			if (calendarDropDown.getSelectedItem() && dtpStart.getValue() && dtpEnd.getValue()) {
				this.getView().byId('goButton').setEnabled(true);
			} else {

				goButton: function(event) {
					// freeze the view so the user knows something is happening
					// sap.ui.core.

					// figure out the min and max time in order to query google calendar
					// this button doesn't get enabled until there is data in all 3 prompts (calendar, start & end date)
					var calendarDropDown = this.getView().byId('calendarComboBox');
					var dtpStart = this.getView().byId('DTP1');
					var dtpEnd = this.getView().byId('DTP2');

				},

				goButton: function (event) {
					// figure out the min and max time in order to query google calendar
					// this button doesn't get enabled until there is data in all 3 prompts (calendar, start & end date)
					var calendarDropDown = this.getView().byId('calendarComboBox');
					var dtpStart = this.getView().byId('DTP1');
					var dtpEnd = this.getView().byId('DTP2');

					// then we need the end date date
					var endTime = dtpEnd.getDateValue();
					var me = this;
					GoogleCalendarService.getListOfEventsFromCalendarInDateRange(selectedCalendar, startTime, endTime, function (response) {
						var events = response.result.items;
						console.log(events);
						GoogleCalendarService.parseListOfEvents(events, me);
					});

					this.getView().byId('changeChartType').setVisible(true);

					// then we need the end date date
					var endTime = dtpEnd.getDateValue();

					changeChart: function(event) {
						var me = this;
						GoogleChartService.drawChart(this.chartData, this, function () {
							me.isColumnChart = !(me.isColumnChart);
						});
					},

					calendarSelectionChange: function(event) {
						this.validateCalendarStartEndDate();
						// acknowledge the selection change and update the status accordingly
						this.getView().byId('configLabel').setText('Calendar '' + event.getParameters('selectedItem').selectedItem.getText() + '' loaded.');
					},

				},

				calendarSelectionChange: function (event) {
					this.validateCalendarStartEndDate();
					// acknowledge the selection change and update the status accordingly
					this.getView().byId('configLabel').setText('Calendar '' + event.getParameters('selectedItem').selectedItem.getText() + '' loaded.');
				},

				handleStartDateChange: function (event) {

					this.validateCalendarStartEndDate();
				},

				handleEndDateChange: function (event) {

					this.validateCalendarStartEndDate();
				}

			});
});