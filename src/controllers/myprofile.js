define(["loading", "libraryMenu", "apphost", "emby-button", 'material-icons'], function (loading, libraryMenu, appHost) {
    "use strict";

    var user, currentFile, menu = [{
        name: "Escolher do Aparelho",
        id: "newImage"
    }], ratingsName = { "1": "Crianças pequenas", "5": "Crianças mais velhas", "7": "Adolescentes", "8": "Jovens", "9": "Todos os níveis de maturidade" };

    function populateRatings(allParentalRatings, page) {
        var html = "";
        html += "";
        var i, length, rating, ratings = [];
        for (i = 0, length = allParentalRatings.length; i < length; i++) {
            if (rating = allParentalRatings[i], ratings.length) {
                var lastRating = ratings[ratings.length - 1];
                if (lastRating.Value === rating.Value) {
                    continue
                }
            }
            ratings.push({
                Name: ratingsName[rating.Value],
                Value: rating.Value
            })
        }
        for (i = 0, length = ratings.length; i < length; i++) rating = ratings[i], html += "<option value='" + rating.Value + "'>" + rating.Name + "</option>";
        page.querySelector(".selectMaxParentalRating").innerHTML = html;
    }

    function reloadUser(page) {
        var userId = getParameterByName("userId");

        if (userId) {
            loading.show();

            Promise.all([ApiClient.getUser(userId), ApiClient.getParentalRatings()]).then(function (responses) {
                user = responses[0];
                var allParentalRatings = responses[1];

                page.querySelector(".title").innerHTML = "Editar Perfil";
                page.querySelector(".txtName").value = user.Name.replace(/\[(.+?)\]/g, '');
                var uploadUserImage = page.querySelector(".uploadUserImage");
                uploadUserImage.value = "";
                uploadUserImage.dispatchEvent(new CustomEvent("change", {}));
                libraryMenu.setTitle(user.Name.replace(/\[(.+?)\]/g, ''));
                var imageUrl = "img/logindefault.png";
                if (user.PrimaryImageTag) {
                    imageUrl = ApiClient.getUserImageUrl(user.Id, {
                        height: 200,
                        tag: user.PrimaryImageTag,
                        type: "Primary"
                    });
                }
                var fldImage = page.querySelector(".fldImage");
                fldImage.classList.remove("hide");
                fldImage.innerHTML = "<img width='140px' src='" + imageUrl + "' />";

                if (document.querySelector(".skinHeader .headerUserButton img")) {
                    document.querySelector(".skinHeader .headerUserButton img").src = setParameterByName("time", Date.now(), imageUrl);
                }

                populateRatings(allParentalRatings, page);
                var ratingValue = "9";
                if (user.Policy.MaxParentalRating) {
                    for (var i = 0, length = allParentalRatings.length; i < length; i++) {
                        var rating = allParentalRatings[i];
                        user.Policy.MaxParentalRating >= rating.Value && (ratingValue = rating.Value)
                    }
                }
                page.querySelector(".selectMaxParentalRating").value = ratingValue || 9;

                loading.hide();
            })
        } else {
            page.querySelector(".newImageForm .title").innerHTML = "Criar Perfil";

            page.querySelector(".selectMaxParentalRating").innerHTML = Object.keys(ratingsName).reduce(function (acc, curr) {
                return acc += "<option value='" + curr + "'>" + ratingsName[curr] + "</option>";
            }, "");
            page.querySelector(".selectMaxParentalRating").value = 9;
        }
    }

    function onFileReaderError(evt) {
        loading.hide();
        switch (evt.target.error.code) {
            case evt.target.error.NOT_FOUND_ERR:
                require(["toast"], function (toast) {
                    toast(Globalize.translate("FileNotFound"));
                });
                break;
            case evt.target.error.NOT_READABLE_ERR:
                require(["toast"], function (toast) {
                    toast(Globalize.translate("FileReadError"));
                });
                break;
            case evt.target.error.ABORT_ERR:
                break;
            default:
                require(["toast"], function (toast) {
                    toast(Globalize.translate("FileReadError"));
                });
        }
    }

    function onFileReaderAbort(evt) {
        loading.hide();

        require(["toast"], function (toast) {
            toast(Globalize.translate("FileReadCancelled"));
        });
    }

    function setFiles(page, files) {
        var file = files[0];

        if (!file || !file.type.match("image.*")) {
            page.querySelector(".userImageOutput").innerHTML = "";
            return void (currentFile = null);
        }

        currentFile = file;
        var reader = new FileReader();
        reader.onerror = onFileReaderError;

        reader.onabort = onFileReaderAbort;

        reader.onload = function (evt) {
            var fldImage = page.querySelector(".fldImage");
            if (fldImage.innerHTML === "") {
                fldImage.innerHTML = "<img width='140px' src='" + evt.target.result + "' />";
            } else {
                page.querySelector(".fldImage img").src = evt.target.result;
            }

            var html = ['<img style="max-width:100%;max-height:100%;" src="', evt.target.result, '" title="', escape(file.name), '"/>'].join("");
            page.querySelector(".userImageOutput").innerHTML = html;
        };

        reader.readAsDataURL(file);
    }

    function onImageDragOver(evt) {
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = "Copy";
        return false;
    }

    function onSaveComplete() {
        loading.hide(), require(["toast"], function (toast) {
            toast(Globalize.translate("SettingsSaved"))
        })
    }

    return function (view, params) {
        user = {};
        reloadUser(view);
        view.querySelector(".userImageDropZone").addEventListener("dragOver", onImageDragOver);
        view.querySelector(".fldImage").addEventListener("click", function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            require(["actionsheet"], function (actionsheet) {
                actionsheet.show({
                    items: [].concat(currentFile || user.PrimaryImageTag ? [{
                        name: "Excluir Imagem",
                        id: "deleteImage"
                    }] : [], currentFile && user.PrimaryImageTag ? [{
                        name: "Voltar a Imagem Anterior",
                        id: "undo"
                    }] : [], menu),
                    positionTo: view.querySelector(".fldImage")
                }).then(function (id) {
                    if (id === "deleteImage") {
                        if (currentFile && !user.PrimaryImageTag) {
                            currentFile = null;
                            document.querySelector(".fldImage img").remove();
                        } else {
                            require(["confirm"], function (confirm) {
                                confirm(Globalize.translate("DeleteImageConfirmation"), Globalize.translate("DeleteImage")).then(function () {
                                    loading.show();
                                    var userId = getParameterByName("userId");
                                    ApiClient.deleteUserImage(userId, "primary").then(function () {
                                        loading.hide();
                                        reloadUser(view);
                                    });
                                });
                            });
                        }
                    } else if (id === "undo") {
                        currentFile = null;
                        view.querySelector(".fldImage img").src = ApiClient.getUserImageUrl(user.Id, {
                            height: 200,
                            tag: user.PrimaryImageTag,
                            type: "Primary"
                        });
                    } else {
                        view.querySelector(".uploadUserImage").click();
                    }
                }).finally(function () {
                    view.querySelector(".fldImage").focus();
                });

                setTimeout(function () {
                    if (document.querySelector(".actionSheet button:first-child")) document.querySelector(".actionSheet button:first-child").focus();
                });
            })
        });
        view.querySelector(".btnBrowse").addEventListener("click", function () {
            view.querySelector(".uploadUserImage").click();
        });
        view.querySelector(".btnCancel").addEventListener("click", params.backAction || function () {
            history.back();
        });
        view.querySelector(".newImageForm").addEventListener("submit", function (evt) {
            evt.preventDefault();

            loading.show();

            var name = view.querySelector(".newImageForm .txtName").value;

            (user.Id ? Promise.resolve(user) : ApiClient.createUser(name)).then(function (newUser) {
                user = newUser;

                var promises = [],
                    userId = getParameterByName("userId") || user.Id,
                    selectMaxParentalRating = parseInt(view.querySelector(".selectMaxParentalRating").value);

                var file = currentFile;
                if (file && file.type.search(/image\/(png|jpg|jpeg|gif|svg)/gi) >= 0) {
                    promises.push(ApiClient.uploadUserImage(userId, "Primary", file));
                } else {
                    promises.push(Promise.resolve());
                }

                if (user.Name.replace(/\[(.+?)\]/g, '') !== name) {
                    user.Name = user.Name.replace(/\[(.+?)\](.*)/g, '[$1]' + name);
                    promises.push(ApiClient.updateUser(user));
                } else {
                    promises.push(Promise.resolve());
                }

                if (user.Policy.MaxParentalRating !== selectMaxParentalRating) {
                    promises.push(ApiClient.updateUserMaxParentalRatingPolicy(user.Id, { MaxParentalRating: selectMaxParentalRating }));
                } else {
                    promises.push(Promise.resolve());
                }

                Promise.all(promises).then(params.onSaveSuccessful || function (result) {
                    onSaveComplete();
                    reloadUser(view);
                }).catch(function (error) {
                    if (error) {
                        require(["toast"], function (toast) {
                            toast(error);
                        })
                    }
                    loading.hide();
                });
            }).catch(function (response) {
                loading.hide(), require(["toast"], function (toast) {
                    response.text().then(function (error) {
                        toast(error);
                    });
                });
            });

            return false;
        });
        view.querySelector(".uploadUserImage").addEventListener("change", function (evt) {
            setFiles(view, evt.target.files);
        });
    };
});
