
/*************************************************

	BG.js
	------
	This code is executed on the BACKGROUND
	It runs in the context of the extension (not the page)
	Is fired when the extension loads and it's always running

	Communication
		* Background.js <-> Options.js	via localStorage
		* Background.js <-> Tab.js		via Message Passing (http://developer.chrome.com/extensions/messaging.html)

*************************************************/

//------------------------------------------------
// UI
//------------------------------------------------

	//var textMode = false;
	var iconOn = "../imgs/iconOn.png";
	var iconOff = "../imgs/iconOff.png";

	// Called when the user clicks on the browser action.
	chrome.browserAction.onClicked.addListener(function(tab) {

		//alert("click: "+getIsEnableAll());
		//textMode = !textMode;

		toggleIsEnableAll();

		setListeners();
		updateUI();
		refreshTab(tab.id);
		//chrome.tabs.reload(tab.id);

		/*
		chrome.tabs.executeScript(
			tab.id,
			{code:"document.body.style.background='red !important'"},
			null
			);
		*/
		/*
			chrome.tabs[tab].executeScript(
				null,
				{code:"document.body.style.background='red !important'"}
			);
			//chrome.tabs[tab].executeScript(
			//	null,
			//	{code:"document.body.style.background='red !important'"}
			//);
		*/

	});
function updateUI() {
	var isEnabled = getIsEnableAll();

	//alert("updateUI.isEnabled: "+isEnabled);
	var iconCurr = isEnabled ? iconOn : iconOff;
	chrome.browserAction.setIcon({path:iconCurr});
}
function refreshTab(tabId) {
	chrome.tabs.reload(tabId);
}

//------------------------------------------------
// MODE
//------------------------------------------------
function getIsEnableAll()
{
	return localStorage['enable_all'] === "true";
}
function setIsEnableAll(enable)
{
	localStorage['enable_all'] = enable;
	return enable;
}
function toggleIsEnableAll()
{
	return setIsEnableAll(!getIsEnableAll());
}

//------------------------------------------------
// Desaturation
//------------------------------------------------
function getIsDesaturated() {
	// return localStorage['is_desaturated'] === "true";
	return !(localStorage['is_desaturated'] === "false");
}

//------------------------------------------------
// White BG
//------------------------------------------------
function getUseWhiteBg() {
	return !(localStorage['use_white_bg'] === "false");
}

//------------------------------------------------
// Replacement Image
//------------------------------------------------
function getReplacementImageID() {
	// Get image # to use
	var currImageReplacementDefault = 0;
	var currImageReplacementID = localStorage["replacement_image"] || currImageReplacementDefault;

	// console.log("currImageReplacementID: "+currImageReplacementID);

	return currImageReplacementID;
}
function getReplacementImage() {
	// Get image # to use
	var currImageReplacementID = getReplacementImageID();
	// Get image URL
	var currImageReplacement = chrome.extension.getURL("imgs/bg/bg_"+currImageReplacementID+".png");

	// console.log("currImageReplacement: "+currImageReplacement);

	return currImageReplacement;
}
function getBlankReplacementImage() {
	// Get image # to use
	var imageReplacementID = 1;
	// Get image URL
	// var imageReplacement = chrome.extension.getURL("imgs/bg/bg_blank_1px.png");
	var imageReplacement = chrome.extension.getURL("imgs/bg/bg_grey_1px.png");

	// console.log("imageReplacement: "+imageReplacement);

	return imageReplacement;
}

//------------------------------------------------
// POPUP >> PAGE
//------------------------------------------------
// This function is called on page load by the plain-text.js
// It returns the current Mode
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	var response = {};

    if (request.method === "getMode"){
      //response.enableAll = localStorage['enable_all'];
      response.enableAll = getIsEnableAll().toString();
      response.replacementImageID = getReplacementImageID().toString();
      response.isDesaturated = getIsDesaturated().toString();
      response.useWhiteBg = getUseWhiteBg().toString();
	}
    if (request.refresh === "true"){
		setListeners();
		updateUI();
	}

    sendResponse(response); // snub them.
});

//------------------------------------------------
// Avoid loading IMGs and OBJECTs
//		(We let IFRAMEs through since they break if blocked this way)
//------------------------------------------------

		onBeforeRequestImage = function(info)
		{
			//console.log("IMG intercepted: " + info.url);

			// Redirect the image request to blank.
			// return {redirectUrl: chrome.extension.getURL("imgs/bg/bg_blank_1px.png")};
			return {redirectUrl: getBlankReplacementImage()};
			// return {redirectUrl: getReplacementImage()};
		};
		onBeforeRequestObject = function(info) {
			// console.log("IMG intercepted: " + info.url);

			// Canceling the request shows an ugly Chrome message
			//return {cancel:true};

			// Redirect the asset request to ////.  /. 
			// return {redirectUrl: chrome.extension.getURL("imgs/bg/bg_3.png")};
			return {redirectUrl: getReplacementImage()};
		};
function setListeners() {
	var isEnabled = getIsEnableAll();

	if (isEnabled
		&&
		(getReplacementImageID() > 0) )
	{
		// Sets the listeners only if the extension is enabled for the current context
		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			onBeforeRequestImage,
			// filters
			{
				urls: [
					"http://*/*",
					"https://*/*"
				],

				// Possible values:
				// "main_frame", "sub_frame", "stylesheet", "script",
				// "image", "object", "xmlhttprequest", "other"
				types: ["image"]
			},
			// extraInfoSpec
			["blocking"]
		);
		chrome.webRequest.onBeforeRequest.addListener(
			// listener
			onBeforeRequestObject,
			// filters
			{
				urls: [
					"http://*/*",
					"https://*/*"
				],

				// Gmail breaks if we block IFRAMES so we block at TAB level (in tab.js)
				//types: ["sub_frame", "object"]
				types: ["object"] 
					// Possible values:
					// "main_frame", "sub_frame", "stylesheet", "script",
					// "image", "object", "xmlhttprequest", "other"
			},
			// extraInfoSpec
			["blocking"]
		);
	}
	else
	{
		// Remove listeners
		chrome.webRequest.onBeforeRequest.removeListener( onBeforeRequestImage );
		chrome.webRequest.onBeforeRequest.removeListener( onBeforeRequestObject );
	}
}

setListeners();
updateUI();
