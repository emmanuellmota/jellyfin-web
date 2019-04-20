define(["pluginManager", "clearButtonStyle", "paper-icon-button-light", "material-icons"], function (pluginManager) {
    "use strict";
    return function () {
        function getKeys() {
            return {
                keys: {
                    standard: [["@", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "DEL"], ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"], ["SHIFT", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"], ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]],
                    symbol: [["@", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="], ["~", "#", "`", "�", "$", "%", "^", "&", "(", ")", "[", "]"], ["�", "�", "�", "�", "�", "*", "|", "{", "}", ":", "&quot;"], ["_", "+", "!", "\\", "�", "�", "�", "<", ">", "?"]]
                },
                diacritics: {
                    a: "������",
                    c: "��",
                    d: "�",
                    e: "����",
                    i: "����",
                    m: "�",
                    n: "�",
                    o: "������",
                    u: "����",
                    y: "��"
                }
            }
        }
        function getKeyText(key) {
            return "DEL" === key ? '<i class="md-icon">backspace</i>' : key
        }
        function getKeyHtml(key) {
            return '<button data-key="' + key + '" class="clearButton keyboardButton">' + getKeyText(key) + "</button>"
        }
        function replaceAll(str, find, replace) {
            return str.split(find).join(replace)
        }
        function parentWithTag(elem, tagName) {
            for (; elem.tagName !== tagName;)
                if (!(elem = elem.parentNode))
                    return null;
            return elem
        }
        function onKeyClick(dlg, field, key) {
            switch (field = parentWithTag(field, "PAPER-INPUT") || field,
            key) {
                case "DEL":
                    field.value && (field.value = field.value.substring(0, field.value.length - 1));
                    break;
                case "SHIFT":
                    dlg.querySelector(".keyboardContainer").classList.toggle("upper");
                    break;
                case "SPACE":
                    field.value += " ";
                    break;
                default:
                    dlg.querySelector(".keyboardContainer").classList.contains("upper") && (key = key.toUpperCase()),
                        field.value += key
            }
            var displayValue = getDisplayValue(field);
            if ("password" === field.type) {
                var length = displayValue.length;
                for (displayValue = ""; displayValue.length < length;)
                    displayValue += "*"
            }
            dlg.querySelector(".keyboardValue").innerHTML = replaceAll(displayValue || "&nbsp;", " ", "&nbsp;")
        }
        function getDisplayValue(field) {
            var displayValue = field.value;
            if ("password" === field.type) {
                var length = displayValue.length;
                for (displayValue = ""; displayValue.length < length;)
                    displayValue += "*"
            }
            return displayValue
        }
        function parentWithClass(elem, className) {
            for (; !elem.classList || !elem.classList.contains(className);)
                if (!(elem = elem.parentNode))
                    return null;
            return elem
        }
        function showInternal(options, dialogHelper) {
            var dlg = dialogHelper.createDialog({
                removeOnClose: !0,
                size: "fullscreen"
            });
            dlg.classList.add("keyboardDialog");
            var html = "";
            html += '<div style="margin:0;padding:0;">',
                html += '<button tabindex="-1" is="paper-icon-button-light" class="btnKeyboardExit autoSize"><i class="md-icon">arrow_back</i></button>',
                options.label && (html += "<h1>",
                    html += options.label,
                    html += "</h1>"),
                html += '<div class="keyboardValue">' + (getDisplayValue(options.field) || "&nbsp;") + "</div>";
            var layout = getKeys();
            html += '<div class="keyboardContainer">',
                html += '<div class="standard">',
                layout.keys.standard.forEach(function (row) {
                    html += '<div class="keyboardRow">',
                        row.forEach(function (key) {
                            html += getKeyHtml(key)
                        }),
                        html += "</div>"
                }),
                html += "</div>",
                html += '<div class="symbols">',
                layout.keys.symbol.forEach(function (row) {
                    html += '<div class="keyboardRow">',
                        row.forEach(function (key) {
                            html += getKeyHtml(key)
                        }),
                        html += "</div>"
                }),
                html += "</div>",
                html += '<div class="keyboardRow">',
                html += getKeyHtml("SPACE"),
                html += "</div>",
                html += "</div>",
                html += "</div>",
                dlg.innerHTML = html,
                document.body.appendChild(dlg),
                dlg.addEventListener("click", function (e) {
                    var btn = parentWithClass(e.target, "keyboardButton");
                    btn && onKeyClick(dlg, options.field, btn.getAttribute("data-key"))
                }),
                dlg.querySelector(".btnKeyboardExit").addEventListener("click", function (e) {
                    dialogHelper.close(dlg)
                }),
                dialogHelper.open(dlg)
        }
        var self = this;
        self.name = "Default Keyboard",
            self.type = "keyboard",
            self.id = "keyboard",
            self.show = function (options) {
                require(["dialogHelper", "css!" + pluginManager.mapPath(self, "style.css")], function (dialogHelper) {
                    showInternal(options, dialogHelper)
                })
            }
    }
});
