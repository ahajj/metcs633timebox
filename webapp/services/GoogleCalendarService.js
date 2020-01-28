// Author: Andrew Hajj
// Purpose: functions to get calendar info from google

sap.ui.define("com/metcs633/services/GoogleCalendarService", [
], function() {
	"use strict";

	var Utils = {};

    // Client ID from the Developer Console
    var CLIENT_ID = '782211928709-49gkv11kmh5mji6m79rs9df57ba3u6pv.apps.googleusercontent.com';

    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

    // Authorization scopes required by the API; multiple scopes can be
    // included, separated by spaces.
    var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

	// Function to authenticate the user and choose the Google Account
	Utils.signIn = function (event) {
        gapi.auth2.getAuthInstance().signIn();
        event.getView().byId("getCalendarsBtn").setEnabled(true);
     	event.getView().byId("signButton").setText("Sign Out of Google");
  		event.getView().byId("configLabel").setText("Connected to Google! Now click get Calendars.");
    };

	// Function to signout of Google
	Utils.signOut = function(event) {
	        gapi.auth2.getAuthInstance().signOut();
            event.getView().byId("getCalendarsBtn").setEnabled(false);
  			event.getView().byId("calendarComboBox").setEnabled(false);
     		event.getView().byId("signButton").setText("Sign Into Google");
  			event.getView().byId("configLabel").setText("Connected to Google! Now click Sign into Google");
	};
	
  	// Function to connect to Google Calendars
  	// This gets called on startup
	Utils.connectToGoogle =function(label) {
		gapi.load('client:auth2', this.initiateClient(label));

	};

	// Initiate the client.
	// This gives the client access to Google Calendar
	// The scope is only set to read 
	Utils.initiateClient = function(label) {

		var me = this;

		gapi.client.init({
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(function () {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen(label.setText("Connected to Google! Now click Sign In."));


        }, function(error) {
          console.log(JSON.stringify(error, null, 2));
        });
	};

	// Get the list of Calendars
	Utils.getCalendars = function(controller) {

		var calendarDropDown =controller.getView().byId("calendarComboBox");
		var statusLabel = controller.getView().byId("configLabel");
		// first turn on the busy indicator
		calendarDropDown.setBusy(true);

		// initialize the list of parsed calendar data
		var parsedList = [];

		var listOfCalendars = gapi.client.calendar.calendarList.list().then(function(response) {
			console.log(response);

			// now get the list of calendars from the response
			var list = response.result.items;

			// now parse it in the format that we want...
			for (var i = 0; i< list.length; i++)
			{
				var curCalObj = list[i];
				var curCalParsed = {};

				// summary in the map is the Calendar name
				curCalParsed.name = curCalObj.hasOwnProperty("summary") ? curCalObj.summary : "Undefined";

				// get the id
				curCalParsed.id = curCalObj.hasOwnProperty("id") ? curCalObj.id : "";

				// add it to the list of possible calendars
				parsedList.push(curCalParsed);

			}

			// add the list of parsed calendars to the dropdown for user to select
			var listModel = new sap.ui.model.json.JSONModel();
			
			
			listModel.setData(parsedList);
			calendarDropDown.setModel(listModel);
			calendarDropDown.setBusy(false);
			calendarDropDown.setEnabled(true);
			statusLabel.setText("Loaded calendars!")

		});
		console.log(listOfCalendars);
	}

  return Utils;
}, true /* bExport */ );