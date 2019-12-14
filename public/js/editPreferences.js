const form = document.getElementById("edit-preferences-form");

let todaysDate;
$(function () { //Referred from https://stackoverflow.com/questions/43274559/how-do-i-restrict-past-dates-in-html5-input-type-date
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();
        todaysDate = year + '-' + month + '-' + day;
    $('#travelStart-input').attr('min', todaysDate);
    $('#travelEnd-input').attr('min', todaysDate);
    $('#dob-input').attr('max', todaysDate);
    $('#loader-itinerary-outer').hide();
});

form.addEventListener("submit", event => {
    event.preventDefault();
    let errors = false;
    
    const country = document.getElementById("countryId").value;
    const state = document.getElementById("stateId").value;
    const city = document.getElementById("cityId").value;
    const mealPrefChecked = $('input[id^=mealPref]:checked').length;
    const tourTypeChecked = document.querySelector('input[name="tourType"]:checked');
    const tourActivityChecked = document.querySelector('input[name="tourActivity"]:checked');
    const noOfTravelersInput = document.getElementById("travelers-input").value;
    const budgetInput = document.getElementById("budget-input").value;
    const travelStartInput = document.getElementById("travelStart-input").value;
    const travelEndInput = document.getElementById("travelEnd-input").value;


    if ((!country || !state || !city) && mealPrefChecked == 0 && !tourTypeChecked && !tourActivityChecked && !noOfTravelersInput && !budgetInput && !travelStartInput && !travelEndInput) {
        $("#no-edits").show();
        errors = true;
    } else {
        $("#no-edits").hide();
    }

    //Check if travel end date is ahead of travel start date
    if (travelEndInput < travelStartInput) {
        $("#invalid-dates").show();
        errors = true;
    } else {
        $("#invalid-dates").hide();
    }

    //Check if travel time is not more than two weeks
    timeDifference= new Date(travelEndInput).getTime() - new Date(travelStartInput).getTime();
    var numberOfDays = timeDifference / (1000 * 3600 * 24); 
    if(numberOfDays > 14){
        $("#number-of-dates").show();
        errors = true;
    } else {
        $("#number-of-dates").hide();
    }

    if (!errors) {
        $("#edit-preferences-form")[0].submit();
        $(".editPreferenceForm").hide();
        $('#loader-itinerary-outer').show();
        $("title").text("Generating Itinerary");
        let opts = {
            lines: 13, // The number of lines to draw
            length: 38, // The length of each line
            width: 17, // The line thickness
            radius: 20, // The radius of the inner circle
            scale: 1, // Scales overall size of the spinner
            corners: 1, // Corner roundness (0..1)
            color: '#000000', // CSS color or array of colors
            fadeColor: 'transparent', // CSS color or array of colors
            speed: 1, // Rounds per second
            rotate: 0, // The rotation offset
            animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
            direction: 1, // 1: clockwise, -1: counterclockwise
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            className: 'spinner', // The CSS class to assign to the spinner
            top: '50%', // Top position relative to parent
            left: '50%', // Left position relative to parent
            shadow: '0 0 1px transparent', // Box-shadow for the lines
            position: 'absolute' // Element positioning
        };
        let target = document.getElementById('loader-itinerary');
        let spinner = new Spinner(opts).spin();
        target.appendChild(spinner.el);
    }
})