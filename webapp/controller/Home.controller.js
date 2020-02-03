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
		GoogleCalendarService.connectToGoogle(this);
	},

  afterLogin:function() {
    this.getView().byId("signButton").setEnabled(true);
    this.getView().byId("configLabel").setText("Connected to Google! Now click Sign In.");
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
 
    },

    validateCalendarStartEndDate:function(event) {
    	// only enable the Go button if
    	// A calendar is selected, a start date and an end date are selected
    	var calendarDropDown = this.getView().byId("calendarComboBox");
    	var dtpStart = this.getView().byId("DTP1");
    	var dtpEnd = this.getView().byId("DTP2");

    	if (calendarDropDown.getSelectedItem() && dtpStart.getValue() && dtpEnd.getValue())
    	{
    		this.getView().byId("goButton").setEnabled(true);
    	}
    	else{

    		this.getView().byId("goButton").setEnabled(false);
    	}

    },

    goButton:function(event){
      // freeze the view so the user knows something is happening
     // sap.ui.core.

    	// figure out the min and max time in order to query google calendar
    	// this button doesn't get enabled until there is data in all 3 prompts (calendar, start & end date)
    	var calendarDropDown = this.getView().byId("calendarComboBox");
    	var dtpStart = this.getView().byId("DTP1");
    	var dtpEnd = this.getView().byId("DTP2");

    	// First, we need the selected calendar
    	var selectedCalendar = calendarDropDown.getSelectedItem();

    	// then we need the start date time
    	var startTime = dtpStart.getDateValue();

    	// then we need the end date date
    	var endTime =dtpEnd.getDateValue();

    	GoogleCalendarService.getListOfEventsFromCalendarInDateRange(selectedCalendar, startTime, endTime, this);

      this.getView().byId("changeChartType").setVisible(true);

    },

    changeChart:function(event) {
        
        // Create the data table.
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Event');
        data.addColumn('number', 'Hours');
        data.addRows(this.chartData);
        // Set chart options
        var options = {
            'title': 'Hours per Category',
            'width': 800,
            'height': 800
        };
        var HBoxDomRef = this.getView().byId("barChartPanel").getDomRef();

        var chart;
        // Instantiate and draw our chart, passing in our HBox.
        if (this.isColumnChart)
        {
          chart = new google.visualization.PieChart(HBoxDomRef);
        }
        else
        {
          chart = new google.visualization.ColumnChart(HBoxDomRef);
        }
        this.isColumnChart = !(this.isColumnChart);
        chart.draw(data, options);
    },

    calendarSelectionChange:function(event) {
		this.validateCalendarStartEndDate();
      	// acknowledge the selection change and update the status accordingly
      	this.getView().byId("configLabel").setText("Calendar '" + event.getParameters("selectedItem").selectedItem.getText() + "' loaded.");
    },

    handleStartDateChange:function(event) {

		this.validateCalendarStartEndDate();
    },

    handleEndDateChange:function(event) {

		this.validateCalendarStartEndDate();
    }

	});
});