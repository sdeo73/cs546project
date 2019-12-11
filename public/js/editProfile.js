(function() {
    const editProfileForm = document.getElementById("editProfileForm");
    const newFirstName = document.getElementById("firstName");
    const newLastName = document.getElementById("lastName");
    const newEmail = document.getElementById("email");
    const newNationality = document.getElementById("nationalities")
    $("#emailExists").hide();
    $("#noChangeError").hide();
    $("#serverError").hide();

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

    if (editProfileForm) {
        editProfileForm.addEventListener("submit", event => {
            event.preventDefault();
            let oneSelected = false;

            if (newFirstName.value && newFirstName.value.length != 0) {
                oneSelected = true;
            }

            if (newLastName.value && newLastName.value.length != 0) {
                oneSelected = true;
            }

            if (newEmail.value && newEmail.value.length != 0) {
                oneSelected = true;
            }

            if(newNationality.value && nationality.value != "" && nationality.value.length != 0){
                oneSelected = true;
            }

            if (oneSelected) {
                $("#noChangeError").hide();
                let requestConfig = {
                    method: "POST",
                    url: "/editprofile",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify({
                      firstName: newFirstName.value,
                      lastName: newLastName.value,
                      email: newEmail.value,
                      nationality: newNationality.value
                    })
                };
                $.ajax(requestConfig).then(function(response) {
                    switch(response.message){
                        case "emailExists":
                            $("#emailExists").show();
                            break;
                        case "error":
                            $("#serverError").show();
                            break;
                        default:
                            $("#serverError").hide();
                            $("#emailExists").hide();
                            alert("Change name on navbar to "+response.message+"!");
                    }
                });
            }else{
                $("#noChangeError").show();
            }
        });
    }
})();