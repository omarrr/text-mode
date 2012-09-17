
/*************************************************

	TAB.js
	------
	This code is executed on the TAB
	Runs on the Page context
	Is fired with each page refresh

*************************************************/


//------------------------------------------------
// PAGE >> POPUP
// Get mode (enabled?)
//------------------------------------------------

// Get Preferences from the Extension
	isEnabled = false;
	//enableAll = false; // Enabled on all domains
	function getMode(response) {
		var enableAll = (response.enableAll === "true");

		isEnabled = enableAll;

		this.setBodyType();
	}
	chrome.extension.sendMessage({method: "getMode", refresh: true}, this.getMode);

// Get BODY tag
	domReady = false;
	function onReady() {
		domReady = true;

		this.setBodyType();
	}
	window.addEventListener('DOMContentLoaded', onReady, false);


//------------------------------------------------
// Set BODY type (plain_text?)
// Requires both:
//	- settings from the Extension (sendMessage)
//	- <BODY> tag to be ready
//------------------------------------------------
var body_class_plain_text = "__plain_text__";
var body_class_ready = "__plain_text_READY__";
function setBodyType() {
	//alert("setBodyType")
	//if (isEnabled && domReady) {

	var body = null;
	var bodies = document.getElementsByTagName("body"); // << I've never seen a DOM with more than one body but that doesn't mean they don't exist :!
	if (bodies && bodies.length > 0)
		body = bodies[0];

	if(body) {
		body.className += " " + body_class_ready;
		if (isEnabled) {
			//var body = document.getElementsByTagName("body")[0];
			//var bodies = document.getElementsByTagName("body"); // << I've never seen a DOM with more than one body but that doesn't mean they don't exist :!
			//if (bodies && bodies.length > 0) {
				//body = bodies[0];
				body.className += " " + body_class_plain_text;
		}
	}
}

//$("img").css("backgroundImage", url('"+chrome.extension.getURL("imgs/bg_lines_03_grey.png")+"');

//------------------------------------------------
// Manual redirect
//
// Note: This has been replaced by:
//		chrome.webRequest.onBeforeRequest
// running on background.js
//
//------------------------------------------------
/*
	// Use HTML5 dataset to store edits
	// Namespace our keys to avoid conflicts
	var dataset_redirected_key = "__plain_text_redirected__";

	//String.prototype.endsWith = function(str) {
	//    return this.substr(str.length*-1) === str;
	//};
	function doBeforeLoad(event) {

		// Use HTML5 dataset to store edits
		if (isEnabled &&
			!event.srcElement.dataset['redirected'] &&
			event.srcElement.tagName == "IMG" )//&&
			//event.srcElement.src.endsWith('/test.png'))
		{
				// If it is something we want to redirect then set a data attribute so we know its allready been changed
				// Set that attribute to it original src in case we need to know what it was later
				event.srcElement.dataset['redirected'] = event.srcElement.src;
				// Set the source to the new url you want the element to point to
				// event.srcElement.src = "replacement.png";
				event.srcElement.src = chrome.extension.getURL("imgs/bg_blank_1px.png");

				//event.srcElement.src = chrome.extension.getURL("imgs/bg_blank.png");
				event.srcElement.style.backgroundImage = "url('"+chrome.extension.getURL("imgs/bg_lines_03_grey.png")+"')";
		}
	}

	document.addEventListener('beforeload', doBeforeLoad, true);
*/