// Author: Andrew Hajj
// Purpose: functions to get calendar info from google

sap.ui.define("com/metcs633/services/GoogleCalendarService", [
], function() {
	"use strict";

	var Utils = {};

	      // Client ID and API key from the Developer Console
      var CLIENT_ID = '';
      var API_KEY = '';

      // Array of API discovery doc URLs for APIs used by the quickstart
      var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

	Utils.signIn = function (event) {
        gapi.auth2.getAuthInstance().signIn();
      };

	 // signout of google
	 Utils.signOut = function(event) {
	        gapi.auth2.getAuthInstance().signOut();
	      };

	  		//  call to connect to Google
		Utils.connectToGoogle =function(label) {
			gapi.load('client:auth2', this.initiateClient(label));

		};

		Utils.initiateClient = function(label) {

			var me = this;

			gapi.client.init({
	          apiKey: API_KEY,
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

      return Utils;
}, true /* bExport */ );