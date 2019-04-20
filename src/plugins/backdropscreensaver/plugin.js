define(["connectionManager"],function(connectionManager){"use strict";function BackdropScreenSaver(){this.name="Backdrop ScreenSaver",this.type="screensaver",this.id="backdropscreensaver",this.supportsAnonymous=!1}function showWithItems(instance,items){require(["slideshow"],function(slideshow){if(!instance.currentSlideshow){var newSlideShow=new slideshow({showTitle:!0,cover:!0,items:items});newSlideShow.show(),instance.currentSlideshow=newSlideShow}})}return BackdropScreenSaver.prototype.show=function(){if(!this.currentSlideshow){var query={ImageTypes:"Backdrop",EnableImageTypes:"Backdrop",IncludeItemTypes:"Movie,Series,MusicArtist,Game",SortBy:"Random",Recursive:!0,Fields:"Taglines",ImageTypeLimit:1,StartIndex:0,Limit:200},apiClient=connectionManager.currentApiClient(),self=this;apiClient.getItems(apiClient.getCurrentUserId(),query).then(function(result){result.Items.length&&showWithItems(self,result.Items)})}},BackdropScreenSaver.prototype.hide=function(){var currentSlideshow=this.currentSlideshow;currentSlideshow&&(currentSlideshow.hide(),this.currentSlideshow=null)},BackdropScreenSaver});