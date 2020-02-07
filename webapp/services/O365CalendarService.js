// Author: Andrew Hajj
// Purpose: functions to get calendar info from google
sap.ui.define([],
	function () {
		"use strict";

		var Utils = {};
		var oMsalClient = null;

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
		//#region Helpers
		function handleAuthError(error) {
			console.log(error);
		}

		function getMSGraphClient() {
			if (!oMsalClient) {
				return new Msal.UserAgentApplication(config.msalConfig);
			}
			return oMsalClient;
		}
		//#endregion
		Utils.initiateClient = (signout = false) => {
			let oMsalClient = getMSGraphClient();
			if (signout) {
				oMsalClient.logout();
				return true;
			}
			//check if the user is already signed in
			if (!oMsalClient.getAccount()) {
				oMsalClient.loginPopup(config.scopeConfig).then((res) => {
					return res.idToken;
				}).catch((error) => {
					handleAuthError(error);
				});
			}
			return oMsalClient.getAccount();
		};

		Utils.signIn = function (event) {
			var ret = this.initiateClient();
			if (ret) {
				var idToken = ret.idToken;
				console.log('O365 token: ', ret.idToken)
				event.getView().byId("signButtonO365").setText("Sign Out of O365");
				event.getView().byId("configLabel").setText("Connected to O365!");
				this.getCalendars();
				this.getCategories();
				this.getCategoriesTime();
			}
		};

		Utils.signOut = function (event) {
			var ret = this.initiateClient(true);
			if (ret) {
				event.getView().byId("signButtonO365").setText("Sign In to O365");
				event.getView().byId("configLabel").setText("Signed Out of O365!");
			}
		};

		//#region Calendars
		Utils.getCalendars = function () {
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then((token) => {
				$.ajax({
					headers: {
						"Authorization": "Bearer " + token.accessToken
					},
					url: `${config.graphBaseEndpoint}/me/calendars`,
					type: "GET"
				}).then((res) => {
					console.log(`getCalendars`, res);
				}).fail((error) => {
					handleAuthError(error);
				});
			});
		}

		Utils.getCalendarById = function (id) {
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then((token) => {
				$.ajax({
					headers: {
						"Authorization": "Bearer " + token.accessToken
					},
					url: `${config.graphBaseEndpoint}/me/calendars/${id}`,
					type: "GET"
				}).then((res) => {
					console.log(`getCalendars`, res);
				}).fail((error) => {
					handleAuthError(error);
				});
			});
		}
		//#endregion



		//#region Categories
		function getStartDate(startDate, endDate) {
			let start, end = new Date();
			if (startDate && endDate) {
				start = new Date(new Date(startDate).setHours(0, 0, 0));
				end = new Date(new Date(endDate).setHours(0, 0, 0));
			} else {
				end = new Date(new Date().setHours(0, 0, 0));
				start = new Date(new Date(2015, 3, 2).setHours(0, 0, 0));
			}
			return { start, end };
		}


		function getTimeDifference(start, end) {
			return (Date.parse(end) - Date.parse(start));
		}

		Utils.getCategories = function (startDate, endDate, calendarId = '') {
			let start, end = new Date();

			//start and end date format 2020-01-31
			let dates = getStartDate(startDate, endDate);
			start = dates.start;
			end = dates.end;

			console.log('start date:', start);
			console.log('end date:', end);

			var apiUrl = '';
			if (calendarId && calendarId.length > 0) {
				apiUrl = `/me/calendars/${calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
			} else {
				apiUrl = `/me/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
			}
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then((token) => {
				$.ajax({
					headers: {
						"Authorization": "Bearer " + token.accessToken
					},
					url: `${config.graphBaseEndpoint}${apiUrl}`,
					type: "GET"
				}).then((categories) => {
					console.log(`getCategories`, categories);

					let retCategories = [];
					if (categories && categories.value) {
						categories.value.forEach(element => {
							retCategories = retCategories.concat(element.categories);
						});
					}
					categories = JSON.stringify([...new Set(retCategories)]);
					console.log('getCategories result:', categories);

				}).fail((error) => {
					handleAuthError(error);
				});
			});
		}

		Utils.getCategoriesTime = function (startDate, endDate, calendarId = '') {
			let start, end = new Date();

			//start and end date format 2020-01-31
			let dates = getStartDate(startDate, endDate);
			start = dates.start;
			end = dates.end;

			console.log('start date:', start);
			console.log('end date:', end);

			var apiUrl = '';
			if (calendarId && calendarId.length > 0) {
				apiUrl = `/me/calendars/${calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
			} else {
				apiUrl = `/me/calendar/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`;
			}
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then((token) => {
				$.ajax({
					headers: {
						"Authorization": "Bearer " + token.accessToken
					},
					url: `${config.graphBaseEndpoint}${apiUrl}`,
					type: "GET"
				}).then((res) => {
					console.log(`getCategoriesTime`, res);

					let catTimeTotals = {};
					if (res && res.value) {
						res.value.forEach(element => {
							var catTimeTotalsCats = element.categories;
							catTimeTotalsCats.forEach(cat => {
								if (catTimeTotals[cat]) {
									let milliSeconds = parseFloat(catTimeTotals[cat], 10);
									milliSeconds += getTimeDifference(element.start.dateTime, element.end.dateTime);
									catTimeTotals[cat] = milliSeconds;
								} else {
									catTimeTotals[cat] = getTimeDifference(element.start.dateTime, element.end.dateTime)
								}
							});

						});
					}
					res = JSON.stringify(catTimeTotals);
					console.log('getCategoriesTime:', res);

				}).fail((error) => {
					handleAuthError(error);
				});
			});
		}
		//#endregion

		Utils.getListOfEventsFromCalendarInDateRange = function (calendar, startDate, endDate, controller) {
		}

		return Utils;
	}, true /* bExport */);