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
  var isGoogle = true;


	return Controller.extend('com.metcs633.controller.App', {

		formatter: formatter,
		GoogleCalendarService: GoogleCalendarService,

    setCalendarTypeFromButton: function(event) {
      isGoogle = (event.getParameters().item.getText() === "Google") ? true : false;

      // if it goes in here that means we need to reset all the things
      if (this._wizard.getProgress() > 1)
      {
                var calendarDropDown = this.getView().byId('calendarComboBox');
      var dtpStart = this.getView().byId('DTP1');
      var dtpEnd = this.getView().byId('DTP2');
      calendarDropDown.setSelectedItem("");
      dtpStart.setValue("");
      dtpEnd.setValue("");
          this._wizard.discardProgress(this._wizard.getSteps()[0]);

      }

    },

		set365StatusText: function () {
			signedInO365 = (localStorage.getItem('msal.idtoken') !== null);
			if (!signedInO365) {
				//this.getView().byId('signButtonO365').setText('Sign In to O365');
				this.getView().byId('configLabelO365').setText('Signed Out of O365!');
			} else {
				//this.getView().byId('signButtonO365').setText('Sign Out of O365');
				this.getView().byId('configLabelO365').setText('Connected to O365!');
			}
		},

		// Connect to Google api by default to grab the calendar
		onInit: function () {
			var configLabel = this.getView().byId('configLabel');
			configLabel.setText('Connecting to Google...');
			GoogleCalendarService.connectToGoogle(this);

			//Connect to O365
			var configLabelO365 = this.getView().byId('configLabelO365');
			this.set365StatusText();
      this._wizard = this.getView().byId("CreateProductWizard");

		},

		afterLogin: function () {
			this.getView().byId('signButton').setEnabled(true);
			this.getView().byId('configLabel').setText('Connected to Google! Now click Sign In.');
		},

    onSignIn: function(event) {
        if(isGoogle)
        {
          this.onSignInOutGooglePress();
        }
        else {
          this.onSignInOutO365Press();
        }
    },

		onSignInOutGooglePress: function (event) {
			if (signedInGoogle) {
				GoogleCalendarService.signOut(this);
			} else {
				GoogleCalendarService.signIn(this);
			}
			signedInGoogle = !signedInGoogle;
		},

		onSignInOutO365Press: function (event) {
			if (signedInO365) {
				O365CalendarService.signOut(this);
				this.set365StatusText();
			} else {
				O365CalendarService.signIn(this);
				this.set365StatusText();
			}
		},

		onGetCalendarsPress: function (event) {

		},

      signInAndChoosseValidation: function (event) {
      // only enable the Go button if
      // A calendar is selected, a start date and an end date are selected
      var calendarDropDown = this.getView().byId('calendarComboBox');
      var dtpStart = this.getView().byId('DTP1');
      var dtpEnd = this.getView().byId('DTP2');

      if (calendarDropDown.getSelectedItem() && dtpStart.getValue() && dtpEnd.getValue()) {
        return true;
      } 
      return false;

    },

		validateCalendarStartEndDate: function (event) {
			// only enable the Go button if
			// A calendar is selected, a start date and an end date are selected
			var calendarDropDown = this.getView().byId('calendarComboBox');
			var dtpStart = this.getView().byId('DTP1');
			var dtpEnd = this.getView().byId('DTP2');

			if (calendarDropDown.getSelectedItem() && dtpStart.getValue() && dtpEnd.getValue()) {
        this._wizard.validateStep(this.byId("signInAndChooseCalendarStep"));
				//this.getView().byId('goButton').setEnabled(true);
			} else {
        this._wizard.invalidateStep(this.byId("signInAndChooseCalendarStep"));
        this._wizard.goToStep(this.byId("signInAndChooseCalendarStep"));
			}

		},

		goButton: function (event) {
			// freeze the view so the user knows something is happening
			// sap.ui.core.

			// figure out the min and max time in order to query google calendar
			// this button doesn't get enabled until there is data in all 3 prompts (calendar, start & end date)
			var calendarDropDown = this.getView().byId('calendarComboBox');
			var dtpStart = this.getView().byId('DTP1');
			var dtpEnd = this.getView().byId('DTP2');

			// First, we need the selected calendar
			var selectedCalendar = calendarDropDown.getSelectedItem();

			// then we need the start date time
			var startTime = dtpStart.getDateValue();

			// then we need the end date date
			var endTime = dtpEnd.getDateValue();
			var me = this;
			GoogleCalendarService.getListOfEventsFromCalendarInDateRange(selectedCalendar, startTime, endTime, function (response) {
				var events = response.result.items;
				console.log(events);
				GoogleCalendarService.parseListOfEvents(events, me);
			});
      if (!this.getView().byId("goButton").getVisible())
      {
        this.getView().byId('changeChartType').setVisible(true);
        this.getView().byId("goButton").setVisible(true);
        this.byId("showChart").fireComplete();
      }
      this._wizard.goToStep(this.getView().byId("showChart"));

		},

		changeChart: function (event) {
			var me = this;
			GoogleChartService.drawChart(this.chartData, this, function () {
				me.isColumnChart = !(me.isColumnChart);
			});
		},

		calendarSelectionChange: function (event) {
			this.validateCalendarStartEndDate();
			// acknowledge the selection change and update the status accordingly
			this.getView().byId('configLabel').setText("Calendar '" + event.getParameters('selectedItem').selectedItem.getText() + "' loaded.");
		},

		handleStartDateChange: function (event) {

			this.validateCalendarStartEndDate();
		},

		handleEndDateChange: function (event) {

			this.validateCalendarStartEndDate();
		}

	});
});