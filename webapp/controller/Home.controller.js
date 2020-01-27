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
      			GoogleCalendarService.signOut();
      			this.getView().byId("signButton").setText("Sign Into Google");
      			this.getView().byId("configLabel").setText("Connected to Google! Now click Sign Into Google to login.");
      		}
      		else{
      			GoogleCalendarService.signIn();
      			this.getView().byId("signButton").setText("Sign Out of Google");
      			this.getView().byId("configLabel").setText("Connected to Google! Now click Sign Out of Google to logout.");
      		}
      		signedInGoogle = !signedInGoogle;
      },


	});
});