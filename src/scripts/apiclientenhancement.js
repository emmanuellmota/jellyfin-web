define(["appStorage"], function(appStorage) {
    "use strict";
    var ApiClient = window.ApiClient;

    ApiClient.isAuthenticateAccount = function (serverId) {
        var account = JSON.parse(appStorage.getItem("account-" + serverId));
        if (account) {
            var url = ApiClient.getUrl("Sessions/IsValidAccountToken");
            var postData = {
                ServerId: serverId,
                AcessToken: account.AccessToken
            };

            return new window.Promise(function(resolve, reject) {
                return ApiClient.ajax({
                    type: "POST",
                    url: url,
                    data: JSON.stringify(postData),
                    dataType: "json",
                    contentType: "application/json"
                }).then(function(response) {
                    if (!response) {
                        appStorage.removeItem("account-" + serverId);
                        reject();
                    }
                    resolve(response);
                }).catch(reject);
            });
        } else
            return window.Promise.reject();
    };

    ApiClient.authenticateAccount = function (email, password) {
        if (!email) return window.Promise.reject();
        var url = this.getUrl("Users/authenticateaccount"),
            instance = this;
        return new window.Promise(function (resolve, reject) {
            var postData = {
                Email: email,
                Password: password || ""
            };
            instance.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(postData),
                dataType: "json",
                contentType: "application/json"
            }).then(function (result) {
                appStorage.setItem("account-" + result.ServerId, JSON.stringify(Object.assign(result.Account, { AccessToken: result.AccessToken })));
                resolve(result);
            }, reject)
        })
    };
});
