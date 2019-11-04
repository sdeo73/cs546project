(function() {
    console.log("enter form.js");
    const loginForm = document.getElementById("loginForm");
    const userEmail = document.getElementById("userEmail");
    const userPassword = document.getElementById("userPass");
    const noEmail = document.getElementById("noEmail");
    const noPassword = document.getElementById("noPassword");
    const invalidEmail = document.getElementById("invalidEmailFormat");

    noEmail.style.display = 'none';
    noPassword.style.display = 'none';
    invalidEmail.style.display = 'none';


    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            // event.preventDefault();
            
            //Could email be non-string type?
            if (userEmail.value && !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail.value))) {
                invalidEmail.style.display = 'block';
                event.preventDefault();
                return;
            }

            if (!userEmail.value || userEmail.value.length == 0) {
                noEmail.style.display = 'block';
                event.preventDefault();
                return;
            }
            if (!userPassword.value || userPassword.value.length == 0) {
                noPassword.style.display = 'block';
                event.preventDefault();
                return;
            }


            noEmail.style.display = 'none';
            noPassword.style.display = 'none';
            invalidEmail.style.display = 'none';
        });
    }
})();