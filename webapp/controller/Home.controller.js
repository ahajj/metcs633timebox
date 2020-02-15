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
  var toastOptions = {
    duration: 2000,                  // default
    width: "15em",                   // default
    my: "center top",             // default
    at: "center top",             // default
    of: window,                      // default
    offset: "0 0",                   // default
    collision: "fit fit",            // default
    onClose: null,                   // default
    autoClose: true,                 // default
    animationTimingFunction: "ease", // default
    animationDuration: 3000,         // default
    closeOnBrowserNavigation: true   // default
  };


  return Controller.extend('com.metcs633.controller.App', {

    formatter: formatter,
    GoogleCalendarService: GoogleCalendarService,

    setCalendarTypeFromButton: function (event) {
      isGoogle = (event.getParameters().item.getText() === "Google") ? true : false;

      // if it goes in here that means we need to reset all the things
      if (this._wizard.getProgress() > 1) {
        var calendarDropDown = this.getView().byId('calendarComboBox');
        var dtpStart = this.getView().byId('DTP1');
        var dtpEnd = this.getView().byId('DTP2');
        calendarDropDown.setSelectedItem("");
        dtpStart.setValue("");
        dtpEnd.setValue("");
        this.getView().byId('calendarSelectionPanel').setVisible(false);
        this._wizard.discardProgress(this._wizard.getSteps()[0]);
      }
    },

    set365StatusText: function () {
      signedInO365 = (localStorage.getItem('msal.idtoken') !== null);
      if (!signedInO365) {
        //this.getView().byId('signButton').setText('Sign In to O365');
        //this.getView().byId('configLabelO365').setText('Signed Out of O365!');
        sap.m.MessageToast.show('Signed Out of O365!', toastOptions);
      } else {
        //this.getView().byId('signButton').setText('Sign Out of O365');
        //this.getView().byId('configLabelO365').setText('Connected to O365!');
        sap.m.MessageToast.show('Connected to O365!', toastOptions);
      }
    },

    // Connect to Google api by default to grab the calendar
    onInit: function () {
      var configLabel = this.getView().byId('configLabel');
      sap.m.MessageToast.show('Connecting to Google...', toastOptions);
      //configLabel.setText('Connecting to Google...');
      GoogleCalendarService.connectToGoogle(this);

      //Connect to O365
      var configLabelO365 = this.getView().byId('configLabelO365');
      this.set365StatusText();
      this._wizard = this.getView().byId("CreateProductWizard");

    },

    afterLogin: function () {
      this.getView().byId('signButton').setEnabled(true);
      //this.getView().byId('configLabel').setText('Connected to Google!');
      sap.m.MessageToast.show('Connected to Google!', toastOptions);
    },

    onSignIn: function (event) {
      if (isGoogle) {
        this.onSignInOutGooglePress();
      }
      else {
        this.onSignInOutO365Press();
      }
    },

    onSignInOutGooglePress: function (event) {
      if (signedInGoogle) {
        GoogleCalendarService.signOut(this);
      } else {   // first turn on the busy indicator
        this.getView().byId('calendarComboBox').setBusy(true);
        GoogleCalendarService.signIn(this);
      }
      signedInGoogle = !signedInGoogle;
    },

    onSignInOutO365Press: function (event) {
      if (signedInO365) {
        O365CalendarService.signOut(this);
        this.getView().byId('signButton').setText('Sign In to O365');
        this.set365StatusText();
      } else {
        O365CalendarService.signIn(this);
        this.set365StatusText();
      }
    },
    chooseStepCompleted: function (event) {
      // We don't keep the cookies for Google, but we do for outlook
      // if this if coming from step 1 then check if the user is signed in
      // if so, go right to getting the calendars
      signedInO365 = (localStorage.getItem('msal.idtoken') !== null);
      if (!isGoogle && signedInO365) {
        this.set365StatusText();
        this.getView().byId('signButton').setText('Sign Out of O365');
        O365CalendarService.getCalendars(this.setCalendarDropDownEvents.bind(this));
      }
      else if (!isGoogle) {
        this.getView().byId('signButton').setText('Sign In to O365');
      }
      else if (!signedInGoogle) {
        // clear the calendar selection
        // set the button to login
        this.getView().byId('signButton').setText('Sign In to Google');
      }
      else {

        this.getView().byId('signButton').setText('Sign Out of Google');
        GoogleCalendarService.getCalendars(this.setCalendarDropDownEvents.bind(this));
        this.getView().byId('calendarSelectionPanel').setVisible(true);
      }

    },

    setCalendarDropDownEvents: function (events) {

      var calendarDropDown = this.getView().byId('calendarComboBox');
      var statusLabel = this.getView().byId('configLabel');
      // add the list of parsed calendars to the dropdown for user to select
      var listModel = new sap.ui.model.json.JSONModel();


      listModel.setData(events);
      calendarDropDown.setModel(listModel);
      this.getView().byId('calendarSelectionPanel').setVisible(true);
      calendarDropDown.setBusy(false);
      // statusLabel.setText('Loaded calendars!');
      sap.m.MessageToast.show('Loaded calendars!', toastOptions);
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
      this.getView().byId("page").setBusy(true);
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

      if (isGoogle) {
        GoogleCalendarService.getListOfEventsFromCalendarInDateRange(selectedCalendar, startTime, endTime, function (response) {
          var events = response.result.items;
          //console.log(events);
          GoogleCalendarService.parseListOfEvents(events, me.setChartAfterParsingEvents.bind(me));
          me.getView().byId("page").setBusy(false);
        });
      }
      else {
        O365CalendarService.getEvents(startTime, endTime, selectedCalendar, function (response) {
          var events = response.value;
          GoogleCalendarService.parseListOfEvents(events, me.setChartAfterParsingEvents.bind(me));
          me.getView().byId("page").setBusy(false);
          // GoogleCalendarService.parseListOfEvents(events, me);
        });
      }
      // if (!this.getView().byId("goButton").getVisible())
      // {
      this.getView().byId('changeChartType').setVisible(true);
      this.getView().byId("goButton").setVisible(true);
      this.byId("showChart").fireComplete();
      // }
      this._wizard.goToStep(this.getView().byId("showChart"));

    },

    setChartAfterParsingEvents: function (categorizedData, parsedEvents) {
      // set the data back into the conteroller so it's retrievable after
      this.chartData = categorizedData;
      this.parsedEvents = parsedEvents;
      this.isColumnChart = (this.hasOwnProperty('isColumnChart')) ? !(this.isColumnChart) : true;
      var me = this;
      GoogleChartService.drawChart(categorizedData, me, function () {
        // fill in the table
        var listModel = new sap.ui.model.json.JSONModel();
        listModel.setData(parsedEvents);
        me.getView().byId('eventsTable').setModel(listModel);
        me.getView().byId('eventsTable').setVisible(true);
        // me.getView().byId('configLabel').setText('Analyzed time!  Scroll down to see a visual representation');
        me.isColumnChart = !(me.isColumnChart);
      });
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
      //this.getView().byId('configLabel').setText("Calendar '" + event.getParameters('selectedItem').selectedItem.getText() + "' loaded.");
      sap.m.MessageToast.show("Calendar '" + event.getParameters('selectedItem').selectedItem.getText() + "' loaded.", toastOptions);
    },

    handleStartDateChange: function (event) {

      this.validateCalendarStartEndDate();
    },

    handleEndDateChange: function (event) {

      this.validateCalendarStartEndDate();
    }

  });
});