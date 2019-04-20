define(["globalize","pluginManager","connectionManager","loading","./../components/tabbedpage","backdrop","focusManager","playbackManager","layoutManager","browser","./../skininfo","events","dom"],function(globalize,pluginManager,connectionManager,loading,tabbedPage,backdrop,focusManager,playbackManager,layoutManager,browser,skinInfo,events,dom){"use strict";function loadViewHtml(page,parentId,html,viewName,autoFocus,self){var homeScrollContent=page.querySelector(".contentScrollSlider");html=html,homeScrollContent.innerHTML=globalize.translateDocument(html,skinInfo.id),require([skinInfo.id+"/home_horiz/views."+viewName],function(viewBuilder){var homePanel=homeScrollContent,apiClient=connectionManager.currentApiClient(),tabView=new viewBuilder(homePanel,apiClient,parentId,autoFocus);tabView.element=homePanel,loadFocusScaleCards(homePanel),tabView.loadData(!0),self.tabView=tabView})}function loadFocusScaleCards(elem){if(layoutManager.tv)for(var cards=elem.querySelectorAll(".card-static"),i=0,length=cards.length;i<length;i++)if(browser.slow){var focusContent=cards[i].querySelector(".card-focuscontent");focusContent&&focusContent.classList.add("card-focuscontent-large")}else cards[i].querySelector(".cardBox").classList.add("cardBox-focustransform")}return function(view,params){function reloadTabData(tabView){var activeElement=view.activeElement,card=activeElement?dom.parentWithClass(activeElement,"card"):null,itemId=card?card.getAttribute("data-id"):null,parentItemsContainer=activeElement?dom.parentWithClass(activeElement,"itemsContainer"):null;return tabView.loadData(!1).then(function(){return Promise.resolve({activeElement:activeElement,itemId:itemId,parentItemsContainer:parentItemsContainer,tabView:tabView})})}function onTabReloaded(tabInfo){var activeElement=tabInfo.activeElement,tabView=tabInfo.tabView,itemId=tabInfo.itemId,parentItemsContainer=tabInfo.parentItemsContainer;if(activeElement&&document.body.contains(activeElement)&&focusManager.isCurrentlyFocusable(activeElement))console.log("re-focusing activeElement"),focusManager.focus(activeElement);else{if(itemId){console.log("focusing by itemId");var card=tabView.element.querySelector("*[data-id='"+itemId+"']");if(card&&document.body.contains(card)&&focusManager.isCurrentlyFocusable(card))return console.log("focusing card by itemId"),void focusManager.focus(card)}if(parentItemsContainer&&document.body.contains(parentItemsContainer)&&(console.log("focusing parentItemsContainer"),focusManager.autoFocus(parentItemsContainer)))return void console.log("focus parentItemsContainer succeeded");console.log("focusing tabview"),focusManager.autoFocus(tabView.element)}}function renderTabs(view,pageInstance){var apiClient=connectionManager.currentApiClient();apiClient.getUserViews({},apiClient.getCurrentUserId()).then(function(result){var tabbedPageInstance=new tabbedPage(view,{handleFocus:!0});tabbedPageInstance.loadViewContent=loadViewContent,tabbedPageInstance.renderTabs(result.Items),pageInstance.tabbedPage=tabbedPageInstance})}function loadViewContent(page,id,type){return new Promise(function(resolve,reject){type=(type||"").toLowerCase();var viewName="";switch(type){case"tvshows":viewName="tv";break;case"movies":viewName="movies";break;case"channels":viewName="channels";break;case"music":viewName="music";break;case"playlists":case"boxsets":viewName="generic";break;case"livetv":viewName="livetv";break;default:viewName="generic"}require(["text!"+pluginManager.mapPath(skinInfo.id,"home_horiz/views."+viewName+".html")],function(html){if(!autoFocusTabContent){var activeElement=document.activeElement;activeElement&&"BODY"!==activeElement.tagName&&document.body.contains(activeElement)||(autoFocusTabContent=!0)}loadViewHtml(page,id,html,viewName,autoFocusTabContent,self),autoFocusTabContent=!1,resolve()})})}var self=this;view.addEventListener("viewbeforeshow",function(e){self.reloadPromise=null,e.detail.isRestored&&self.tabView&&(self.reloadPromise=reloadTabData(self.tabView))}),view.addEventListener("viewshow",function(e){var isRestored=e.detail.isRestored;Emby.Page.setTitle(""),isRestored?self.reloadPromise&&self.reloadPromise.then(onTabReloaded):(loading.show(),renderTabs(view,self)),document.querySelector(".headerTop").classList.add("homehoriz_headerTop")}),view.addEventListener("viewhide",function(e){document.querySelector(".headerTop").classList.remove("homehoriz_headerTop"),self.tabView&&self.tabView.onPause&&self.tabView.onPause()}),view.addEventListener("viewdestroy",function(){self.tabbedPage&&self.tabbedPage.destroy(),self.tabView&&self.tabView.destroy()});var autoFocusTabContent=!0}});