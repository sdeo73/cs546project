const form = document.getElementById("preferences-form");

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
    let errors = false;

    const genderButton = document.querySelector('input[name="gender"]:checked');
    if (!genderButton) {
        event.preventDefault();
        $("#gender-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#gender-missing").hide();
    }

    const birthdayInput = document.getElementById("dob-input").value;
    if (!birthdayInput) {
        event.preventDefault();
        $("#birthday-missing").show();
        $("#underage").hide();
        errors = true;
    }
    let timeDifference = new Date(todaysDate).getTime() - new Date(birthdayInput).getTime();
    let age = parseInt((timeDifference / (1000 * 3600 * 24)) / 365);
    if (age < 16) {
        event.preventDefault();
        $("#underage").show();
        $("#birthday-missing").hide();
        errors = true;
    } else {
        event.preventDefault();
        $("#birthday-missing").hide();
        $("#underage").hide();
    }

    const country = document.getElementById("countryId").value;
    const state = document.getElementById("stateId").value;
    const city = document.getElementById("cityId").value;
    if (!country || !state || !city) {
        event.preventDefault();
        $("#destination-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#destination-missing").hide();
    }


    const mealPrefChecked = $('input[id^=mealPref]:checked').length;
    if (mealPrefChecked == 0) {
        event.preventDefault();
        $("#mealPref-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#mealPref-missing").hide();
    }

    const tourTypeChecked = document.querySelector('input[name="tourType"]:checked');
    if (!tourTypeChecked) {
        event.preventDefault();
        $("#tourType-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#tourType-missing").hide();
    }

    const tourActivityChecked = document.querySelector('input[name="tourActivity"]:checked');
    if (!tourActivityChecked) {
        event.preventDefault();
        $("#activity-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#activity-missing").hide();
    }


    const noOfTravelersInput = document.getElementById("travelers-input").value;
    if (!noOfTravelersInput) {
        event.preventDefault();
        $("#ntravelers-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#ntravelers-missing").hide();
    }

    const budgetInput = document.getElementById("budget-input").value;
    if (!budgetInput) {
        event.preventDefault();
        $("#budget-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#budget-missing").hide();
        budget = budgetInput;
    }

    const travelStartInput = document.getElementById("travelStart-input").value;
    if (!travelStartInput) {
        event.preventDefault();
        $("#startDate-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#startDate-missing").hide();
    }

    const travelEndInput = document.getElementById("travelEnd-input").value;
    if (!travelEndInput) {
        event.preventDefault();
        $("#endDate-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#endDate-missing").hide();
    }

    //Check if travel end date is ahead of travel start date
    if (travelEndInput < travelStartInput) {
        event.preventDefault();
        $("#invalid-dates").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#invalid-dates").hide();
    }

    //Check if travel time is not more than two weeks
    timeDifference = new Date(travelEndInput).getTime() - new Date(travelStartInput).getTime();
    var numberOfDays = timeDifference / (1000 * 3600 * 24);
    if (numberOfDays > 14) {
        event.preventDefault();
        $("#number-of-dates").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#number-of-dates").hide();
    }

    if (!errors) {
        $("#preferences-form")[0].submit();
    }
})