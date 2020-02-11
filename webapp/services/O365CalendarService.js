/* eslint-disable no-undef */
// Author: Andrew Hajj
// Purpose: functions to get calendar info from google
sap.ui.define([],
	function () {
		'use strict';

		var Utils = {};
		var oMsalClient = null;

		var APP_ID = 'f43b3bbb-f2aa-4134-9518-e0a190584c6f';
		var APP_SCOPES = ['Calendars.Read'];
		var config = {
			msalConfig: {
				auth: {
					clientId: APP_ID,
					//redirectUri: "http://localhost:8000/webapp", //defaults to application start page
					postLogoutRedirectUri: 'http://localhost:8000/webapp'
				},
				cache: {
					cacheLocation: 'localStorage',
					storeAuthStateInCookie: true
				}
			},
			graphBaseEndpoint: 'https://graph.microsoft.com/v1.0/',
			scopeConfig: {
				scopes: APP_SCOPES
			}
		};
		// #region Helpers
		function handleAuthError(error) {
			console.log(error);
		}

		function getMSGraphClient() {
			if (!oMsalClient) {
				if (Msal) {
					return new Msal.UserAgentApplication(config.msalConfig);
				}
			}
			return oMsalClient;
		}

		function getStartDate(startDate, endDate) {
			var start = new Date();
			var end = new Date();
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

		function set365StatusText(event) {
			var signedInO365 = (localStorage.getItem('msal.idtoken') !== null);
			if (!signedInO365) {
			//	event.getView().byId('signButtonO365').setText('Sign In to O365');
				event.getView().byId('configLabelO365').setText('Signed Out of O365!');
			} else {
			//	event.getView().byId('signButtonO365').setText('Sign Out of O365');
				event.getView().byId('configLabelO365').setText('Connected to O365!');
			}
		};

		// #endregion
		Utils.initiateClient = function (event, signout) {
			var oMsalClient = getMSGraphClient();
			var me = this;
			if (signout) {
				oMsalClient.logout();
				set365StatusText(event);
				return true;
			}
			// check if the user is already signed in
			if (!oMsalClient.getAccount()) {
				oMsalClient.loginPopup(config.scopeConfig).then(function (res) {
					set365StatusText(event);
       				me.getCalendars();
					return res;
				}).catch(function (error) {
					handleAuthError(error);
				});
			}
			set365StatusText(event);
			return true;
		};


		Utils.signIn = function (event) {
			this.initiateClient(event);
		};

		Utils.signOut = function (event) {
			this.initiateClient(event, true);
		};

		// #region Calendars
		Utils.getCalendars = function () {
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then(function (token) {
				// eslint-disable-next-line no-undef
				$.ajax({
					headers: {
						Authorization: 'Bearer ' + token.accessToken
					},
					url: config.graphBaseEndpoint + '/me/calendars',
					type: 'GET'
				}).then(function (res) {
					console.log('getCalendars', res);
					return res;
				}).fail(function (error) {
					handleAuthError(error);
				});
			});
		};

		Utils.getCalendarById = function (id) {
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then(function (token) {
				// eslint-disable-next-line no-undef
				$.ajax({
					headers: {
						Authorization: 'Bearer ' + token.accessToken
					},
					url: 'config.graphBaseEndpoint' + '/me/calendars/' + id,
					type: 'GET'
				}).then(function (res) {
					console.log('getCalendars', res);
					return res;
				}).fail(function (error) {
					handleAuthError(error);
				});
			});
		};
		// #endregion

		// #region Categories

		Utils.getCategories = function (startDate, endDate, calendarId = '') {
			var start = new Date();
			var end = new Date();

			// start and end date format 2020-01-31
			var dates = getStartDate(startDate, endDate);
			start = dates.start;
			end = dates.end;

			console.log('start date:', start);
			console.log('end date:', end);

			var apiUrl = '';
			if (calendarId && calendarId.length > 0) {
				apiUrl = '/me/calendars/' + calendarId + '/calendarView?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString();
			} else {
				apiUrl = '/me/calendar/calendarView?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString();
			}
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then(function (token) {
				$.ajax({
					headers: {
						Authorization: 'Bearer ' + token.accessToken
					},
					url: config.graphBaseEndpoint + apiUrl,
					type: 'GET'
				}).then((categories) => {
					console.log('getCategories', categories);

					var retCategories = [];
					if (categories && categories.value) {
						categories.value.forEach(element => {
							retCategories = retCategories.concat(element.categories);
						});
					}
					categories = JSON.stringify([...new Set(retCategories)]);
					console.log('getCategories result:', categories);
					return categories;
				}).fail(function (error) {
					handleAuthError(error);
				});
			});
		};

		Utils.getCategoriesTime = function (startDate, endDate, calendarId = '') {
			var start = new Date();
			var end = new Date();

			// start and end date format 2020-01-31
			var dates = getStartDate(startDate, endDate);
			start = dates.start;
			end = dates.end;

			console.log('start date:', start);
			console.log('end date:', end);

			var apiUrl = '';
			if (calendarId && calendarId.length > 0) {
				apiUrl = '/me/calendars/' + calendarId + '/calendarView?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString();
			} else {
				apiUrl = '/me/calendar/calendarView?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString();
			}
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then(function (token) {
				$.ajax({
					headers: {
						Authorization: 'Bearer ' + token.accessToken
					},
					url: config.graphBaseEndpoint + apiUrl,
					type: 'GET'
				}).then((res) => {
					console.log('getCategoriesTime', res);

					var catTimeTotals = {};
					if (res && res.value) {
						res.value.forEach(element => {
							var catTimeTotalsCats = element.categories;
							// eslint-disable-next-line max-nested-callbacks
							catTimeTotalsCats.forEach(cat => {
								if (catTimeTotals[cat]) {
									var milliSeconds = parseFloat(catTimeTotals[cat], 10);
									milliSeconds += getTimeDifference(element.start.dateTime, element.end.dateTime);
									catTimeTotals[cat] = milliSeconds;
								} else {
									catTimeTotals[cat] = getTimeDifference(element.start.dateTime, element.end.dateTime);
								}
							});
						});
					}
					res = JSON.stringify(catTimeTotals);
					console.log('getCategoriesTime:', res);
					return res;
				}).fail(function (error) {
					handleAuthError(error);
				});
			});
		};
		// #endregion

		// #region Events
		Utils.getEvents = function (startDate, endDate, calendarId = '', filterToCategory = '') {
			var start = new Date();
			var end = new Date();

			// start and end date format 2020-01-31
			var dates = getStartDate(startDate, endDate);
			start = dates.start;
			end = dates.end;

			console.log('start date:', start);
			console.log('end date:', end);

			var apiUrl = '';
			if (calendarId && calendarId.length > 0) {
				apiUrl = '/me/calendars/' + calendarId + '/calendarView?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString();
			} else {
				apiUrl = '/me/calendar/calendarView?startDateTime=' + start.toISOString() + '&endDateTime=' + end.toISOString();
			}
			getMSGraphClient().acquireTokenSilent(config.scopeConfig).then(function (token) {
				$.ajax({
					headers: {
						Authorization: 'Bearer ' + token.accessToken
					},
					url: config.graphBaseEndpoint + apiUrl,
					type: 'GET'
				}).then(function (res) {
					if (filterToCategory && filterToCategory.length > 0) {
						res.value = filterToCategory(res, filterToCategory);
					}
					console.log('getEvents', res);
					return res;
				}).fail(function (error) {
					handleAuthError(error);
				});
			});
		};
		// #endregion

		return Utils;
	}, true /* bExport */);
