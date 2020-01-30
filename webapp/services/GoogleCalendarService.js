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
     	event.getView().byId("signButton").setText("Sign Out of Google");
  		event.getView().byId("configLabel").setText("Connected to Google!");
  		     	// get the list of calendars and pass in the combobox so it can filled
      	this.getCalendars(event);
    };

	// Function to signout of Google
	Utils.signOut = function(event) {
	        gapi.auth2.getAuthInstance().signOut();
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
			controller.getView().byId("calendarSelectionPanel").setVisible(true);
			calendarDropDown.setBusy(false);
			statusLabel.setText("Loaded calendars!")

		});
		console.log(listOfCalendars);
	}

	Utils.getListOfEventsFromCalendarInDateRange = function(calendar, startDate, endDate, controller) {

		// the calendar key is what Gooogle Calendar API needs
		var calendarKey = calendar.getKey();
		var startDateString = startDate.toISOString();
		var endDateString = endDate.toISOString();

		var me = this;

		// get the list of events in the calendar
        gapi.client.calendar.events.list({
	        'calendarId': calendarKey,
	        'timeMin': startDateString,
	        'timeMax': endDateString,
	        'showDeleted': false,
	        'singleEvents': true,
	        'orderBy': 'startTime'
        }).then(function(response) {
	        var events = response.result.items;
	        console.log(events);
	        me.parseListOfEvents(events, controller);
        });

	},

	Utils.parseISOStringToDate = function(string) {
		var b = string.split(/\D+/);
		return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
	},

	Utils.parseListOfEvents = function(events, controller) {
		var parsedEvents = [];
		var dataForChart = [];
        for (var i = 0; i < events.length; i++) {
    		var parsedEvent = {};

    		// get the events start date & time.  Use date if date time is not there
		    var event = events[i];

		    var startTime = (event.start.dateTime) ? event.start.dateTime : event.start.date;
		    var endTime = (event.end.dateTime) ? event.end.dateTime : event.end.date;
		    var description = (event.description) ? event.description : "";

		    parsedEvent.name = event.summary;
		    parsedEvent.description = description;
		    parsedEvent.startTime = this.parseISOStringToDate(startTime);
		    parsedEvent.endTime = this.parseISOStringToDate(endTime);

		    // now get the time difference in hours between the start time and the end time
		    parsedEvent.time = Math.ceil(Math.abs(parsedEvent.endTime - parsedEvent.startTime) / (1000 * 60 * 60));

		    // now fill in a row for thw chart data
		    var curRow = [];
		    curRow.push(parsedEvent.name);
		    curRow.push(parsedEvent.time);
		    dataForChart.push(curRow);

		    // add the parsed event to the list
		    parsedEvents.push(parsedEvent);
        }

        		// Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Event');
        data.addColumn('number', 'Hours');
        data.addRows(dataForChart);
        // Set chart options
        var options = {
            'title': 'How Much Time Spent per Event',
            'width': 1000,
            'height': 1000
        };
        var HBoxDomRef = controller.getView().byId("barChartPanel").getDomRef();
        // Instantiate and draw our chart, passing in our HBox.
        var chart = new google.visualization.PieChart(HBoxDomRef);
        chart.draw(data, options);
	}

  return Utils;
}, true /* bExport */ );