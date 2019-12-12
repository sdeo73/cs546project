(function() {
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
    $("#emailExists").hide();
    $("#noChangeError").hide();
    $("#serverError").hide();
    $("#updateSuccess").hide();
    $("#duplicateNationalities").hide();
    let editProfileForm = document.getElementById("editProfileForm");
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", event => {
            event.preventDefault();
        
            let newFirstName = document.getElementById("firstName");
            let newLastName = document.getElementById("lastName");
            let newEmail = document.getElementById("email");
            let newNationality = document.getElementsByName("nationality");
            $("#emailExists").hide();
            $("#noChangeError").hide();
            $("#serverError").hide();
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
            
            for(let i=0; i<newNationality.length; i++){
                if(newNationality[i].value != "" && newNationality[i].value && typeof newNationality[i].value != "undefined" && typeof newNationality[i].value !="null"){
                    oneSelected = true;
                    break;
                }
            }

            if (oneSelected) {
                $("#noChangeError").hide();
                let arrNationality = [];
                for(let i=0; i<newNationality.length; i++){
                    arrNationality.push(newNationality[i].value);
                }
                let requestConfig = {
                    method: "POST",
                    url: "/editprofile",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify({
                    firstName: newFirstName.value,
                    lastName: newLastName.value,
                    email: newEmail.value,
                    nationality: arrNationality
                    }),
                    success: function(response) {
                        $("#serverError").hide();
                        $("#emailExists").hide();
                        $("#noChangeError").hide();
                        $("#duplicateNationalities").hide();
                        $("#updateSuccess").show();

                        alert("Change name on navbar to "+response.message+"!");
                    },
                    error: function(xhr, status, error){
                        switch(xhr.responseJSON.message){
                            case "emailExists":
                                $("#emailExists").show();
                                $("#serverError").hide();
                                $("#updateSuccess").hide();
                                $("#noChangeError").hide();
                                $("#duplicateNationalities").hide();
                                break;
                            case "serverError":
                                $("#serverError").show();
                                $("#updateSuccess").hide();
                                $("#noChangeError").hide();
                                $("#emailExists").hide();
                                $("#duplicateNationalities").hide();
                                break;
                            case "duplicateNationalities":
                                $("#duplicateNationalities").show();
                                $("#serverError").hide();
                                $("#updateSuccess").hide();
                                $("#noChangeError").hide();
                                $("#emailExists").hide();
                                break;
                        }
                    }
                };
                $.ajax(requestConfig);
            }else{
                $("#serverError").hide();
                $("#emailExists").hide();
                $("#noChangeError").show();
                $("#updateSuccess").hide();
                $("#duplicateNationalities").hide();

            }
        });
    }
})();