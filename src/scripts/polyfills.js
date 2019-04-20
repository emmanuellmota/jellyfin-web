delete window.Promise;

!function (e, n) { "object" == typeof exports && "undefined" != typeof module ? n() : "function" == typeof define && define.amd ? define(n) : n() }(0, function () { "use strict"; function e(e) { var n = this.constructor; return this.then(function (t) { return n.resolve(e()).then(function () { return t }) }, function (t) { return n.resolve(e()).then(function () { return n.reject(t) }) }) } function n() { } function t(e) { if (!(this instanceof t)) throw new TypeError("Promises must be constructed via new"); if ("function" != typeof e) throw new TypeError("not a function"); this._state = 0, this._handled = !1, this._value = undefined, this._deferreds = [], u(e, this) } function o(e, n) { for (; 3 === e._state;)e = e._value; 0 !== e._state ? (e._handled = !0, t._immediateFn(function () { var t = 1 === e._state ? n.onFulfilled : n.onRejected; if (null !== t) { var o; try { o = t(e._value) } catch (f) { return void i(n.promise, f) } r(n.promise, o) } else (1 === e._state ? r : i)(n.promise, e._value) })) : e._deferreds.push(n) } function r(e, n) { try { if (n === e) throw new TypeError("A promise cannot be resolved with itself."); if (n && ("object" == typeof n || "function" == typeof n)) { var o = n.then; if (n instanceof t) return e._state = 3, e._value = n, void f(e); if ("function" == typeof o) return void u(function (e, n) { return function () { e.apply(n, arguments) } }(o, n), e) } e._state = 1, e._value = n, f(e) } catch (r) { i(e, r) } } function i(e, n) { e._state = 2, e._value = n, f(e) } function f(e) { 2 === e._state && 0 === e._deferreds.length && t._immediateFn(function () { e._handled || t._unhandledRejectionFn(e._value) }); for (var n = 0, r = e._deferreds.length; r > n; n++)o(e, e._deferreds[n]); e._deferreds = null } function u(e, n) { var t = !1; try { e(function (e) { t || (t = !0, r(n, e)) }, function (e) { t || (t = !0, i(n, e)) }) } catch (o) { if (t) return; t = !0, i(n, o) } } var c = setTimeout; t.prototype["catch"] = function (e) { return this.then(null, e) }, t.prototype.then = function (e, t) { var r = new this.constructor(n); return o(this, new function (e, n, t) { this.onFulfilled = "function" == typeof e ? e : null, this.onRejected = "function" == typeof n ? n : null, this.promise = t }(e, t, r)), r }, t.prototype["finally"] = e, t.all = function (e) { return new t(function (n, t) { function o(e, f) { try { if (f && ("object" == typeof f || "function" == typeof f)) { var u = f.then; if ("function" == typeof u) return void u.call(f, function (n) { o(e, n) }, t) } r[e] = f, 0 == --i && n(r) } catch (c) { t(c) } } if (!e || "undefined" == typeof e.length) throw new TypeError("Promise.all accepts an array"); var r = Array.prototype.slice.call(e); if (0 === r.length) return n([]); for (var i = r.length, f = 0; r.length > f; f++)o(f, r[f]) }) }, t.resolve = function (e) { return e && "object" == typeof e && e.constructor === t ? e : new t(function (n) { n(e) }) }, t.reject = function (e) { return new t(function (n, t) { t(e) }) }, t.race = function (e) { return new t(function (n, t) { for (var o = 0, r = e.length; r > o; o++)e[o].then(n, t) }) }, t._immediateFn = "function" == typeof setImmediate && function (e) { setImmediate(e) } || function (e) { c(e, 0) }, t._unhandledRejectionFn = function (e) { void 0 !== console && console && console.warn("Possible Unhandled Promise Rejection:", e) }; var l = function () { if ("undefined" != typeof self) return self; if ("undefined" != typeof window) return window; if ("undefined" != typeof global) return global; throw Error("unable to locate global object") }(); "Promise" in l ? l.Promise.prototype["finally"] || (l.Promise.prototype["finally"] = e) : l.Promise = t });

