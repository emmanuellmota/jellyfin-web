define(["apphost", "connectionManager", "globalize", "loading", "listViewStyle", "emby-button"], function (appHost, connectionManager, globalize, loading) {
    "use strict";

    function deleteUser() {
        var msg = globalize.translate("DeleteUserConfirmation");

        require(["confirm"], function (confirm) {
            confirm({
                title: globalize.translate("DeleteUser"),
                text: msg,
                confirmText: globalize.translate("ButtonDelete"),
                primary: "cancel"
            }).then(function () {
                loading.show();
                ApiClient.deleteUser(ApiClient.getCurrentUserId()).then(function () {
                    Dashboard.navigate("login.html", false, "none");
                });
            });
        });
    }

    return function(view, params) {
        view.querySelector(".btnLogout").addEventListener("click", function() {
            Dashboard.logout();
        });

        view.querySelector(".btnAccountLogout").addEventListener("click", function () {
            Dashboard.accountLogout();
        });

        view.querySelector(".btnAccountDetails").addEventListener("click", function () {
            Dashboard.navigate("myaccount.html", false, "none");
        });

        view.querySelector(".btnDelete").addEventListener("click", deleteUser);

        view.addEventListener("viewshow", function() {
            var page = this;
            var userId = params.userId || Dashboard.getCurrentUserId();

            page.querySelector(".lnkLanguagePreferences").setAttribute("href", "mypreferenceslanguages.html?userId=" + userId);
            page.querySelector(".lnkSubtitleSettings").setAttribute("href", "mypreferencessubtitles.html?userId=" + userId);
            page.querySelector(".lnkMyProfile").setAttribute("href", "myprofile.html?userId=" + userId);

            if (appHost.supports("multiserver")) {
                page.querySelector(".selectServer").classList.remove("hide")
            } else {
                page.querySelector(".selectServer").classList.add("hide");
            }

            connectionManager.user(ApiClient).then(function(user) {
                if (user.localUser && !user.localUser.EnableAutoLogin) {
                    view.querySelector(".btnLogout").classList.remove("hide");
                } else {
                    view.querySelector(".btnLogout").classList.add("hide");
                }
            });

            Dashboard.getCurrentUser().then(function(user) {
                if (user.Policy.IsAdministrator) {
                    page.querySelector(".adminSection").classList.remove("hide");

                    page.querySelector(".lnkDisplayPreferences").classList.remove("hide");
                    page.querySelector(".lnkHomeScreenPreferences").classList.remove("hide");
                    page.querySelector(".lnkDisplayPreferences").setAttribute("href", "mypreferencesdisplay.html?userId=" + userId);
                    page.querySelector(".lnkHomeScreenPreferences").setAttribute("href", "mypreferenceshome.html?userId=" + userId);
                } else {
                    page.querySelector(".adminSection").classList.add("hide");
                }
            });
            document.body.classList.add("hideBackgroundContainer");
        }), view.addEventListener("viewbeforehide", function () {
            document.body.classList.remove("hideBackgroundContainer");
            document.querySelector(".backdropContainer").style.backgroundImage = null;
        });
    }
});
