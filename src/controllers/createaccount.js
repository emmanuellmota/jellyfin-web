define(["vanilla-masker", "focusManager", "loading", "bodymovin", "@firebase/app", "@firebase/auth", "emby-scroller"], function (VMasker, focusManager, loading, bodymovin, firebase) {
    "use strict";

    function inputHandler(masks, max, event) {
        var c = event.target;
        var v = c.value.replace(/\D/g, "");
        var m = c.value.length > max ? 1 : 0;
        VMasker(c).unMask();
        VMasker(c).maskPattern(masks[0]);
        c.value = VMasker.toPattern(v, masks[0]);
    }

    function initFirebase() {
        window.firebase = firebase;

        if (!firebase.apps.length) {
            var firebaseConfig = {
                apiKey: "AIzaSyAiyxTmKSEyI-BgB5xZ-kymgAANFl5tICQ",
                authDomain: "neextv-4f242.firebaseapp.com",
                databaseURL: "https://neextv-4f242.firebaseio.com",
                projectId: "neextv-4f242",
                storageBucket: "neextv-4f242.appspot.com",
                messagingSenderId: "19232511448",
                appId: "1:19232511448:web:2e659b0be672ca78"
            };

            firebase.initializeApp(firebaseConfig);
        }

        firebase.auth().languageCode = 'pt-BR';
        firebase.auth().signOut();
    }

    return function (view, params) {
        var emailChecked = false;
        var phoneChecked = false;

        Emby.Page.setTitle(null);

        initFirebase();

        function phoneMaskHandler(e) {
            inputHandler.bind(undefined, phoneMask, 14);
        }
        var phoneMask = ['(99) 99999-9999'];
        var phoneEl = view.querySelector("#txtMobile");
        VMasker(phoneEl).maskPattern(phoneMask[0]);
        phoneEl.removeEventListener("input", phoneMaskHandler, false);
        phoneEl.addEventListener("input", phoneMaskHandler, false);

        function phoneCodeMaskHandler(e) {
            inputHandler.bind(undefined, phoneMask, 8);
        }
        var phoneCodeMask = ["999-999"];
        var phoneCodeEl = view.querySelector("#txtMobileCode");
        VMasker(phoneCodeEl).maskPattern(phoneCodeMask[0]);
        phoneCodeEl.removeEventListener("input", phoneCodeMaskHandler, false);
        phoneCodeEl.addEventListener("input", phoneCodeMaskHandler, false);

        var accessCodeEl = view.querySelector("#txtAccessCode");

        window.recaptchaOnloadCallback = function () {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
                'theme': 'dark',
                'size': 'invisible'
            });

            window.recaptchaVerifier.render().then(function (widgetId) {
                window.recaptchaWidgetId = widgetId;
            });
        };
        require(["https://www.google.com/recaptcha/api.js?hl=pt-BR&onload=recaptchaOnloadCallback&render=explicit"]);

        var form = view.querySelector("#createAccountPage .createAccountForm");

        if (getParameterByName("accessCode") !== "") {
            accessCodeEl.value = getParameterByName("accessCode");
            accessCodeEl.setAttribute("disabled", true);
        }

        function onHashChange() {
            var email = view.querySelector("#txtEmail");
            email.value = getParameterByName("email") !== "" ? getParameterByName("email") : email.value;
            phoneEl.value = getParameterByName("phone") !== "" ? getParameterByName("phone") : phoneEl.value;
            var validating = getParameterByName("validating") !== "" && (email.value || getParameterByName("email") !== "") && (phoneEl.value || getParameterByName("phone") !== "");

            form.classList[validating ? "add" : "remove"]("validating");

            email[validating ? "setAttribute" : "removeAttribute"]("disabled", true);
            phoneEl[validating ? "setAttribute" : "removeAttribute"]("disabled", true);

            makeFocusable(email, !validating);
            makeFocusable(view.querySelector("#txtPassword"), !validating);
            makeFocusable(view.querySelector("#txtConfirmPassword"), !validating);
            makeFocusable(phoneEl, !validating);
            makeFocusable(view.querySelector("#txtAccessCode"), !validating);

            makeFocusable(phoneCodeEl, validating);
            makeFocusable(view.querySelectorAll("section a")[0], validating);
            makeFocusable(view.querySelectorAll("section a")[1], validating);

            validating && setTimeout(function () {
                focusManager.focus(phoneCodeEl);
            }, 100);

            loading.hide();
        }
        window.removeEventListener("hashchange", onHashChange);
        window.addEventListener("hashchange", onHashChange);

        onHashChange();

        function onSubmit (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!window.recaptchaVerifier) {
                loading.show();

                require(["https://www.google.com/recaptcha/api.js?hl=pt-BR&onload=recaptchaOnloadCallback&render=explicit"], function () {
                    loading.hide();

                    onSubmit(e);
                });
            } else if (!getParameterByName("validating") !== "") {
                loading.show();

                var phoneNumber = "+55" + phoneEl.value.replace(/[^0-9\+]+/g, "");
                var email = view.querySelector("#txtEmail").value;
                var password = view.querySelector("#txtPassword").value;

                view.querySelector("#mobileLoader").classList.add("collapsed");

                firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier).then(function (confirmationResult) {
                    return new Promise(function (resolve) {
                        location.href = setParameterByName("validating", "waiting");

                        function phoneCodeCheck() {
                            var verificationCode = phoneCodeEl.value.replace(/\D/g, "");
                            if (phoneCodeEl.value.length === 7) {
                                phoneCodeEl.setAttribute("disabled", true);
                                view.querySelector("#mobileLoader").classList.remove("collapsed");
                                resolve({ id: confirmationResult.verificationId, code: verificationCode });
                            }
                        }

                        phoneCodeEl.removeEventListener("input", phoneCodeCheck, false);
                        phoneCodeEl.addEventListener("input", phoneCodeCheck, false);
                    });
                }).then(function (verification) {
                    return ApiClient.createAccount(verification.code, verification.id, email, password, accessCodeEl.value);
                }).then(function () {
                    console.log("The phone number is verified.");

                    phoneChecked = true;
                    view.querySelector("section:first-of-type").classList.add("expanded");

                    return firebase.auth().signInWithEmailAndPassword(email, password);
                }).then(function () {
                    var user = firebase.auth().currentUser;

                    setTimeout(function waitEmailConfirmation() {
                        user.reload().then(function () {
                            user = firebase.auth().currentUser;

                            if (user.emailVerified) {
                                console.log("The email is verified");

                                emailChecked = true;
                            } else {
                                setTimeout(waitEmailConfirmation, 5000);
                            }
                        }).catch(function (error) {
                            console.warn(error);

                            setTimeout(waitEmailConfirmation, 5000);
                        });
                    }, 5000);

                    var actionCodeSettings = {
                        url: location.origin + "/web/validateemail.html?uid=" + user.uid
                    };
                    return user.sendEmailVerification(actionCodeSettings);
                }).catch(function (error) {
                    var errors = {
                        "auth/email-already-in-use": {
                            msg: "O e-mail fornecido já está em uso por outro usuário. Cada usuário precisa ter um e-mail exclusivo."
                        },
                        "auth/weak-password": {
                            msg: "É necessário que a senha possua no mínimo 6 caracteres."
                        },
                        "auth/credential-already-in-use": {
                            msg: "O número de telefone fornecido já está em uso por outro usuário. Cada usuário precisa ter um número de telefone exclusivo."
                        }
                    };
                    errors["auth/email-already-exists"] = errors["auth/email-already-in-use"];
                    errors["auth/provider-already-linked"] = errors["auth/credential-already-in-use"];

                    var currentError = errors[error.code];
                    if (currentError) {
                        require(['dialog'], function (dialog) {
                            dialog({
                                buttons: [{ name: 'Ok', id: 'ok', type: 'submit' }],
                                title: "Erro",
                                text: currentError.msg,
                            }).then(currentError.cb || function () {
                                location.href = setParameterByName("validating", null);
                            });
                        });
                    }

                    phoneCodeEl.removeAttribute("disabled");

                    grecaptcha.reset(window.recaptchaWidgetId);

                    console.warn(error);
                    debugger;
                });
            }

            return false;
        }

        form.removeEventListener("submit", onSubmit);
        form.addEventListener("submit", onSubmit);

        var emailLoader = bodymovin.loadAnimation({
            wrapper: view.querySelector("#emailLoader"),
            animType: "svg",
            autoplay: false,
            loop: true,
            path: "http://localhost:9096/web/animations/blue_confirmation_ring.json"
        });

        var phoneLoader = bodymovin.loadAnimation({
            wrapper: view.querySelector("#mobileLoader"),
            animType: "svg",
            autoplay: false,
            loop: true,
            path: "http://localhost:9096/web/animations/blue_confirmation_ring.json"
        });

        view.addEventListener("viewshow", function (e) {
            form.classList.remove("hide");

            emailLoader.onLoopComplete = function () {
                if (emailChecked) {
                    emailLoader.loop = false;
                    emailLoader.playSegments([18, 62], true);

                    setTimeout(function () {
                        var email = view.querySelector("#txtEmail").value;
                        var password = view.querySelector("#txtPassword").value;

                        apiClient.authenticateAccount(email, password).then(function (response) {
                            Dashboard.navigate("login.html");
                        });
                    }, 2500);
                }
            };
            emailLoader.addEventListener("DOMLoaded", function() {
                emailLoader.playSegments([0, 17], true);
            });

            phoneLoader.onLoopComplete = function () {
                if (phoneChecked) {
                    phoneLoader.loop = false;
                    phoneLoader.playSegments([18, 62], true);
                }
            };
            phoneLoader.addEventListener("DOMLoaded", function() {
                phoneLoader.playSegments([0, 17], true);
            });
        });
    }
});
