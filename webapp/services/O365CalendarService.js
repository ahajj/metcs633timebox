// Author: Andrew Hajj
// Purpose: functions to get calendar info from google
sap.ui.define("com/metcs633/services/O365CalendarService", [], function () {
	//sap.ui.define("com/metcs633/services/O365CalendarService", ["../services/O365/helpers/bundle-helpers"], function (helper) {
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
		console.log('DUDE', helper.getAuthUrlUserFlow());

		gapi.auth2.getAuthInstance().signIn();
		event.getView().byId("signButton").setText("Sign Out of O365");
		event.getView().byId("configLabel").setText("Connected to O365!");
		// get the list of calendars and pass in the combobox so it can filled
		//this.getCalendars(event);
	};

	// // Function to signout of Google
	// Utils.signOut = function (event) {
	// 	gapi.auth2.getAuthInstance().signOut();
	// 	event.getView().byId("calendarComboBox").setEnabled(false);
	// 	event.getView().byId("signButton").setText("Sign Into O365");
	// 	event.getView().byId("configLabel").setText("Connected to O365! Now click Sign into O365");
	// };

	// // Function to connect to Google Calendars
	// // This gets called on startup
	// Utils.connectToO365 = function (label) {
	// 	gapi.load('client:auth2', this.initiateClient(label));

	// };

	// // Initiate the client.
	// // This gives the client access to Google Calendar
	// // The scope is only set to read 
	// Utils.initiateClient = function (label) {

	// 	var me = this;

	// 	gapi.client.init({
	// 		clientId: CLIENT_ID,
	// 		discoveryDocs: DISCOVERY_DOCS,
	// 		scope: SCOPES
	// 	}).then(function () {
	// 		// Listen for sign-in state changes.
	// 		gapi.auth2.getAuthInstance().isSignedIn.listen(label.setText("Connected to O365! Now click Sign In."));


	// 	}, function (error) {
	// 		console.log(JSON.stringify(error, null, 2));
	// 	});
	// };
	return Utils;
}, true /* bExport */);