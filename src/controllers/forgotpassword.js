define(["emby-scroller"], function() {
    "use strict";

    function processForgotPasswordResult(result) {
        if ("ContactAdmin" == result.Action) return void Dashboard.alert({
            message: Globalize.translate("MessageContactAdminToResetPassword"),
            title: Globalize.translate("HeaderForgotPassword")
        });
        if ("InNetworkRequired" == result.Action) return void Dashboard.alert({
            message: Globalize.translate("MessageForgotPasswordInNetworkRequired"),
            title: Globalize.translate("HeaderForgotPassword")
        });
        if ("PinCode" == result.Action) {
            var msg = Globalize.translate("MessageForgotPasswordFileCreated");
            return msg += "<br/>", msg += "<br/>", msg += "<a href=\"forgotpasswordpin.html\">Enter PIN here to finish Password Reset</a>" ,msg += "<br/>",msg += result.PinFile, msg += "<br/>", void Dashboard.alert({
                message: msg,
                title: Globalize.translate("HeaderForgotPassword")
            })
        }
    }
    return function (view, params) {
        document.querySelector(".backgroundContainer").style.backgroundColor = null;

        function onSubmit(e) {
            return ApiClient.ajax({
                type: "POST",
                url: ApiClient.getUrl("Users/ForgotPassword"),
                dataType: "json",
                data: {
                    EnteredUsername: view.querySelector("#txtEmail").value
                }
            }).then(processForgotPasswordResult), e.preventDefault(), !1
        }
        view.querySelector("form").addEventListener("submit", onSubmit)
    }
});
