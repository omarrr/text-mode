
/*************************************************

	BG.js
	------
	This code is executed on the BACKGROUND
	It runs in the context of the extension (not the page)
	Is fired when the extension loads and it's always running

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

//var isEnabled = false;
//var enableAll = localStorage['enable_all'] === "true";
//var enableAll = getIsEnableAll();
//alert(enableAll);
//	isEnabled = enableAll;

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
	}
    if (request.refresh === "true"){
		setListeners();
		updateUI();
	}

    sendResponse(response); // snub them.
});

//------------------------------------------------
// Avoid loading IMGs, IFRAMEs and OBJECTs
//------------------------------------------------

// Sets the listeners only if the extension is enabled for the current context
		onBeforeRequestImage = function(info)
		{
			console.log("IMG intercepted: " + info.url);
			// Redirect the image request to blank.
			return {redirectUrl: chrome.extension.getURL("imgs/bg_blank_1px.png")};
		};
		onBeforeRequestObject = function(info) {
			console.log("IMG intercepted: " + info.url);

			// Canceling the request shows an ugly Chrome message
			//return {cancel:true};

			// Redirect the asset request to ////.
			return {redirectUrl: chrome.extension.getURL("imgs/bg_lines_03_grey.png")};
		};
function setListeners(){
	var isEnabled = getIsEnableAll();

	if (!isEnabled)
	{
		chrome.webRequest.onBeforeRequest.removeListener(
			onBeforeRequestImage
			);
		chrome.webRequest.onBeforeRequest.removeListener(
			onBeforeRequestObject
			);
	}
	else
	//if (isEnabled)
	//if(1)
	{
		//alert("setListeners");

		chrome.webRequest.onBeforeRequest.addListener(
			onBeforeRequestImage,
					
			//		function(info) {
			//			console.log("IMG intercepted: " + info.url);
			//			// Redirect the image request to blank.
			//			return {redirectUrl: chrome.extension.getURL("imgs/bg_blank_1px.png")};
			//		},
					
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
			onBeforeRequestObject,
					/*
					function(info) {
						console.log("IMG intercepted: " + info.url);

						// Canceling the request shows an ugly Chrome message
						//return {cancel:true};

						// Redirect the asset request to ////.
						return {redirectUrl: chrome.extension.getURL("imgs/bg_lines_03_grey.png")};
					},
					*/
			// filters
			{
				urls: [
					"http://*/*",
					"https://*/*"
				],

				// Possible values:
				// "main_frame", "sub_frame", "stylesheet", "script",
				// "image", "object", "xmlhttprequest", "other"

				// Gmail breaks if we block IFRAMES so we block at TAB level (in tab.js)
				//types: ["sub_frame", "object"]
				types: ["object"]
			},
			// extraInfoSpec
			["blocking"]
		);

	}

}
setListeners();
updateUI();
