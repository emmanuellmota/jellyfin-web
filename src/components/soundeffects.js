define([],function(){"use strict";function play(options){var path=options.path,sound=sounds[path];sound||(sound=new Howl({src:[path],volume:.3}),sounds[path]=sound),sound.play()}var sounds={};return{play:function(options){if(window.Howl)return void play(options);require(["howler"],function(howler){play(options)})}}});