document.getElementById("addNationalities").addEventListener("click", event =>{
    event.preventDefault();
    var $dropdown = $("#nationality").clone();
    $dropdown.removeAttr('id');
    $("#nationalities").append($dropdown);
});

$('#signupForm').submit( function(ev) {
    ev.preventDefault();
    
    const firstName = document.getElementsByName("firstName")[0].value;
    const lastName = document.getElementsByName("lastName")[0].value;
    const email = document.getElementsByName("email")[0].value;
    const password = document.getElementsByName("password")[0].value;
    const repassword = document.getElementsByName("repassword")[0].value;
    const nationality = document.getElementsByName("nationality")[0].value;
    
    let errors = false;

    if(firstName == "" || !firstName || typeof firstName == "undefined" || typeof firstName =="null"){
        document.getElementById("firstNameMissing").style.display = "inline";
        errors = true;
    }else{
        document.getElementById("firstNameMissing").style.display = "none";
    }

    if(lastName == "" || !lastName || typeof lastName == "undefined" || typeof lastName =="null"){
        document.getElementById("lastNameMissing").style.display = "inline";
        errors = true;
    }else{
        document.getElementById("lastNameMissing").style.display = "none";
    }

    if(email == "" || !email || typeof email == "undefined" || typeof email =="null"){
        document.getElementById("emailMissing").style.display = "inline";
        errors = true;
    }else{
        document.getElementById("emailMissing").style.display = "none";
    }

    if(password == "" || !password || typeof password == "undefined" || typeof password =="null"){
        document.getElementById("passwordMissing").style.display = "inline";
        errors = true;
    }else{
        document.getElementById("passwordMissing").style.display = "none";
    }

    if(repassword !== password){
        document.getElementById("repasswordMissing").style.display = "inline";
        errors = true;
    }else{
        document.getElementById("repasswordMissing").style.display = "none";
    }

    if(nationality == "" || !nationality || typeof nationality == "undefined" || typeof nationality =="null"){
        document.getElementById("nationalityMissing").style.display = "inline";
        errors = true;
    }else{
        document.getElementById("nationalityMissing").style.display = "none";
    }

    if(!errors){
        $(this).unbind('submit').submit()
    }
});

// document.getElementById("signupForm").addEventListener("submit", event =>{
//     event.preventDefault();
//     const firstName = document.getElementsByName("firstName")[0].value;
//     const lastName = document.getElementsByName("lastName")[0].value;
//     const email = document.getElementsByName("email")[0].value;
//     const password = document.getElementsByName("password")[0].value;
//     const repassword = document.getElementsByName("repassword")[0].value;
//     const nationality = document.getElementsByName("nationality")[0].value;
    
//     if(firstName == "" || !firstName || typeof firstName == "undefined" || typeof firstName =="null"){
//         document.getElementById("firstNameMissing").style.display = "inline";
//     }else{
//         document.getElementById("firstNameMissing").style.display = "none";
//     }

//     if(lastName == "" || !lastName || typeof lastName == "undefined" || typeof lastName =="null"){
//         document.getElementById("lastNameMissing").style.display = "inline";
//     }else{
//         document.getElementById("lastNameMissing").style.display = "none";
//     }

//     if(email == "" || !email || typeof email == "undefined" || typeof email =="null"){
//         document.getElementById("emailMissing").style.display = "inline";
//     }else{
//         document.getElementById("emailMissing").style.display = "none";
//     }

//     if(password == "" || !password || typeof password == "undefined" || typeof password =="null"){
//         document.getElementById("passwordMissing").style.display = "inline";
//     }else{
//         document.getElementById("passwordMissing").style.display = "none";
//     }

//     if(repassword !== password){
//         document.getElementById("repasswordMissing").style.display = "inline";
//     }else{
//         document.getElementById("repasswordMissing").style.display = "none";
//     }

//     if(nationality == "" || !nationality || typeof nationality == "undefined" || typeof nationality =="null"){
//         document.getElementById("nationality").style.display = "inline";
//     }else{
//         document.getElementById("nationalityMissing").style.display = "none";
//     }
// })

