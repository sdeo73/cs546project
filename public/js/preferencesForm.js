const form = document.getElementById("preferences-form");

$(function(){ //Referred from https://stackoverflow.com/questions/43274559/how-do-i-restrict-past-dates-in-html5-input-type-date
    var dtToday = new Date();
    
    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if(month < 10)
        month = '0' + month.toString();
    if(day < 10)
        day = '0' + day.toString();
    
    var minDate = year + '-' + month + '-' + day;
    $('#travelStart-input').attr('min', minDate);
    $('#travelEnd-input').attr('min', minDate);
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
        errors = true;
    } else {
        event.preventDefault();
        $("#birthday-missing").hide();
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

    const tourTypeChecked = $('input[id^=tourType]:checked').length;
    if (tourTypeChecked == 0) {
        event.preventDefault();
        $("#tourType-missing").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#tourType-missing").hide();
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

    if (travelEndInput < travelStartInput) {
        event.preventDefault();
        $("#invalid-dates").show();
        errors = true;
    } else {
        event.preventDefault();
        $("#invalid-dates").hide();
    }

    if (!errors) {
        $("#preferences-form")[0].submit();
    }
})