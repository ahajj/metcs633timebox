// Author: Andrew Hajj
// Purpose: functions to get calendar info from google
sap.ui.define([],
	function () {
		"use strict";

		var Utils = {};

		const APP_ID = "f43b3bbb-f2aa-4134-9518-e0a190584c6f";
		const APP_PASSWORD = "l42qTX74yi@xDfgeuG_TOxWrTXJMfx=/";
		const APP_SCOPES = ['Calendars.Read', 'Calendars.ReadWrite'];
		const MS_GRAPH_BASE = "https://graph.microsoft.com"

		const config = {
			msalConfig: {
				auth: {
					clientId: APP_ID
				},
				cache: {
					cacheLocation: 'localStorage',
					storeAuthStateInCookie: true
				}
			},
			graphBaseEndpoint: "https://graph.microsoft.com/v1.0/",
			scopeConfig: {
				scopes: APP_SCOPES
			}
		};

		Utils.signIn = function (event) {
			var ret = this.initiateClient();
			if (ret) {
				var idToken = ret.idToken;
				console.log('O365 token: ', ret.idToken)
				event.getView().byId("signButtonO365").setText("Sign Out of O365");
				event.getView().byId("configLabel").setText("Connected to O365!");
			}
		};

		Utils.signOut = function (event) {
			var ret = this.initiateClient(true);
			if (ret) {
				event.getView().byId("signButtonO365").setText("Sign In to O365");
				event.getView().byId("configLabel").setText("Signed Out of O365!");
			}
		};

		function handleAuthError(error) {
			console.log(error);
		}

		Utils.initiateClient = (signout = false) => {
			this.oMsalClient = new Msal.UserAgentApplication(config.msalConfig);
			if (signout) {
				this.oMsalClient.logout();
				return true;
			}
			//check if the user is already signed in
			if (!this.oMsalClient.getAccount()) {
				this.oMsalClient.loginPopup(config.scopeConfig).then((res) => {
					return res.idToken;
				}).catch((error) => {
					handleAuthError(error);
				});;
			}
			return this.oMsalClient.getAccount();
		};


		return Utils;
	}, true /* bExport */);