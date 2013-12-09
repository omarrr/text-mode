
/*************************************************

	BG.js
	------
	This code is executed on the BACKGROUND
	It runs in the context of the extension (not the page)
	Is fired when the extension loads and it's always running

	Communication
		* Background.js <-> Options.js	via localStorage
		* Background.js <-> Tab.js		via Message Passing 
										(http://developer.chrome.com/extensions/messaging.html)

*************************************************/

//------------------------------------------------
// UI [T] Button
//------------------------------------------------
var iconOn = "../imgs/iconOn.png";
var iconOff = "../imgs/iconOff.png";

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {

	toggleIsEnableAll();

	setListeners();
	updateUI();
	refreshTab(tab.id);

		// chrome.tabs.executeScript(
		// 	tab.id,
		// 	// {code:"document.body.style.background='red !important'"},
		// 	{code:"-webkit-filter: grayscale(100%) !important;"},
		// 	null
		// 	);
		// chrome.tabs[tab.id].insertCSS(
		// 	tab.id,
		// 	// {code:"document.body.style.background='red !important'"},
		// 	{code:"body {-webkit-filter: grayscale(100%) !important;}"},
		// 	null
		// 	);
});

function updateUI() {
	var isEnabled = getIsEnableAll();
	var iconCurr = isEnabled ? iconOn : iconOff;
	chrome.browserAction.setIcon({path:iconCurr});
}

//------------------------------------------------
// Refresh
//------------------------------------------------
function refreshTab(tabId) {
	chrome.tabs.reload(tabId);
}

//------------------------------------------------
// ENABLE Mode
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
	var currImageReplacementDefault = 1;
	var currImageReplacementID = localStorage["replacement_image"] || currImageReplacementDefault;

	return currImageReplacementID;
}
function getReplacementImage() {
	var currImageReplacementID = getReplacementImageID();
	var currImageReplacement = chrome.extension.getURL("imgs/bg/bg_"+currImageReplacementID+".png");

	return currImageReplacement;
}
function getBlankReplacementImage() {
	var imageReplacement = chrome.extension.getURL("imgs/bg/bg_blank_1px.png");

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

//------------------------------------------------
// Listeners

	onBeforeRequestImage = function(info)
	{
		// Redirect the image request to blank.
		return {redirectUrl: getBlankReplacementImage()};
	};
	onBeforeRequestObject = function(info) {
		// Canceling the request shows an ugly Chrome message
		//return {cancel:true};

		// Redirect the asset request to ////
		return {redirectUrl: getReplacementImage()};
	};

//------------------------------------------------
// Setup

function setListeners() {
	var isEnabled = getIsEnableAll();

	console.log("setListeners: getReplacementImageID=" + getReplacementImageID());

	if (isEnabled
		&&
		(getReplacementImageID() >= 0) )
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
