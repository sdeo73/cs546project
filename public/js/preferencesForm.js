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
    $('#loader-itinerary-outer').hide();
});

function validateDate(dateString) {
    let inputDate = dateString.split("-");
    let newDate = new Date(dateString);
    //checks if the date strings provided were valid or not
    if (isNaN(newDate.getFullYear()) || isNaN(newDate.getMonth()) || isNaN(newDate.getDate())) { 
        return false;
    }
    //validates if the date is parsed correctly
    if ((newDate.getUTCMonth()+1) == inputDate[1] && newDate.getUTCDate() == inputDate[2] && newDate.getUTCFullYear() == inputDate[0]) {
        return true;
    }
    return false;
}

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
    if (!validateDate(birthdayInput)) {
        $("invalid-birthday").show();
        errors = true;
    } else {
        $("invalid-birthday").hide();
    }
    if (!birthdayInput) {
        $("#birthday-missing").show();
        $("#underage").hide();
        errors = true;
    } else {
        let timeDifference = new Date(todaysDate).getTime() - new Date(birthdayInput).getTime();
        let age = parseInt((timeDifference / (1000 * 3600 * 24)) / 365);
        if (age < 16) {
            $("#underage").show();
            $("#birthday-missing").hide();
            errors = true;
        } else if(age > 120){
            $("#invalidage").show();
            $("#birthday-missing").hide();
            errors = true;
        }else {
            $("#birthday-missing").hide();
            $("#underage").hide();
        }
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

    if (!validateDate(travelStartInput)) {
        $("#invalid-start-date").show();
        errors = true;
    } else {
        $("#invalid-start-date").hide();
    }

    const travelEndInput = document.getElementById("travelEnd-input").value;
    if (!travelEndInput) {
        $("#endDate-missing").show();
        errors = true;
    } else {
        $("#endDate-missing").hide();
    }

    if (!validateDate(travelEndInput)) {
        $("#invalid-end-date").show();
        errors = true;
    } else {
        $("#invalid-end-date").hide();
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
    var numberOfDays = (timeDifference / (1000 * 3600 * 24)) + 1;
    if (numberOfDays > 7) {
        event.preventDefault();
        $("#number-of-dates").show();
        errors = true;
    } else {
        $("#number-of-dates").hide();
    }

    if (!errors) {
        $("#preferences-form")[0].submit();
        $(".preferenceForm").hide();
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