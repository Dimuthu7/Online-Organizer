app.controller("MainController", ($scope, $filter, $interval) => {
    $scope.selectDate = new Date(); // Handle select date from datepicker
    $scope.list = [];               // Used to store all events
    $scope.selectList = [];         // Handle event on specific date
    $scope.editMode = false;
    $scope.expireDate = 0;          // Handle next event
    $scope.nextEventDetails;        // Used to store next event details

    // Handle add new event
    $scope.addEvent = () => {
        // Get timestamp value from selected date and time
        let eventTimeStamp = new Date($filter("date")($scope.selectDate) + ' ' + $filter("date")($scope.eventTime, "HH:mm:ss")).getTime();
        // Check whether event name is filled or not
        if ($scope.eventName === "" || $scope.eventName === undefined) {
            $scope.validation = "*Please enter event name";
        }
        // Check whether event time is filled or not
        else if ($scope.eventTime === "" || $scope.eventTime === undefined) {
            $scope.validation = "*Please select event time";
        }
        // Check whether selected date and time are future values
        else if (eventTimeStamp < new Date().getTime()) {
            $scope.validation = "*Please select future date or time";
        }
        else {
            // Set validation empty
            $scope.validation = "";
            // Create object and add to the list
            $scope.list.push({
                eventId: $scope.list.length + 1,
                eventName: $scope.eventName,
                eventDate: $filter("date")($scope.selectDate),
                eventTime: $filter("date")($scope.eventTime, "HH:mm:ss"),
            });
            displayEvents(); //Display events from call this function
            clearForm();  //Clear all input fields
            nextEvent(); //Handle next event
            $scope.editMode = false;
        }
    };

    // Handle edit event
    $scope.editEvent = (selectEventId) => {
        // Get event index using eventId
        const editIndex = $scope.list.findIndex(event => event.eventId === selectEventId);
        const selectEventObj = $scope.list[editIndex];
        // Remove selected event from list
        $scope.list.splice(editIndex, 1);
        displayEvents();
        nextEvent();

        // Assign event details to the form fields
        $scope.eventName = selectEventObj.eventName;
        $scope.eventTime = new Date("1000-10-10T" + selectEventObj.eventTime);
        $scope.editMode = true;
    }

    // Handle delete event
    $scope.deleteEvent = (selectEventId) => {
        // Get event index using eventId
        const editIndex = $scope.list.findIndex(event => event.eventId === selectEventId);
        // Delete selected event from list
        $scope.list.splice(editIndex, 1);
        displayEvents();
        nextEvent();
    }

    // Handle datepicker date changes
    $scope.onChangeDate = () => {
        displayEvents();
    };

    // Handle if date changes show only selected date events
    const displayEvents = () => {
        const selectDate = $filter("date")($scope.selectDate);
        $scope.selectList = [];
        $scope.list.filter((event) => {
            if (event.eventDate === selectDate) {
                $scope.selectList.push(event);
            }
        });
    };

    // Clear input fields of form
    const clearForm = () => {
        $scope.eventName = '';
        $scope.eventTime = '';
    }

    // Used to identify next event
    const nextEvent = () => {

        // Check list is empty
        if ($scope.list.length == 0) {
            $scope.expireDate = 0;
            return;
        }

        // Create list to store timestamp values of all events
        let eventTimestampList = [];
        $scope.list.map(event => {
            eventTimestampList.push(new Date(event.eventDate + ' ' + event.eventTime).getTime());
        });

        // Get minimum timestamp value from eventTimestampList
        $scope.expireDate = eventTimestampList[eventTimestampList.indexOf(Math.min(...eventTimestampList))];
        // Set next event details
        $scope.nextEventDetails = $filter("date")(new Date($scope.expireDate)) + ' ' + $filter("date")(new Date($scope.expireDate), "HH:mm:ss")
        $scope.expireDate = $scope.expireDate / 1000;
    }

    // Used to handle remaining time
    $interval(function () {
        // Check expireTime is 0 or expire time is already expired or not
        if ($scope.expireDate === 0 || $scope.expireDate < (new Date().getTime() / 1000)) {

            eventExpire();
            return;
        }

        // Handle remaining time function
        let nTime = Math.floor(Date.now() / 1000);
        let remaining = $scope.expireDate - nTime;

        $scope.rDays = parseInt(remaining / 60 / 60 / 24);
        $scope.rHours = parseInt((remaining - ($scope.rDays * 60 * 60 * 24)) / 60 / 60);
        $scope.rMinutes = parseInt((remaining - ($scope.rDays * 60 * 60 * 24) - ($scope.rHours * 60 * 60)) / 60);
        $scope.rSeconds = parseInt((remaining - ($scope.rDays * 60 * 60 * 24) - ($scope.rHours * 60 * 60) - ($scope.rMinutes * 60)));
    }, 1000);

    const eventExpire = () => {

        // Check list is empty
        if ($scope.list.length == 0) {
            return;
        }

        // Identify already expired events
        $scope.list.map(event => {
            if (new Date(event.eventDate + ' ' + event.eventTime).getTime() < new Date().getTime()) {

                $scope.deleteEvent(event.eventId);
            }
        });

    }

});
