define(["vanilla-masker", "moment", "moment-pt-BR"], function(VMasker, moment) {
    "use strict";
    return function(view, params) {
        var account = ApiClient.getAccount();

        view.querySelector(".txtEmail").innerHTML = account.Email;
        view.querySelector(".txtPhoneNumber").innerHTML = VMasker.toPattern("+5581998241767".substr(-11), account.PhoneNumber);
        view.querySelector(".plainsContainer > div:nth-child(" + account.PlainId + ")").classList.add("current");

        if (account.ExpDate) {
            var txtExpDate = view.querySelector(".txtExpDate");
            txtExpDate.innerHTML = moment(account.ExpDate).format("L");
            view.querySelector(".txtExpDateExt").innerHTML = moment().to(account.ExpDate).replace("em ", "");
            txtExpDate.closest("div").classList.remove("hide");
        }

        view.addEventListener("viewshow", function() {
            document.body.classList.add("hideBackgroundContainer");
        }), view.addEventListener("viewbeforehide", function() {
            document.body.classList.remove("hideBackgroundContainer");
            document.querySelector(".backdropContainer").style.backgroundImage = null;
        })
    }
});
