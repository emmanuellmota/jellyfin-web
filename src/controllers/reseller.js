define(["vanilla-masker", "moment", "loading", "moment-pt-BR", "fancygrid"], function(VMasker, moment, loading) {
    "use strict";

    return function(view, params) {
        var account = ApiClient.getAccount();

        var filters = {
            active: function(a) {
                return a.GroupId !== 3;
            },
            reseller: function(a) {
                return a.GroupId === 3;
            }
        };

        var fancygrid = view.querySelector("#fancygrid");

        var defaults = {
            type: "string",
            sortable: true,
            flex: 1
        };

        var wppIcon = '<svg style="width:24px;height:24px" viewBox="0 0 24 24">\n' +
            '    <path fill="#000000" d="M16.75,13.96C17,14.09 17.16,14.16 17.21,14.26C17.27,14.37 17.25,14.87 17,15.44C16.8,16 15.76,16.54 15.3,16.56C14.84,16.58 14.83,16.92 12.34,15.83C9.85,14.74 8.35,12.08 8.23,11.91C8.11,11.74 7.27,10.53 7.31,9.3C7.36,8.08 8,7.5 8.26,7.26C8.5,7 8.77,6.97 8.94,7H9.41C9.56,7 9.77,6.94 9.96,7.45L10.65,9.32C10.71,9.45 10.75,9.6 10.66,9.76L10.39,10.17L10,10.59C9.88,10.71 9.74,10.84 9.88,11.09C10,11.35 10.5,12.18 11.2,12.87C12.11,13.75 12.91,14.04 13.15,14.17C13.39,14.31 13.54,14.29 13.69,14.13L14.5,13.19C14.69,12.94 14.85,13 15.08,13.08L16.75,13.96M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C10.03,22 8.2,21.43 6.65,20.45L2,22L3.55,17.35C2.57,15.8 2,13.97 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12C4,13.72 4.54,15.31 5.46,16.61L4.5,19.5L7.39,18.54C8.69,19.46 10.28,20 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4Z" />\n' +
            '</svg>';

        var clientTab;

        Promise.all([ApiClient.getAccounts(), ApiClient.getAccountRequests()]).then(function(values) {
            var accounts = values[0] ? values[0].map(function(e) {
                e.group = e.IsTrial ? "Testes" : "Fixos";
                return e;
            }) : [];
            var accountRequests = values[1] ? values[1].map(function(e) {
                var days = moment().diff(moment(e.DateCreated), 'days');
                e.group = days === 0 ? "Hoje" : "Há " + days + " dias";

                return e;
            }) : [];

            var activeGrid = {
                id: "active-grid",
                title: "Clientes",
                type: "grid",
                defaults: defaults,
                lang: {
                    loadingText: "Carregando Dados...",
                    paging: {
                        of: "de [0]",
                        info: "Linha [0] - [1] de [2]",
                        page: "Página"
                    }
                },
                paging: {
                    pageSize:20
                },
                contextmenu: true,
                selModel: "rows",
                multiSelect: true,
                data: accounts.filter(filters.active),
                expander: {
                    tpl: [
                        '<div style="float: left;">',
                        '<p><b>Celular:</b> {phone}</p>',
                        '<p><b>Notas:</b> {Notes}</p>',
                        '</div>'
                    ].join(""),
                    dataFn: function(grid, data){
                        data.phone = data.PhoneNumber ? VMasker.toPattern(data.PhoneNumber.substr(-11), "(99) 99999-9999") : "Não atribuido";

                        return data;
                    }
                },
                grouping: {
                    by: 'group',
                    collapsed: false,
                    sortGroups: 'DESC',
                    tpl: '{text} ({number})'
                },
                columns: [{
                    type: "expand",
                    locked: true
                }, {
                    index: "Enabled",
                    title: "Status",
                    cls: "column-cls-unmargin",
                    resizable: false,
                    locked: true,
                    width: 80,
                    render: function(o) {
                        o.data.ExpDate = accounts.find(function(a) {
                            return a.Guid === o.data.Guid;
                        }).ExpDate;

                        // 'active' : 'block' : 'date'
                        var status = !(o.data.ExpDate && !moment().isBefore(moment(o.data.ExpDate).add(1, "days"))) ? o.value ? "active" : "block" : "date";
                        var icon = status === "active" ? "&#xe86c;" : status === "block" ? "&#xe14b;" : "&#xe615;";
                        var color = status === "active" ? "mediumseagreen" : status === "block" || !o.data.Enabled ? "indianred;" : "gray";
                        o.value = '<div class="md-icon" style="font-size: 2em; color: ' + color + '">' + icon + '</div>';

                        return o;
                    }
                }, {
                    index: "Email",
                    title: "E-mail"
                }, {
                    index: "DateCreated",
                    title: "Criação",
                    render: function(o) {
                        o.value = moment(o.value).format("L");

                        return o;
                    }
                }, {
                    index: "PlainId",
                    title: "Plano",
                    render: function(o) {
                        o.value = ["Básico", "Padrão", "Premium"][o.value - 1];

                        return o;
                    }
                }, {
                    index: "ExpDate",
                    title: "Validade",
                    render: function(o) {
                        o.value = accounts.find(function(a) {
                            return a.Guid === o.data.Guid;
                        }).ExpDate;

                        o.value = o.value ? moment(o.value).format("L") : "Vitalícia";

                        return o;
                    }
                }],
                tbar: [{
                    type: "button",
                    text: "Prorrogar",
                    disabled: true,
                    handler: function() {
                        var grid = clientTab.items[clientTab.activeTab];
                        var selection = grid.getSelection();

                        var cost = grid.getSelection().reduce(function(acc, curr) {
                            return acc + curr.PlainId;
                        }, 0);

                        if (account.Credit < cost) {
                            return require(["toast"], function(toast) {
                                toast("Saldo insuficiente!")
                            });
                        }

                        loading.show();

                        Promise.all(selection.map(function(e) {
                            return ApiClient.updateAccount(e.Email, { Extend: true });
                        })).then(function(res) {
                            var credit = Fancy.getWidget('credit');
                            credit.setText(credit.el.dom.innerText.replace(/\d+/, function(match) {
                                return match - cost;
                            }));

                            selection.forEach(function(r, i) {
                                grid.setById(r.id, 'ExpDate', res[i].ExpDate);
                            });

                            grid.update();
                            grid.clearSelection();

                            selection.forEach(function(r) {
                                var index = grid.find("id", r.id)[0];
                                grid.selectRow(index, true, true);
                            });

                            loading.hide();
                        }, function(error) {
                            console.warn(error);
                            loading.hide();
                            require(["toast"], function(toast) {
                                toast("Ocorreu um erro ao bloquear as contas, tente novamente mais tarde.")
                            });
                        });
                    }
                }, {
                    type: "button",
                    text: "Promover a Revendedor",
                    disabled: true,
                    handler: function() {
                        var grid = clientTab.items[clientTab.activeTab];
                        var resellerGrid = Fancy.getWidget('reseller-grid');
                        var selection = grid.getSelection();

                        loading.show();

                        Promise.all(selection.map(function(e) {
                            return ApiClient.updateAccount(e.Email, { Promote: true });
                        })).then(function(res) {
                            selection.forEach(function(r) {
                                r.GroupId = 3;

                                if (resellerGrid) {
                                    resellerGrid.add(r);
                                } else {
                                    clientTab.items[1].data.push(r);
                                    accounts.find(function(a) {
                                        return a.Guid === r.Guid;
                                    }).GroupId = 3;
                                }

                                grid.remove(r.id);
                            });

                            grid.update();
                            grid.clearSelection();
                            resellerGrid && resellerGrid.update();

                            selection.forEach(function(r) {
                                var index = grid.find("id", r.id)[0];
                                grid.selectRow(index, true, true);
                            });

                            loading.hide();
                        }, function(error) {
                            console.warn(error);
                            loading.hide();
                            require(["toast"], function(toast) {
                                toast("Ocorreu um erro ao bloquear as contas, tente novamente mais tarde.")
                            });
                        });
                    }
                }, {
                    type: "button",
                    text: "Bloquear",
                    disabled: true,
                    handler: function() {
                        var grid = clientTab.items[clientTab.activeTab];
                        var selection = grid.getSelection();

                        loading.show();

                        Promise.all(selection.map(function(e) {
                            return ApiClient.updateAccount(e.Email, { Enable: false });
                        })).then(function() {
                            selection.forEach(function(r) {
                                grid.setById(r.id, 'Enabled', false);
                            });

                            grid.update();
                            grid.clearSelection();

                            selection.forEach(function(r) {
                                var index = grid.find("id", r.id)[0];
                                grid.selectRow(index, true, true);
                            });

                            loading.hide();
                        }, function(error) {
                            console.warn(error);
                            loading.hide();
                            require(["toast"], function(toast) {
                                toast("Ocorreu um erro ao bloquear as contas, tente novamente mais tarde.")
                            });
                        });
                    }
                }, {
                    type: "button",
                    text: "Desbloquear",
                    disabled: true,
                    handler: function() {
                        var grid = clientTab.items[clientTab.activeTab];
                        var selection = grid.getSelection();

                        loading.show();

                        Promise.all(selection.map(function(e) {
                            return ApiClient.updateAccount(e.Email, { Enable: true });
                        })).then(function() {
                            selection.forEach(function(r) {
                                grid.setById(r.id, 'Enabled', true);
                            });

                            grid.update();
                            grid.clearSelection();

                            selection.forEach(function(r) {
                                var index = grid.find("id", r.id)[0];
                                grid.selectRow(index, true, true);
                            });

                            loading.hide();
                        }, function(error) {
                            console.warn(error);
                            loading.hide();
                            require(["toast"], function(toast) {
                                toast("Ocorreu um erro ao desbloquear as contas, tente novamente mais tarde.")
                            });
                        });
                    }
                }],
                events: [{
                    select: function(grid, selection){
                        if (grid.tbar) {
                            grid.tbar[0] && grid.tbar[0][selection && selection.length ? "enable" : "disable"]();
                            grid.tbar[1] && grid.tbar[1][selection && selection.length ? "enable" : "disable"]();
                            grid.tbar[2] && grid.tbar[2][selection && (selection.length === 1 && selection[0].Enabled || selection.length > 1) ? "enable" : "disable"]();
                            grid.tbar[3] && grid.tbar[3][selection && (selection.length === 1 && !selection[0].Enabled || selection.length > 1) ? "enable" : "disable"]();
                            grid.tbar[5] && grid.tbar[5][selection && selection.length ? "enable" : "disable"]();
                        }
                    }
                }]
            };

            var resellerGrid = Object.assign({}, activeGrid, {
                id: "reseller-grid",
                title: "Revendedores",
                selModel: "row",
                multiSelect: false,
                data: accounts.filter(filters.reseller),
                columns: activeGrid.columns.concat([{
                    index: "Credit",
                    title: "Créditos",
                    render: function(o) {
                        o.value = '<span class="credits">' + o.value + '</span>';

                        return o;
                    }
                }]),
                tbar: [activeGrid.tbar[2], activeGrid.tbar[3], {
                    type: "button",
                    text: "Transferir fundos",
                    disabled: true,
                    handler: function(button) {
                        var grid = clientTab.items[clientTab.activeTab];
                        var sel = this.getSelection();
                        var row = sel && sel.length ? sel[0] : null;

                        if (!row) return;

                        require(["prompt"], function(prompt) {
                            prompt({
                                title: "Transferir Fundos",
                                label: "Quantidade",
                                type: "number",
                                attribute: {
                                    min: 1,
                                    max: account.Credit
                                },
                                process: function(value) {
                                    return ApiClient.creditTransfer(row.Email, value).then(function() {
                                        var credit = Fancy.getWidget('credit');
                                        credit.setText(credit.el.dom.innerText.replace(/\d+/, function(match) {
                                            return match - value;
                                        }));

                                        grid.setById(row.id, 'Credit', row.Credit + parseInt(value));
                                        grid.update();
                                    }).catch(function (error) {
                                        require(["toast"], function(toast) {
                                            toast(error);
                                        })
                                    });
                                },
                                events: {
                                    keydown: function(e) {
                                        var v = this.value;
                                        var min = this.getAttribute('min');
                                        var max = this.getAttribute('max');

                                        if (e.keyCode === 69 || e.keyCode > 105) {
                                            e.returnValue = false;
                                        } else if (e.key.match(/\d/)) {
                                            var nV = v * Math.pow(10, 1) + parseInt(e.key);

                                            if (nV > max || nV < min) {
                                                this.value = nV > max ? max : min;
                                                e.returnValue = false;
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    }
                }],
                events: [{
                    select: function(grid, selection){
                        if (grid.tbar) {
                            grid.tbar[0] && grid.tbar[0][selection && (selection.length === 1 && selection[0].Enabled || selection.length > 1) ? "enable" : "disable"]();
                            grid.tbar[1] && grid.tbar[1][selection && (selection.length === 1 && !selection[0].Enabled || selection.length > 1) ? "enable" : "disable"]();
                            grid.tbar[2] && grid.tbar[2][selection && selection.length && account.Credit ? "enable" : "disable"]();
                        }
                    }
                }]
            });

            var requestGrid = {
                id: "request-grid",
                title: "Convites",
                type: "grid",
                defaults: defaults,
                lang: activeGrid.lang,
                paging: activeGrid.paging,
                trackOver: activeGrid.trackOver,
                contextmenu: activeGrid.contextmenu,
                selModel: activeGrid.selModel,
                multiSelect: activeGrid.multiSelect,
                data: accountRequests,
                grouping: {
                    by: 'group',
                    collapsed: false,
                    order: accountRequests.map(function(e) { return e.group }).filter(function(item, index, arr){
                        return arr.indexOf(item) >= index;
                    }).reverse().sort(function(x,y) { return x === "Hoje" ? -1 : y === "Hoje" ? 1 : 0; }),
                    tpl: '{text} ({number})'
                },
                columns: [{
                    index: "Reference",
                    title: "Identificador"
                }, {
                    index: "DateCreated",
                    title: "Criação",
                    render: function(o) {
                        o.value = moment(o.value).format("L");

                        return o;
                    }
                }, {
                    index: "PlainId",
                    title: "Plano",
                    render: function(o) {
                        o.value = ["Básico", "Padrão", "Premium"][o.value - 1];

                        return o;
                    }
                }, {
                    index: "GroupId",
                    title: "Tipo de Conta",
                    render: function(o) {
                        o.value = ["Cliente", "Administrador", "Premium"][o.value - 1];

                        return o;
                    }
                }, {
                    index: "AccessCode",
                    title: "Código de Acesso"
                },{
                    type: 'action',
                    resizable: false,
                    searchable: false,
                    cls: "column-cls-unmargin column-cls-flex",
                    items: [{
                        text: 'Copiar URL',
                        cls: 'buttom-column',
                        handler: function(grid, row) {
                            clipboard.writeText(location.origin + location.pathname + "#!/createaccount.html" + "?accessCode=" + row.value.AccessCode);
                            require(["toast"], function(toast) {
                                toast("Copiado para sua área de transferência.")
                            });
                        }
                    }]
                }],
                tbar: [{
                    type: "button",
                    text: "Excluir",
                    disabled: true,
                    handler: function() {
                        var grid = clientTab.items[clientTab.activeTab];
                        var selection = grid.getSelection();

                        require(["confirm"], function(confirm) {
                            var msg = "Tem certeza que deseja excluir " + (selection.length > 1 ? "estes " + selection.length + " convites?" : "este convite?");
                            confirm(msg, "Confirmação").then(function() {
                                loading.show();

                                Promise.all(selection.map(function(e) {
                                    return ApiClient.deleteAccountRequest(e.AccessCode);
                                })).then(function() {
                                    require(["toast"], function(toast) {
                                        toast((selection.length > 1 ? "Convites excluidos" : "Convite excluido") + " com sucesso!");

                                        selection.forEach(function(e) {
                                            grid.remove(e.id);
                                        });
                                    });

                                    loading.hide();
                                }, function(error) {
                                    console.warn(error);
                                    loading.hide();
                                    require(["toast"], function(toast) {
                                        toast("Ocorreu um erro ao excluir esta solicitação, tente novamente mais tarde.")
                                    });
                                });
                            });
                        });
                    }
                }],
                events: [{
                    select: function(grid, selection){
                        if (grid.tbar) {
                            grid.tbar[0] && grid.tbar[0][selection && selection.length ? "enable" : "disable"]();
                        }
                    }
                }]
            };

            clientTab = new FancyTab({
                title: {
                    text: "Clientes",
                    tools: [{
                        id: "credit",
                        text: "Crédito disponível: <b>" + account.Credit + "</b>"
                    }, {
                        text: "Adicionar novo Cliente",
                        handler: function() {
                            require(['accountRequest'], function (accountRequest) {
                                accountRequest.show().then(function(result) {
                                    loading.show();

                                    ApiClient.createAccountRequest(result.plainId, result.groupId, result.reference).then(function(accountRequest) {
                                        clientTab.setActiveTab(2);
                                        setTimeout(function() {
                                            var grid = clientTab.items[2];
                                            accountRequest.group = "Hoje";
                                            grid.add(accountRequest);

                                            var row = grid.getData().find(function(e) { return e.AccessCode === accountRequest.AccessCode });
                                            document.querySelector('.fancy-grid-group-row[group="Hoje"]').click();
                                            grid.expandAll();
                                            grid.selectById(row.id);

                                            loading.hide();
                                        });
                                    });
                                });
                            });
                        }
                    }]
                },
                theme:"dark",
                renderTo: "fancygrid",
                activeTab: 0,
                width: fancygrid.offsetWidth,
                height: fancygrid.offsetHeight,
                items: [activeGrid, resellerGrid, requestGrid]
            });

            function onResize() {
                clientTab.setWidth(fancygrid.offsetWidth);
                clientTab.setHeight(fancygrid.offsetHeight);
            }

            window.addEventListener("resize", onResize);
        });

        view.addEventListener("viewshow", function() {
            document.body.classList.add("hideBackgroundContainer");
        });
        view.addEventListener("viewbeforehide", function() {
            document.body.classList.remove("hideBackgroundContainer");
            document.querySelector(".backdropContainer").style.backgroundImage = null;

            window.removeEventListener("resize", onResize);
        })
    }
});
