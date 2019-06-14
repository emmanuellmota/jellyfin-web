define(["moment", "appSettings", "dom", "connectionManager", "loading", "focusManager", "emby-scroller", "cardStyle", "emby-checkbox", "moment-pt-BR"], function (moment, appSettings, dom, connectionManager, loading, focusManager) {
    "use strict";
    var token = null;

    function authenticateUserByToken(page, apiClient, guid, accessToken) {
        loading.show(), apiClient.authenticateUserByToken(guid, accessToken).then(function (result) {
            var newUrl, user = result.User,
                serverId = getParameterByName("serverid");
            newUrl = user.Policy.IsAdministrator && !serverId ? "dashboard.html" : "home.html", loading.hide(), Dashboard.onServerChanged(user.Id, result.AccessToken, apiClient), Dashboard.navigate(newUrl);
        }, function (response) {
            page.querySelector("#txtManualEmail").value = "", page.querySelector("#txtManualPassword").value = "", loading.hide(), 401 == response.status ? require(["toast"], function (toast) {
                toast("Erro indefinido.")
            }) : showServerConnectionFailure()
        })
    }

    function authenticateAccount(page, apiClient, email, password) {
        loading.show(), apiClient.authenticateAccount(email, password).then(function (response) {
            token = response.AccessToken, apiClient.getUsers({ AccessToken: token }).then(function (r) { return r.json() }).then(function (users) { window.users = users; (showVisualForm(page), loadUserList(page, apiClient, users), loading.hide()) }).catch(function () { (showManualForm(page, !1), loading.hide()) })
        }, function (response) {
            page.querySelector("#txtManualEmail").value = "", page.querySelector("#txtManualPassword").value = "", loading.hide(), 401 == response.status ? require(["toast"], function (toast) {
                response.text().then(function (error) { toast(error) });
            }) : showServerConnectionFailure()
        })
    }

    function showServerConnectionFailure() {
        Dashboard.alert({
            message: Globalize.translate("MessageUnableToConnectToServer"),
            title: Globalize.translate("HeaderConnectionFailure")
        })
    }

    function showManualForm(context, focusPassword) {
        var bg = new Image();
        bg.onload = function () {
            document.querySelector(".backdropContainer").style.backgroundImage = 'url("' + bg.src + '")';
            document.querySelector(".backgroundContainer").style.backgroundColor = "rgba(0, 0, 0, .75)";
        }
        bg.src = "/web/img/movies_wall.jpg";

        context.querySelector(".chkRememberLogin").checked = appSettings.enableAutoLogin(), context.querySelector(".manualLoginForm").classList.remove("hide"), context.querySelector(".visualLoginForm").classList.add("hide"), focusManager.focus(focusPassword ? context.querySelector("#txtManualPassword") : context.querySelector("#txtManualEmail"))
    }

    function showVisualForm(context) {
        document.querySelector(".backgroundContainer").style.backgroundColor = null;

        context.querySelector(".visualLoginForm").classList.remove("hide"), context.querySelector(".manualLoginForm").classList.add("hide");
        setTimeout(function () {
            var card = context.querySelector('button.card:enabled');
            card && focusManager.focus(card);
        });
    }

    function getRandomMetroColor() {
        var index = Math.floor(Math.random() * (metroColors.length - 1));
        return metroColors[index]
    }

    function getMetroColor(str) {
        if (str) {
            for (var character = String(str.substr(0, 1).charCodeAt()), sum = 0, i = 0; i < character.length; i++) sum += parseInt(character.charAt(i));
            var index = String(sum).substr(-1);
            return metroColors[index]
        }
        return getRandomMetroColor()
    }

    function loadUserList(context, apiClient, users) {
        for (var html = "", i = 0, length = users.length; i < length; i++) {
            var user = users[i];
            var session = user.LastActivityDate ? user.Session ? user.Session.IsActive ? ["Atualmente online em", user.Session.Client, "style='color: #1684e3;'"] : null : ["Última vez online", moment(user.LastActivityDate).fromNow()] : ["Última vez online", "Ainda não entrou"];

            html += '<button type="button" class="card squareCard scalableCard squareCard-scalable"><div class="cardBox">', html += '<div class="cardScalable">', html += '<div class="cardPadder cardPadder-square"></div>', html += '<div class="cardContent" data-userid="' + user.Id + '">';
            var imgUrl;
            if (user.PrimaryImageTag) imgUrl = apiClient.getUserImageUrl(user.Id, {
                width: 300,
                tag: user.PrimaryImageTag,
                type: "Primary"
            }), html += '<div class="cardImageContainer coveredImage coveredImage-noScale" style="background-image:url(\'' + imgUrl + "');\"></div>";
            else {
                var background = getMetroColor(user.Id);
                imgUrl = "img/logindefault.png", html += '<div class="cardImageContainer coveredImage coveredImage-noScale" style="background-image:url(\'' + imgUrl + "');background-color:" + background + ';"></div>'
            }
            html += "</div>", html += "</div>", html += '<div class="title">', html += '<div class="cardText singleCardText">' + user.Name.replace(/\[(.+?)\]/g, '') + "</div>", html += "</div>", html += "<div class='session' " + (session[2] || "") + "><span>" + session[0] + "</span><span>" + session[1] + "</span></div>", html += "</div>", html += "</button>"
        }
        context.querySelector("#divUsers").innerHTML = html

        if (users.length < 5) {
            var createAccountButton = document.createElement("button");
            createAccountButton.className = "createAccount card";
            var card = document.createElement("div");
            card.className = "cardBox";
            createAccountButton.append(card);
            context.querySelector("#divUsers").append(createAccountButton);
        }
    }

    var metroColors = ["#6FBD45", "#4BB3DD", "#4164A5", "#E12026", "#800080", "#E1B222", "#008040", "#0094FF", "#FF00C7", "#FF870F", "#7F0037"];

    return function (view, params) {
        Emby.Page.setTitle(null);

        function getApiClient() {
            var serverId = params.serverid;
            return serverId ? connectionManager.getOrCreateApiClient(serverId) : ApiClient
        }

        view.querySelector("#divUsers").addEventListener("click", function(e) {
            var card = dom.parentWithClass(e.target, "card"),
                cardContent = card ? card.querySelector(".cardContent") : null;
            if (cardContent && !card.disabled) {
                var context = view,
                    id = cardContent.getAttribute("data-userid");
                authenticateUserByToken(context, getApiClient(), id, token);
            } else {
                require(["controllers/myprofile"], function (myProfilePage) {
                    new myProfilePage(view, Object.assign(params, {
                        onSaveSuccessful: function () {
                            var apiClient = getApiClient();

                            apiClient.getUsers({ AccessToken: token }).then(function (r) { return r.json() }).then(function (users) {
                                loadUserList(view, apiClient, users);
                                loading.hide();
                                showVisualForm(view);
                                view.querySelector(".visualLoginForm").classList.remove("hide");
                                view.querySelector(".userProfileSettingsForm").classList.add("hide");
                                focusManager.focus(view.querySelector("#divUsers button:first-child"));
                            }).catch(function (e) {
                                (showManualForm(view, !1), loading.hide())
                            });
                        },
                        backAction: function () {
                            loading.hide();
                            view.querySelector(".visualLoginForm").classList.remove("hide");
                            view.querySelector(".userProfileSettingsForm").classList.add("hide");
                            focusManager.focus(view.querySelector("#divUsers button:first-child"));
                        }
                    }));

                    view.querySelector(".visualLoginForm").classList.add("hide");
                    view.querySelector(".userProfileSettingsForm").classList.remove("hide");
                    focusManager.focus(view.querySelector(".userProfileSettingsForm .txtName"));
                })
            }
        }), view.querySelector(".manualLoginForm").addEventListener("submit", function(e) {
            appSettings.enableAutoLogin(view.querySelector(".chkRememberLogin").checked);
            var apiClient = getApiClient();
            return authenticateAccount(view, apiClient, view.querySelector("#txtManualEmail").value, view.querySelector("#txtManualPassword").value), e.preventDefault(), !1
        }), view.querySelector(".btnForgotPassword").addEventListener("click", function() {
            Dashboard.navigate("forgotpassword.html")
        }), view.addEventListener("viewshow", function(e) {
            loading.show();
            var apiClient = getApiClient();

            apiClient.isAuthenticateAccount().then(function (t) {
                token = t, token ? apiClient.getUsers({ AccessToken: token }).then(function (r) { return r.json() }).then(function (users) {
                    loadUserList(view, apiClient, users);
                    loading.hide();
                    showVisualForm(view);
                }).catch(function (e) {
                    (showManualForm(view, !1), loading.hide())
                }) : (showManualForm(view, !1), loading.hide());
            }).catch(function (e) {
                (showManualForm(view, !1), loading.hide())
            });

            apiClient.getJSON(apiClient.getUrl("Branding/Configuration")).then(function(options) {
                view.querySelector(".disclaimer").textContent = options.LoginDisclaimer || ""
            });
        }), view.addEventListener("viewbeforehide", function () {
            document.querySelector(".backdropContainer").style.backgroundImage = null;
        });
    }
});
