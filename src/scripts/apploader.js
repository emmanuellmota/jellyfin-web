! function() {
    "use strict";

    var exLog = console.log;
    console.log = function (msg) {
        if (msg.toString().match(/fancygrid|trial/gi)) return;
        exLog.apply(this, arguments);
    };

    function loadApp() {
        var script = document.createElement("script"),
            src = "./scripts/site.js";
        self.dashboardVersion && (src += "?v=" + self.dashboardVersion), script.src = src, document.head.appendChild(script)
    }! function() {
        var src, script = document.createElement("script");
        src = self.Promise ? "./bower_components/alameda/alameda.js" : "./bower_components/requirejs/require.js", self.dashboardVersion && (src += "?v=" + self.dashboardVersion), script.src = src, script.onload = loadApp, document.head.appendChild(script)
    }()
}();