!function (t, e) { "object" == typeof exports && "undefined" != typeof module ? e(exports) : "function" == typeof define && define.amd ? define(["exports"], e) : e(t.WHATWGFetch = {}) }(this, function (t) { "use strict"; var e = { searchParams: "URLSearchParams" in self, iterable: "Symbol" in self && "iterator" in Symbol, blob: "FileReader" in self && "Blob" in self && function () { try { return new Blob, !0 } catch (t) { return !1 } }(), formData: "FormData" in self, arrayBuffer: "ArrayBuffer" in self }; if (e.arrayBuffer) var r = ["[object Int8Array]", "[object Uint8Array]", "[object Uint8ClampedArray]", "[object Int16Array]", "[object Uint16Array]", "[object Int32Array]", "[object Uint32Array]", "[object Float32Array]", "[object Float64Array]"], o = ArrayBuffer.isView || function (t) { return t && r.indexOf(Object.prototype.toString.call(t)) > -1 }; function n(t) { if ("string" != typeof t && (t = String(t)), /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(t)) throw new TypeError("Invalid character in header field name"); return t.toLowerCase() } function i(t) { return "string" != typeof t && (t = String(t)), t } function s(t) { var r = { next: function () { var e = t.shift(); return { done: void 0 === e, value: e } } }; return e.iterable && (r[Symbol.iterator] = function () { return r }), r } function a(t) { this.map = {}, t instanceof a ? t.forEach(function (t, e) { this.append(e, t) }, this) : Array.isArray(t) ? t.forEach(function (t) { this.append(t[0], t[1]) }, this) : t && Object.getOwnPropertyNames(t).forEach(function (e) { this.append(e, t[e]) }, this) } function h(t) { if (t.bodyUsed) return Promise.reject(new TypeError("Already read")); t.bodyUsed = !0 } function f(t) { return new Promise(function (e, r) { t.onload = function () { e(t.result) }, t.onerror = function () { r(t.error) } }) } function u(t) { var e = new FileReader, r = f(e); return e.readAsArrayBuffer(t), r } function d(t) { if (t.slice) return t.slice(0); var e = new Uint8Array(t.byteLength); return e.set(new Uint8Array(t)), e.buffer } function c() { return this.bodyUsed = !1, this._initBody = function (t) { var r; this._bodyInit = t, t ? "string" == typeof t ? this._bodyText = t : e.blob && Blob.prototype.isPrototypeOf(t) ? this._bodyBlob = t : e.formData && FormData.prototype.isPrototypeOf(t) ? this._bodyFormData = t : e.searchParams && URLSearchParams.prototype.isPrototypeOf(t) ? this._bodyText = t.toString() : e.arrayBuffer && e.blob && ((r = t) && DataView.prototype.isPrototypeOf(r)) ? (this._bodyArrayBuffer = d(t.buffer), this._bodyInit = new Blob([this._bodyArrayBuffer])) : e.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(t) || o(t)) ? this._bodyArrayBuffer = d(t) : this._bodyText = t = Object.prototype.toString.call(t) : this._bodyText = "", this.headers.get("content-type") || ("string" == typeof t ? this.headers.set("content-type", "text/plain;charset=UTF-8") : this._bodyBlob && this._bodyBlob.type ? this.headers.set("content-type", this._bodyBlob.type) : e.searchParams && URLSearchParams.prototype.isPrototypeOf(t) && this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")) }, e.blob && (this.blob = function () { var t = h(this); if (t) return t; if (this._bodyBlob) return Promise.resolve(this._bodyBlob); if (this._bodyArrayBuffer) return Promise.resolve(new Blob([this._bodyArrayBuffer])); if (this._bodyFormData) throw new Error("could not read FormData body as blob"); return Promise.resolve(new Blob([this._bodyText])) }, this.arrayBuffer = function () { return this._bodyArrayBuffer ? h(this) || Promise.resolve(this._bodyArrayBuffer) : this.blob().then(u) }), this.text = function () { var t, e, r, o = h(this); if (o) return o; if (this._bodyBlob) return t = this._bodyBlob, e = new FileReader, r = f(e), e.readAsText(t), r; if (this._bodyArrayBuffer) return Promise.resolve(function (t) { for (var e = new Uint8Array(t), r = new Array(e.length), o = 0; o < e.length; o++)r[o] = String.fromCharCode(e[o]); return r.join("") }(this._bodyArrayBuffer)); if (this._bodyFormData) throw new Error("could not read FormData body as text"); return Promise.resolve(this._bodyText) }, e.formData && (this.formData = function () { return this.text().then(p) }), this.json = function () { return this.text().then(JSON.parse) }, this } a.prototype.append = function (t, e) { t = n(t), e = i(e); var r = this.map[t]; this.map[t] = r ? r + ", " + e : e }, a.prototype.delete = function (t) { delete this.map[n(t)] }, a.prototype.get = function (t) { return t = n(t), this.has(t) ? this.map[t] : null }, a.prototype.has = function (t) { return this.map.hasOwnProperty(n(t)) }, a.prototype.set = function (t, e) { this.map[n(t)] = i(e) }, a.prototype.forEach = function (t, e) { for (var r in this.map) this.map.hasOwnProperty(r) && t.call(e, this.map[r], r, this) }, a.prototype.keys = function () { var t = []; return this.forEach(function (e, r) { t.push(r) }), s(t) }, a.prototype.values = function () { var t = []; return this.forEach(function (e) { t.push(e) }), s(t) }, a.prototype.entries = function () { var t = []; return this.forEach(function (e, r) { t.push([r, e]) }), s(t) }, e.iterable && (a.prototype[Symbol.iterator] = a.prototype.entries); var l = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"]; function y(t, e) { var r, o, n = (e = e || {}).body; if (t instanceof y) { if (t.bodyUsed) throw new TypeError("Already read"); this.url = t.url, this.credentials = t.credentials, e.headers || (this.headers = new a(t.headers)), this.method = t.method, this.mode = t.mode, this.signal = t.signal, n || null == t._bodyInit || (n = t._bodyInit, t.bodyUsed = !0) } else this.url = String(t); if (this.credentials = e.credentials || this.credentials || "same-origin", !e.headers && this.headers || (this.headers = new a(e.headers)), this.method = (r = e.method || this.method || "GET", o = r.toUpperCase(), l.indexOf(o) > -1 ? o : r), this.mode = e.mode || this.mode || null, this.signal = e.signal || this.signal, this.referrer = null, ("GET" === this.method || "HEAD" === this.method) && n) throw new TypeError("Body not allowed for GET or HEAD requests"); this._initBody(n) } function p(t) { var e = new FormData; return t.trim().split("&").forEach(function (t) { if (t) { var r = t.split("="), o = r.shift().replace(/\+/g, " "), n = r.join("=").replace(/\+/g, " "); e.append(decodeURIComponent(o), decodeURIComponent(n)) } }), e } function b(t, e) { e || (e = {}), this.type = "default", this.status = void 0 === e.status ? 200 : e.status, this.ok = this.status >= 200 && this.status < 300, this.statusText = "statusText" in e ? e.statusText : "OK", this.headers = new a(e.headers), this.url = e.url || "", this._initBody(t) } y.prototype.clone = function () { return new y(this, { body: this._bodyInit }) }, c.call(y.prototype), c.call(b.prototype), b.prototype.clone = function () { return new b(this._bodyInit, { status: this.status, statusText: this.statusText, headers: new a(this.headers), url: this.url }) }, b.error = function () { var t = new b(null, { status: 0, statusText: "" }); return t.type = "error", t }; var m = [301, 302, 303, 307, 308]; b.redirect = function (t, e) { if (-1 === m.indexOf(e)) throw new RangeError("Invalid status code"); return new b(null, { status: e, headers: { location: t } }) }, t.DOMException = self.DOMException; try { new t.DOMException } catch (e) { t.DOMException = function (t, e) { this.message = t, this.name = e; var r = Error(t); this.stack = r.stack }, t.DOMException.prototype = Object.create(Error.prototype), t.DOMException.prototype.constructor = t.DOMException } function w(r, o) { return new Promise(function (n, i) { var s = new y(r, o); if (s.signal && s.signal.aborted) return i(new t.DOMException("Aborted", "AbortError")); var h = new XMLHttpRequest; function f() { h.abort() } h.onload = function () { var t, e, r = { status: h.status, statusText: h.statusText, headers: (t = h.getAllResponseHeaders() || "", e = new a, t.replace(/\r?\n[\t ]+/g, " ").split(/\r?\n/).forEach(function (t) { var r = t.split(":"), o = r.shift().trim(); if (o) { var n = r.join(":").trim(); e.append(o, n) } }), e) }; r.url = "responseURL" in h ? h.responseURL : r.headers.get("X-Request-URL"); var o = "response" in h ? h.response : h.responseText; n(new b(o, r)) }, h.onerror = function () { i(new TypeError("Network request failed")) }, h.ontimeout = function () { i(new TypeError("Network request failed")) }, h.onabort = function () { i(new t.DOMException("Aborted", "AbortError")) }, h.open(s.method, s.url, !0), "include" === s.credentials ? h.withCredentials = !0 : "omit" === s.credentials && (h.withCredentials = !1), "responseType" in h && e.blob && (h.responseType = "blob"), s.headers.forEach(function (t, e) { h.setRequestHeader(e, t) }), s.signal && (s.signal.addEventListener("abort", f), h.onreadystatechange = function () { 4 === h.readyState && s.signal.removeEventListener("abort", f) }), h.send(void 0 === s._bodyInit ? null : s._bodyInit) }) } w.polyfill = !0, self.fetch || (self.fetch = w, self.Headers = a, self.Request = y, self.Response = b), t.Headers = a, t.Request = y, t.Response = b, t.fetch = w, Object.defineProperty(t, "__esModule", { value: !0 }) });

(function () {
    var pResolve = Promise.resolve;
    Promise.resolve = function () {
        try {
            return pResolve.apply(this, arguments);
        } catch (e) {
            return pResolve(void 0);
        }
    }

    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - Math.abs(currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

    // Array.prototype.findIndex ES6 polyfill by Crisoforo Gaspar Hernández (mitogh)

    Array.prototype.findIndex = Array.prototype.findIndex || function (callback) {
        if (this === null) {
            throw new TypeError('Array.prototype.findIndex called on null or undefined');
        } else if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[1];
        for (var i = 0; i < length; i++) {
            if (callback.call(thisArg, list[i], i, list)) {
                return i;
            }
        }
        return -1;
    };

    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function (target) {
                'use strict';
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert first argument to object');
                }

                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource === undefined || nextSource === null) {
                        continue;
                    }
                    nextSource = Object(nextSource);

                    var keysArray = Object.keys(Object(nextSource));
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex];
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
    }
}());
