(function() {
    const loginForm = document.getElementById("loginForm");
    const userEmail = document.getElementById("userEmail");
    const userPassword = document.getElementById("userPass");
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
                $("#noEmail").hide();
                event.preventDefault();
            } else {
                $("#invalidEmailFormat").hide();
            }

            if (!userEmail.value || userEmail.value.length == 0) {
                $("#noEmail").show();
                event.preventDefault();
            }
            if (!userPassword.value || userPassword.value.length == 0) {
                $("#noPassword").show();
                event.preventDefault();
            }
        });
    }
})();