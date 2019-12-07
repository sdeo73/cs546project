(function() {
    const loginForm = document.getElementById("loginForm");
    const userEmail = document.getElementById("userEmail");
    const userPassword = document.getElementById("userPass");
    $("#noEmail").hide();
    $("#noPassword").hide();
    $("#invalidEmailFormat").hide();

    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();
            let errors= false;;

            if (!userEmail.value || userEmail.value.length == 0) {
                $("#noEmail").show();
                errors= true;
                event.preventDefault();
            } else {
                $("#noEmail").hide();
                event.preventDefault();
            }

            if (!userPassword.value || userPassword.value.length == 0) {
                $("#noPassword").show();
                errors= true;
                event.preventDefault();
            } else {
                $("#noPassword").hide();
                event.preventDefault();
            }

            if (!errors) {
                let requestConfig = {
                    method: "POST",
                    url: "/login",
                    contentType: "application/json",
                    data: JSON.stringify({
                      user_email: userEmail.value,
                      user_password: userPassword.value
                    })
                };
                $.ajax(requestConfig).then(function(response) {
                    switch(response.message){
                        case "successHome":
                            alert("Login Successful. Redirecting to home!");
                            break;
                        case "successPref":
                            alert("Login Successful. Redirecting to pref!");
                            break;
                        case "failedInvalidDetails":
                            alert("Login Failed. Invalid Details!");
                            break;
                        case "failedError":
                            alert("Login Failed. Some error occured!");
                            break;
                        default:
                            alert("This was not supposed to happen!");
                    }
                });
                //$("#loginForm")[0].submit();
            }
        });
    }
})();