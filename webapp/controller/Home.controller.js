//Authors: Andrew Hajj

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"../model/formatter",
	'../services/GoogleCalendarService'
], function(Controller, formatter, GoogleCalendarService) {
	"use strict";

    var signedInGoogle = false;

	return Controller.extend("com.metcs633.controller.App", {

	formatter: formatter,
	GoogleCalendarService: GoogleCalendarService,

	// Connect to Google api by default to grab the calendar
	onInit: function () {
		var configLabel = this.getView().byId("configLabel");
		configLabel.setText("Connecting to Google...");
		GoogleCalendarService.connectToGoogle(configLabel);
	},


    onSignInOutGooglePress:function(event) {
  		if(signedInGoogle)
  		{
  			GoogleCalendarService.signOut(this);
  		}
  		else{
  			GoogleCalendarService.signIn(this);
  		}
  		signedInGoogle = !signedInGoogle;
    },

    onGetCalendarsPress:function(event) {
      	// get the list of calendars and pass in the combobox so it can filled
      	GoogleCalendarService.getCalendars(this);
    },

    calendarSelectionChange:function(event) {

      	// acknowledge the selection change and update the status accordingly
      	this.getView().byId("configLabel").setText("Calendar '" + event.getParameters("selectedItem").selectedItem.getText() + "' loaded.");

    }

	});
});