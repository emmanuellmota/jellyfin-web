! function() {
    "use strict";

    var exLog = console.log;
    var logEl = document.querySelector("#log");
    if (logEl) {
        console.log = function (msg) {
            exLog.apply(this, arguments);
            logEl.innerText = logEl.innerText + msg + "\n";
            logEl.scrollTo(0, logEl.scrollHeight);
        }
    }

    function loadApp() {
        var script = document.createElement("script"),
            src = "./scripts/site.js";
        self.dashboardVersion && (src += "?v=" + self.dashboardVersion), script.src = src, document.head.appendChild(script)
    }! function() {
        var src, script = document.createElement("script");
        src = self.Promise ? "./bower_components/alameda/alameda.js" : "./bower_components/requirejs/require.js", self.dashboardVersion && (src += "?v=" + self.dashboardVersion), script.src = src, script.onload = loadApp, document.head.appendChild(script)
    }()
}();
