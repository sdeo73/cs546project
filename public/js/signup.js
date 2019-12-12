let nationality= 1;

document.getElementById("addNationalities").addEventListener("click", event =>{
    event.preventDefault();
    var $dropdown = $("#nationality").clone();
    nationality++;
    $dropdown.attr('id', "nationality"+nationality);
    $dropdown.children().last().remove(); //Remove + button from appended dropdown
    $dropdown.append("<button type= \"button\" class = \"deleteNationalities\" id = \"deleteNationality_"+nationality+"\">x</button>")
    $("#nationalities").append($dropdown);
});

$(document).on('click', '.deleteNationalities', function (event) {
    let id = event.target.id;
    let split_id = id.split('_');
    let delete_id = split_id[1];
    let nationality_to_delete = "nationality"+delete_id;
    $("#"+nationality_to_delete).remove();
    this.remove();
});

$('#signupForm').submit( function(ev) {
    ev.preventDefault();
    
    const firstName = document.getElementsByName("firstName")[0].value;
    const lastName = document.getElementsByName("lastName")[0].value;
    const email = document.getElementsByName("email")[0].value;
    const password = document.getElementsByName("password")[0].value;
    const repassword = document.getElementsByName("repassword")[0].value;
    const nationality = document.getElementsByName("nationality");
    
    let errors = false;

    if(firstName == "" || !firstName || typeof firstName == "undefined" || typeof firstName =="null"){
        document.getElementById("firstNameMissing").style.display = "inline-block";
        errors = true;
    }else{
        document.getElementById("firstNameMissing").style.display = "none";
    }

    if(lastName == "" || !lastName || typeof lastName == "undefined" || typeof lastName =="null"){
        document.getElementById("lastNameMissing").style.display = "inline-block";
        errors = true;
    }else{
        document.getElementById("lastNameMissing").style.display = "none";
    }

    if(email == "" || !email || typeof email == "undefined" || typeof email =="null"){
        document.getElementById("emailMissing").style.display = "inline-block";
        errors = true;
    }else{
        document.getElementById("emailMissing").style.display = "none";
    }

    if(password == "" || !password || typeof password == "undefined" || typeof password =="null"){
        document.getElementById("passwordMissing").style.display = "inline-block";
        errors = true;
    }else{
        document.getElementById("passwordMissing").style.display = "none";
    }

    if(repassword !== password){
        document.getElementById("repasswordMissing").style.display = "inline-block";
        errors = true;
    }else{
        document.getElementById("repasswordMissing").style.display = "none";
    }
    let nationalitySelected = false;
    for(let i=0; i<nationality.length; i++){
        if(nationality[i].value != "" && nationality[i].value && typeof nationality[i].value != "undefined" && typeof nationality[i].value !="null"){
            document.getElementById("nationalityMissing").style.display = "none";
            nationalitySelected = true;
            break;
        }
    }
    if(nationality && nationality.length > 0){
        let nationalitiesNoNull = [];
        for(let i=0; i<nationality.length; i++){
            if(nationality[i].value != ""){
                nationalitiesNoNull.push(nationality[i].value);
            }
        }
        let nationalitiesSetSize = (new Set(nationalitiesNoNull)).size;
        if(nationalitiesSetSize != nationalitiesNoNull.length){
            document.getElementById("duplicateNationalities").style.display = "inline-block";
            errors = true;
        }else{
            document.getElementById("duplicateNationalities").style.display = "none";
        }
    }
    if(!nationalitySelected){
        document.getElementById("nationalityMissing").style.display = "inline-block";
        errors = true;
    }else{
        document.getElementById("nationalityMissing").style.display = "none";
    }

    if(!errors){
        $(this).unbind('submit').submit()
    }
});