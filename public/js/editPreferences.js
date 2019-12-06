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
    }
})