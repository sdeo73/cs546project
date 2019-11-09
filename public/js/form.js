(function() {
    const loginForm = document.getElementById("loginForm");
    const userEmail = document.getElementById("userEmail");
    const userPassword = document.getElementById("userPass");
    // const noEmail = document.getElementById("noEmail");
    // const noPassword = document.getElementById("noPassword");
    // const invalidEmail = document.getElementById("invalidEmailFormat");

    // noEmail.style.display = 'none';
    // noPassword.style.display = 'none';
    // invalidEmail.style.display = 'none';
    $("#noEmail").hide();
    $("#noPassword").hide();
    $("#invalidEmailFormat").hide();


    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            // event.preventDefault();
            let errors = [];
            //Could email be non-string type?
            if (userEmail.value && !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail.value))) {
                $("#invalidEmailFormat").show();
                event.preventDefault();
            }

            if (!userEmail.value || userEmail.value.length == 0) {
                $("#noEmail").show();
                event.preventDefault();
            }
            if (!userPassword.value || userPassword.value.length == 0) {
                $("#noPassword").show();
                event.preventDefault();
            }
            //is there a better way to display the errors?
            //use an array to keep all the errors
            //create p tag for each error and append them to a list?
            // $("#noEmail").hide();
            // $("#noPassword").hide();
            // $("#invalidEmailFormat").hide();
        });
    }
})();