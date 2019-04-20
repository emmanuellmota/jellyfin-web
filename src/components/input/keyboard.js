require(["inputmanager", "dom", "apphost", "browser"], function (inputmanager, dom, appHost, browser) {
    "use strict";
    function notifyApp() {
        inputmanager.notify()
    }
    function sendCommand(name, sourceElement) {
        var options = {
            sourceElement: sourceElement
        };
        inputmanager.trigger(name, options)
    }
    function sendCommandFromEvent(name, e) {
        e.preventDefault();
        var options = {
            sourceElement: e.target
        };
        inputmanager.trigger(name, options)
    }
    function isEditable(elem) {
        return !elem.readonly && ("INPUT" === elem.tagName ? "checkbox" !== elem.type && "radio" !== elem.type && "file" !== elem.type && "hidden" !== elem.type : "TEXTAREA" === elem.tagName)
    }
    var keyOptions = appHost.getKeyOptions ? appHost.getKeyOptions() || {} : {};
    keyOptions.keyMaps = keyOptions.keyMaps || {};
    var backKeyMaps = keyOptions.keyMaps.back || []
        , userAgent = navigator.userAgent.toLowerCase()
        , handleMultiMediaKeys = -1 === userAgent.indexOf("electron") || -1 === userAgent.indexOf("windows")
        , acceptKeysByName = !browser.tizen && !browser.orsay;
    dom.addEventListener(window, "keydown", function (evt) {
        if (acceptKeysByName) {
            switch (evt.key) {
                case "ArrowUp":
                case "Up":
                case "NavigationUp":
                case "GamepadDPadUp":
                case "GamepadLeftThumbstickUp":
                    return void sendCommandFromEvent("up", evt);
                case "ArrowDown":
                case "Down":
                case "NavigationDown":
                case "GamepadDPadDown":
                case "GamepadLeftThumbstickDown":
                    return void sendCommandFromEvent("down", evt);
                case "ArrowLeft":
                case "Left":
                case "NavigationLeft":
                case "GamepadDPadLeft":
                case "GamepadLeftThumbstickLeft":
                    if (evt.altKey) {
                        if (keyOptions.handleAltLeftBack)
                            return evt.preventDefault(),
                                void sendCommand("back")
                    } else if (!isEditable(evt.target))
                        return void sendCommandFromEvent("left", evt);
                    break;
                case "ArrowRight":
                case "Right":
                case "NavigationRight":
                case "GamepadDPadRight":
                case "GamepadLeftThumbstickRight":
                    if (evt.altKey) {
                        if (keyOptions.handleAltRightForward)
                            return evt.preventDefault(),
                                void sendCommand("forward")
                    } else if (!isEditable(evt.target))
                        return void sendCommandFromEvent("right", evt);
                    break;
                case "End":
                    return void sendCommandFromEvent("end", evt);
                case "Home":
                    return void sendCommandFromEvent("home", evt);
                case "PageUp":
                    return void sendCommandFromEvent("pageup", evt);
                case "PageDown":
                    return void sendCommandFromEvent("pagedown", evt);
                case "Backspace":
                    break;
                case "Delete":
                case "Del":
                    break;
                case "Accept":
                case "NavigationAccept":
                case "GamePadA":
                    return void sendCommandFromEvent("select", evt);
                case "Cancel":
                case "NavigationCancel":
                case "GamePadB":
                    return void sendCommandFromEvent("back", evt);
                case "ContextMenu":
                case "NavigationMenu":
                    return void sendCommandFromEvent("menu", evt);
                case "Menu":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("menu", evt);
                    break;
                case "Escape":
                case "Esc":
                    return void sendCommandFromEvent("back", evt);
                case "Execute":
                    return void sendCommandFromEvent("select", evt);
                case "Help":
                case "Finish":
                    break;
                case "Find":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("search", evt);
                    break;
                case "Select":
                    return void sendCommandFromEvent("select", evt);
                case "ZoomIn":
                case "ZoomOut":
                    return void sendCommandFromEvent("changezoom", evt);
                case "F8":
                    return void sendCommandFromEvent("togglemute", evt);
                case "F9":
                    return void sendCommandFromEvent("volumedown", evt);
                case "F10":
                    return void sendCommandFromEvent("volumeup", evt);
                case "+":
                    if (!isEditable(evt.target))
                        return void sendCommandFromEvent("channelup", evt);
                    break;
                case "ChannelUp":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("channelup", evt);
                    break;
                case "-":
                    if (!isEditable(evt.target))
                        return void sendCommandFromEvent("channeldown", evt);
                    break;
                case "ChannelDown":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("channeldown", evt);
                    break;
                case "MediaFastForward":
                case "FastFwd":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("fastforward", evt);
                    break;
                case "MediaPause":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("pause", evt);
                    break;
                case "MediaPlay":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("unpause", evt);
                    break;
                case "MediaPlayPause":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("playpause", evt);
                    break;
                case "MediaRecord":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("record", evt);
                    break;
                case "MediaRewind":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("rewind", evt);
                    break;
                case "MediaStop":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("stop", evt);
                    break;
                case "MediaTrackNext":
                case "MediaNextTrack":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("next", evt);
                    break;
                case "MediaTrackPrevious":
                case "MediaPreviousTrack":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("previous", evt);
                    break;
                case "AudioVolumeDown":
                case "VolumeDown":
                    return void sendCommandFromEvent("volumedown", evt);
                case "AudioVolumeUp":
                case "VolumeUp":
                    return void sendCommandFromEvent("volumeup", evt);
                case "AudioVolumeMute":
                case "VolumeMute":
                    return void sendCommandFromEvent("togglemute", evt);
                case "ColorF0Red":
                    return void sendCommandFromEvent("red", evt);
                case "ColorF1Green":
                    return void sendCommandFromEvent("green", evt);
                case "ColorF2Yellow":
                    return void sendCommandFromEvent("yellow", evt);
                case "ColorF3Blue":
                    return void sendCommandFromEvent("blue", evt);
                case "ColorF4Grey":
                    return void sendCommandFromEvent("grey", evt);
                case "ColorF5Brown":
                    return void sendCommandFromEvent("brown", evt);
                case "ClosedCaptionToggle":
                    return void sendCommandFromEvent("changesubtitletrack", evt);
                case "Dimmer":
                    return void sendCommandFromEvent("changebrightness", evt);
                case "DVR":
                    return void sendCommandFromEvent("guide", evt);
                case "Exit":
                    return void sendCommandFromEvent("back", evt);
                case "Guide":
                case "GuideNextDay":
                case "GuidePreviousDay":
                    return void sendCommandFromEvent("guide", evt);
                case "Info":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("info", evt);
                    break;
                case "InstantReplay":
                    return void sendCommandFromEvent("rewind", evt);
                case "Link":
                    return void sendCommandFromEvent("select", evt);
                case "LiveContent":
                    return void sendCommandFromEvent("livetv", evt);
                case "MediaAudioTrack":
                    return void sendCommandFromEvent("changeaudiotrack", evt);
                case "MediaLast":
                    break;
                case "MediaSkipBackward":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("previouschapter", evt);
                    break;
                case "MediaSkipForward":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("nextchapter", evt);
                    break;
                case "MediaStepBackward":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("rewind", evt);
                    break;
                case "MediaStepForward":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("fastforward", evt);
                    break;
                case "MediaTopMenu":
                    return void sendCommandFromEvent("home", evt);
                case "NavigateIn":
                    return void sendCommandFromEvent("select", evt);
                case "NavigateNext":
                    return void sendCommandFromEvent("next", evt);
                case "NavigateOut":
                    return void sendCommandFromEvent("back", evt);
                case "NavigatePrevious":
                    return void sendCommandFromEvent("previous", evt);
                case "NextFavoriteChannel":
                    return void sendCommandFromEvent("next", evt);
                case "Settings":
                    return void sendCommandFromEvent("settings", evt);
                case "Subtitle":
                case "Teletext":
                    return void sendCommandFromEvent("changesubtitletrack", evt);
                case "ZoomToggle":
                case "Zoom":
                    return void sendCommandFromEvent("changezoom", evt);
                case "Close":
                    return void sendCommandFromEvent("back", evt);
                case "New":
                    break;
                case "Open":
                    return void sendCommandFromEvent("select", evt);
                case "Save":
                    return void sendCommandFromEvent("save", evt);
                case "LaunchMusicPlayer":
                    return void sendCommandFromEvent("music", evt);
                case "LaunchScreenSaver":
                    return void sendCommandFromEvent("screensaver", evt);
                case "BrowserBack":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("back", evt);
                    break;
                case "BrowserFavorites":
                    return void sendCommandFromEvent("favorites", evt);
                case "BrowserForward":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("forward", evt);
                    break;
                case "BrowserHome":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("home", evt);
                    break;
                case "BrowserRefresh":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("refresh", evt);
                    break;
                case "BrowserSearch":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("search", evt);
                    break;
                case "BrowserStop":
                    if (handleMultiMediaKeys)
                        return void sendCommandFromEvent("stop", evt)
            }
        }
        var keyCode = evt.keyCode;
        if (-1 !== backKeyMaps.indexOf(keyCode))
            return 8 === keyCode && isEditable(evt.target) ? void notifyApp() : (evt.preventDefault(),
                void sendCommand("back"));
        switch (keyCode) {
            case 37:
                if (evt.altKey) {
                    if (keyOptions.handleAltLeftBack)
                        return evt.preventDefault(),
                            void sendCommand("back")
                } else if (!isEditable(evt.target))
                    return evt.preventDefault(),
                        void sendCommand("left", evt.target);
                break;
            case 39:
                if (evt.altKey) {
                    if (keyOptions.handleAltRightForward)
                        return evt.preventDefault(),
                            void sendCommand("forward")
                } else if (!isEditable(evt.target))
                    return evt.preventDefault(),
                        void sendCommand("right", evt.target);
                break;
            case 142:
            case 195:
                return void sendCommand("select", evt.target);
            case 214:
            case 205:
            case 140:
                if (!isEditable(evt.target))
                    return evt.preventDefault(),
                        void sendCommand("left", evt.target);
                break;
            case 38:
            case 211:
            case 203:
            case 138:
                return evt.preventDefault(),
                    void sendCommand("up", evt.target);
            case 213:
            case 206:
            case 141:
                if (!isEditable(evt.target))
                    return evt.preventDefault(),
                        void sendCommand("right", evt.target);
                break;
            case 40:
            case 212:
            case 204:
            case 139:
                return evt.preventDefault(),
                    void sendCommand("down", evt.target);
            case 36:
                return void sendCommand("home", evt.target);
            case 33:
                return void sendCommand("pageup", evt.target);
            case 34:
                return void sendCommand("pagedown", evt.target);
            case 35:
                return void sendCommand("end", evt.target);
            case 68:
                if (evt.ctrlKey)
                    return void sendCommand("menu", evt.target);
                break;
            case 66:
                if (evt.ctrlKey)
                    return evt.shiftKey ? void sendCommand("rewind", evt.target) : void sendCommand("previouschapter", evt.target);
                if (evt.altKey)
                    return evt.preventDefault(),
                        void sendCommand("back", evt.target);
                break;
            case 70:
                if (evt.ctrlKey)
                    return evt.shiftKey ? (evt.preventDefault(),
                        void sendCommand("fastforward", evt.target)) : (evt.preventDefault(),
                            void sendCommand("nextchapter", evt.target));
                break;
            case 71:
                if (evt.ctrlKey)
                    return evt.preventDefault(),
                        void sendCommand("guide", evt.target);
                break;
            case 74:
                if (evt.ctrlKey)
                    return evt.preventDefault(),
                        void sendCommand("togglestats", evt.target);
                break;
            case 79:
                if (evt.ctrlKey)
                    return void sendCommand("recordedtv", evt.target);
                break;
            case 82:
                if (evt.ctrlKey)
                    return void sendCommand("record", evt.target);
                break;
            case 84:
                if (evt.ctrlKey)
                    return void sendCommand("livetv", evt.target);
                break;
            case 85:
                if (evt.ctrlKey)
                    return void sendCommand("changesubtitletrack", evt.target);
                break;
            case 119:
            case 173:
                return void sendCommand("togglemute", evt.target);
            case 120:
            case 175:
                return void sendCommand("volumedown", evt.target);
            case 121:
            case 174:
                return void sendCommand("volumeup", evt.target);
            case 80:
                if (evt.ctrlKey)
                    return evt.shiftKey ? void sendCommand("play", evt.target) : void sendCommand("playpause", evt.target);
                break;
            case 83:
                if (evt.ctrlKey)
                    return evt.shiftKey ? (evt.preventDefault(),
                        void sendCommand("stop", evt.target)) : (evt.preventDefault(),
                            void sendCommand("search", evt.target));
                break;
            case 90:
                if (evt.ctrlKey && evt.shiftKey)
                    return void sendCommand("changezoom", evt.target);
                break;
            case 65:
                if (evt.ctrlKey && evt.shiftKey)
                    return void sendCommand("changeaudiotrack", evt.target);
                break;
            case 176:
                return void sendCommand("next", evt.target);
            case 177:
                return void sendCommand("previous", evt.target);
            case 178:
                return void sendCommand("stop", evt.target)
        }
        notifyApp()
    }, {
            passive: !1
        })
});
