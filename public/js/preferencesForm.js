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
    event.preventDefault();
    const genderButton = document.querySelector('input[name="gender"]:checked');
    if (!genderButton) {
        $("#gender-missing").show();
        errors = true;
    } else {
        $("#gender-missing").hide();
    }

    const birthdayInput = document.getElementById("dob-input").value;
    if (!birthdayInput) {
        $("#birthday-missing").show();
        $("#underage").hide();
        errors = true;
    }
    let timeDifference = new Date(todaysDate).getTime() - new Date(birthdayInput).getTime();
    let age = parseInt((timeDifference / (1000 * 3600 * 24)) / 365);
    if (age < 16) {
        $("#underage").show();
        $("#birthday-missing").hide();
        errors = true;
    } else {
        $("#birthday-missing").hide();
        $("#underage").hide();
    }

    const country = document.getElementById("countryId").value;
    const state = document.getElementById("stateId").value;
    const city = document.getElementById("cityId").value;
    if (!country || !state || !city) {
        $("#destination-missing").show();
        errors = true;
    } else {
        $("#destination-missing").hide();
    }


    const mealPrefChecked = $('input[id^=mealPref]:checked').length;
    if (mealPrefChecked == 0) {
        $("#mealPref-missing").show();
        errors = true;
    } else {
        $("#mealPref-missing").hide();
    }

    const tourTypeChecked = document.querySelector('input[name="tourType"]:checked');
    if (!tourTypeChecked) {
        $("#tourType-missing").show();
        errors = true;
    } else {
        $("#tourType-missing").hide();
    }

    const tourActivityChecked = document.querySelector('input[name="tourActivity"]:checked');
    if (!tourActivityChecked) {
        $("#activity-missing").show();
        errors = true;
    } else {
        $("#activity-missing").hide();
    }


    const noOfTravelersInput = document.getElementById("travelers-input").value;
    if (!noOfTravelersInput) {
        $("#ntravelers-missing").show();
        errors = true;
    } else {
        $("#ntravelers-missing").hide();
    }

    const specialNeedsButton = document.querySelector('input[name="specialNeeds"]:checked');
    if (!specialNeedsButton) {
        $("#specialneeds-missing").show();
        errors = true;
    } else {
        $("#specialneeds-missing").hide();
    }

    const budgetInput = document.getElementById("budget-input").value;
    if (!budgetInput) {
        $("#budget-missing").show();
        errors = true;
    } else {
        $("#budget-missing").hide();
        budget = budgetInput;
    }

    const travelStartInput = document.getElementById("travelStart-input").value;
    if (!travelStartInput) {
        $("#startDate-missing").show();
        errors = true;
    } else {
        $("#startDate-missing").hide();
    }

    const travelEndInput = document.getElementById("travelEnd-input").value;
    if (!travelEndInput) {
        $("#endDate-missing").show();
        errors = true;
    } else {
        $("#endDate-missing").hide();
    }

    //Check if travel end date is ahead of travel start date
    if (travelEndInput < travelStartInput) {
        $("#invalid-dates").show();
        errors = true;
    } else {
        $("#invalid-dates").hide();
    }

    //Check if travel time is not more than two weeks
    timeDifference = new Date(travelEndInput).getTime() - new Date(travelStartInput).getTime();
    var numberOfDays = timeDifference / (1000 * 3600 * 24);
    if (numberOfDays > 7) {
        event.preventDefault();
        $("#number-of-dates").show();
        errors = true;
    } else {
        $("#number-of-dates").hide();
    }

    if (!errors) {
        $("#preferences-form")[0].submit();
    }
})