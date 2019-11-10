const loginPage = require('../data/login');
const passwordHash = require('password-hash');
// const objectHash = require('object-hash');
const crypto = require('crypto');

(async() => {
    try {
        console.log("start inserting user");
        // const user1 = await loginPage.insertUserData("testing@SpeechGrammarList.com", "#*$*flwlelfle");
        const user2 = await loginPage.insertUserData("test03@gmail.com", "1234");
        console.log(user2);
        // const user1_output = await loginPage.loginValidation("testing3@SpeechGrammarList.com", "#*$*flwlelfle");
        // console.log("user1_output = " + user1_output);

        // console.log(`hashPass = ${await passwordHash.generate("12345", sha1)}`);
        // console.log(`hashPass = ${await passwordHash.generate("12345", sha1)}`);
        // console.log(passwordHash.verify("#*$*flwlelfle", "sha1$aa9e9970$1$8f02ed24a2e15caf45f8279c31d31a13b5f4570c"));
    } catch (err) {
        console.log(err);
    }
})();