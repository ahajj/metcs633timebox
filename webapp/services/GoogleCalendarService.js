// Author: Andrew Hajj
// Purpose: functions to get calendar info from google

sap.ui.define('com/metcs633/services/GoogleCalendarService', [
	'../services/GoogleChartService'
], function (GoogleChartService) {
	'use strict';

	var Utils = {};

	// Client ID from the Developer Console
	var CLIENT_ID = '782211928709-49gkv11kmh5mji6m79rs9df57ba3u6pv.apps.googleusercontent.com';

	// Array of API discovery doc URLs for APIs used by the quickstart
	var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

	// Authorization scopes required by the API; multiple scopes can be
	// included, separated by spaces.
	var SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

	// Can put into a db at a later date.
	var eventCategories = {
		'Recreation': [
			'painting', 'art workshop', 'sketching workshop', 'drawing workshop', 'reading', 'newspaper', 'book club', 'camping', 'cinema', 'movies', 'concert', 'gig', 'concerts', 'recital', 'gigs', 'piano', 'singing', 'music', 'choir', 'flute', 'violin', 'orchestra', 'oboe', 'clarinet', 'saxophone', 'cornett', 'trumpet', 'contrabass', 'cello', 'trombone', 'tuba', 'music', 'ensemble', 'string quartett', 'guitar', 'classical', 'choir', 'massage', 'backrub', 'massages', 'manicure', 'pedicure', 'manicures', 'pedicures', 'spa'
		],
		'Sports': [
			'badminton', 'yoga', 'basketball', 'baseball', 'billiard', 'bowling', 'bicycle', 'cycling', 'bike', 'bicycles', 'bikes', 'biking', 'dance', 'dancing', 'dances', 'golf', 'hiking', 'hike', 'hikes', 'kayaking', 'ping pong', 'table tennis', 'ping-pong', 'pingpong', 'jog', 'jogging', 'running', 'jogs', 'runs', 'sail', 'sailing', 'boat cruise', 'sailboat', 'skiing', 'ski', 'skis', 'snowboarding', 'snowshoeing', 'snow shoe', 'snow boarding', 'soccer', 'swim', 'swimming', 'swims', 'tennis', 'going for a walk', 'walking', 'sport'
		],
		'Gym': [
			'gym', 'workout', 'workouts'
		],
		'Food': [
			'bbq', 'barbecue', 'barbeque', 'breakfast', 'breakfasts', 'brunch', 'brunches', 'coffee', 'coffees', 'dinner', 'dinners', 'restaurant', 'restaurants', 'family meal', 'cocktail', 'drinks', 'cocktails', 'lunch', 'lunches', 'luncheon', 'cookout'
		],
		'Appointments': [
			'mechaninc', 'oil change', 'car service', 'service', 'dentist', 'dentistry', 'dental', 'graduation', 'haircut', 'hair', 'wedding', 'repair', 'handyman', 'electrician', 'plumber', 'DIY'
		],
		'Work': [
			'deadline', 'meeting', 'office', 'work'
		],
		'Social': [
			'call', 'talk', 'meet', 'catch up', 'together'
		],
		'Doctors': [
			'doctor', 'dr.', 'vision', 'therapy', 'heal', 'med'
		],
		'School': [
			'class', 'test', 'quiz', 'homework', 'project', 'exam'
		],
		'Travel': [
			'roadtrip', 'drive', 'commute', 'flight', 'fly', 'airplane', 'airport', 'hotel', 'motel', 'resort', 'stay', 'vacation', 'plane', 'boat', 'sail', 'stay'
		],
		'Chores': [
			'cleaning', 'clean', 'tidy', 'vacuum'
		]
	};

	// Function to authenticate the user and choose the Google Account
	Utils.signIn = function (event) {
		gapi.auth2.getAuthInstance().signIn();
		event.getView().byId('signButton').setText('Sign Out of Google');
		event.getView().byId('configLabel').setText('Connected to Google!');
		// get the list of calendars and pass in the combobox so it can filled
		this.getCalendars(event);
	};

	// Function to signout of Google
	Utils.signOut = function (event) {
		gapi.auth2.getAuthInstance().signOut();
		event.getView().byId('calendarComboBox').setEnabled(false);
		event.getView().byId('signButton').setText('Sign Into Google');
		event.getView().byId('configLabel').setText('Connected to Google! Now click Sign into Google');
	};

	// Function to connect to Google Calendars
	// This gets called on startup
	Utils.connectToGoogle = function (callback) {
		gapi.load('client:auth2', this.initiateClient(callback));

	};

	// Initiate the client.
	// This gives the client access to Google Calendar
	// The scope is only set to read 
	Utils.initiateClient = function (controller) {

		var me = this;

		gapi.client.init({
			clientId: CLIENT_ID,
			discoveryDocs: DISCOVERY_DOCS,
			scope: SCOPES
		}).then(function () {
			// Listen for sign-in state changes.
			gapi.auth2.getAuthInstance().isSignedIn.listen(me.setItemsAfterLogin(controller));


		}, function (error) {
			console.log(JSON.stringify(error, null, 2));
		});
	};

	Utils.setItemsAfterLogin = function (controller) {
		controller.getView().byId('configLabel').setText('Connected to Google! Now click Sign In.');
		controller.getView().byId('signButton').setEnabled(true);
		controller.getView().byId('signButton').setBusy(false);
	};

	// Get the list of Calendars
	Utils.getCalendars = function (controller) {

		var calendarDropDown = controller.getView().byId('calendarComboBox');
		var statusLabel = controller.getView().byId('configLabel');
		// first turn on the busy indicator
		calendarDropDown.setBusy(true);

		// initialize the list of parsed calendar data
		var parsedList = [];

		var listOfCalendars = gapi.client.calendar.calendarList.list().then(function (response) {
			console.log(response);

			// now get the list of calendars from the response
			var list = response.result.items;

			// now parse it in the format that we want...
			for (var i = 0; i < list.length; i++) {
				var curCalObj = list[i];
				var curCalParsed = {};

				// summary in the map is the Calendar name
				curCalParsed.name = curCalObj.hasOwnProperty('summary') ? curCalObj.summary : 'Undefined';

				// get the id
				curCalParsed.id = curCalObj.hasOwnProperty('id') ? curCalObj.id : '';

				// add it to the list of possible calendars
				parsedList.push(curCalParsed);

			}

			// add the list of parsed calendars to the dropdown for user to select
			var listModel = new sap.ui.model.json.JSONModel();


			listModel.setData(parsedList);
			calendarDropDown.setModel(listModel);
			controller.getView().byId('calendarSelectionPanel').setVisible(true);
			calendarDropDown.setBusy(false);
			statusLabel.setText('Loaded calendars!');

		});
		console.log(listOfCalendars);
	};

	// eslint-disable-next-line no-unused-expressions
	Utils.getListOfEventsFromCalendarInDateRange = function (calendar, startDate, endDate, callback) {

		// the calendar key is what Gooogle Calendar API needs
		var calendarKey = calendar.getKey();
		var startDateString = startDate.toISOString();
		var endDateString = endDate.toISOString();


		// get the list of events in the calendar
		gapi.client.calendar.events.list({
			'calendarId': calendarKey,
			'timeMin': startDateString,
			'timeMax': endDateString,
			'showDeleted': false,
			'singleEvents': true,
			'orderBy': 'startTime'
		}).then(callback);

	},

		Utils.parseISOStringToDate = function (string) {
			var b = string.split(/\D+/);

			// handle the parsing for dates
			if (b.length === 3) {
				return new Date(Date.UTC(b[0], --b[1], b[2]));
			}
			// handle the parsing for datetimes

			return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
		},

		Utils.getCategoryForEvent = function (event) {

			// loop through each of the event keys in the categories
			var keys = Object.getOwnPropertyNames(eventCategories);
			for (var k = 0; k < keys.length; k++) {
				var key = keys[k];
				// now check all keywords in the event name to see if there is a match
				if (eventCategories[key].some(function (keyword) {
					event.keyword = (event.name.toLowerCase()).includes(keyword.toLowerCase()) ? keyword.toLowerCase() : '';
					return (event.name.toLowerCase()).includes(keyword.toLowerCase());
				}
				)) {

					console.log('Found ' + event.name + ' paired with ' + key + ' because of keyword: ' + event.keyword);
					return key;
				}
			}

			console.log("Couldn't find a match for " + event.name + ' so they are in Other');
			// return 'Other' as the category if it hits this point
			return 'Other';
		},

		Utils.collectHoursInCategories = function (events) {
			var squashedEvents = {};

			for (var e = 0; e < events.length; e++) {
				var event = events[e];

				if (isNaN(event.time)) {
					continue;
				}

				if (squashedEvents.hasOwnProperty(event.category)) {
					squashedEvents[event.category] = (squashedEvents[event.category] + event.time);
				} else {
					squashedEvents[event.category] = event.time;
				}
			}

			// now loop through the map and build a data map in the appropiate format
			var listOfCategories = [];
			var categories = Object.getOwnPropertyNames(squashedEvents);

			for (var c = 0; c < categories.length; c++) {
				var category = categories[c];
				var curRow = [];
				curRow.push(category);
				curRow.push(squashedEvents[category]);
				listOfCategories.push(curRow);
			}

			return listOfCategories;
		},


		Utils.parseListOfEvents = function (events, controller) {
			var parsedEvents = [];

			for (var i = 0; i < events.length; i++) {
				var parsedEvent = {};

				// get the events start date & time.  Use date if date time is not there
				var event = events[i];

				var startTime = (event.start.dateTime) ? event.start.dateTime : event.start.date;
				var endTime = (event.end.dateTime) ? event.end.dateTime : event.end.date;
				var description = (event.description) ? event.description : '';

				parsedEvent.name = event.summary;
				parsedEvent.description = description;
				parsedEvent.startTimeString = startTime;
				parsedEvent.endTimeString = endTime;
				parsedEvent.startTime = this.parseISOStringToDate(startTime);
				parsedEvent.endTime = this.parseISOStringToDate(endTime);

				// figure out what category this event falls into
				parsedEvent.category = this.getCategoryForEvent(parsedEvent);

				// now get the time difference in hours between the start time and the end time
				parsedEvent.time = Math.ceil(Math.abs(parsedEvent.endTime - parsedEvent.startTime) / (1000 * 60 * 60));

				// if time is NaN that is problem
				if (isNaN(parsedEvent.time)) {
					console.log(isNan(event));
				}

				// add the parsed event to the list
				parsedEvents.push(parsedEvent);
			}

			// add all the hours in a category
			var catData = this.collectHoursInCategories(parsedEvents);

			// set the data back into the conteroller so it's retrievable after
			controller.chartData = catData;
			controller.parsedEvents = parsedEvents;
			controller.isColumnChart = (controller.hasOwnProperty('isColumnChart')) ? !(controller.isColumnChart) : true;

			GoogleChartService.drawChart(catData, controller, function () {
				// fill in the table
				var listModel = new sap.ui.model.json.JSONModel();
				listModel.setData(parsedEvents);
				controller.getView().byId('eventsTable').setModel(listModel);
				controller.getView().byId('eventsTable').setVisible(true);
				controller.getView().byId('configLabel').setText('Analyzed time!  Scroll down to see a visual representation');
				controller.isColumnChart = !(controller.isColumnChart);
			});
		};

	return Utils;
}, true /* bExport */);