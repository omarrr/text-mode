
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
		console.log("getMode");
		var enableAll = (response.enableAll === "true");

		isEnabled = enableAll;

		this.setBodyType();
		this.setFavicon();
	}
	chrome.extension.sendMessage({method: "getMode", refresh: true}, this.getMode);

// Get BODY tag
	domReady = false;
	function onReady() {
		console.log("onReady");
		domReady = true;

		this.setBodyType();
		this.setFavicon();
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
	/*
	var body = null;
	var bodies = document.getElementsByTagName("body"); // << I've never seen a DOM with more than one body but that doesn't mean they don't exist :!

	if (bodies && bodies.length > 0)
		body = bodies[0];
	*/
	var body = document.getElementsByTagName("body")[0];

	if(body) {
		if (body.className.indexOf(body_class_ready) < 0)
			body.className += " " + body_class_ready;

		if (isEnabled) {
			//var body = document.getElementsByTagName("body")[0];
			//var bodies = document.getElementsByTagName("body"); // << I've never seen a DOM with more than one body but that doesn't mean they don't exist :!
			//if (bodies && bodies.length > 0) {
				//body = bodies[0];
				if (body.className.indexOf(body_class_plain_text) < 0)
					body.className += " " + body_class_plain_text;
		}
	}
}

//------------------------------------------------
// BLOCK FAVICON
// Disabled since with this technique the
// favicons in the bookmarks also change
// and we don't want that.
// Need to find a better solution
//------------------------------------------------
function setFavicon() {
	return; // << Read above

	var head = document.getElementsByTagName("head")[0];

	if(head && isEnabled) {

		// FROM: http://userscripts.org/scripts/review/42247

		(function(d, h) {
		// Create this favicon
		var ss = d.createElement('link');
		ss.rel = 'shortcut icon';
		ss.type = 'image/x-icon';
		//ss.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAACMuAAAjLgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8PDw9PDw8sjw8PP88PDz/PDw8/zw8PP88PDz/PDw8/zw8PLI8PDw9AAAAAAAAAAAAAAAAAAAAAAAAAAA8PDw9PDw8soiIiP/l5eX/19fX/+Tk5P/o6Oj/19fX/+np6f+IiIj/PDw8sjw8PD0AAAAAAAAAAAAAAAAAAAAAPDw8sq+vr//r6+v/zs7O/2pqav/IyMj/yMjI/2pqav+7u7v/6+vr/6+vr/88PDyyAAAAAAAAAAAAAAAAAAAAADw8PP/m5ub/29vb/9vb2//b29v/5ubm/+bm5v/b29v/29vb/9vb2//m5ub/PDw8/wAAAAAAAAAAAAAAAAAAAAA8PDz/6+vr/+Li4v/r6+v/6+vr/+vr6//x8fH/6+vr/+vr6//i4uL/6+vr/zw8PP8AAAAAAAAAAAAAAAAAAAAAPDw8//Dw8P/w8PD/8PDw//Dw8P/w8PD/8PDw//Dw8P/w8PD/8PDw//Dw8P88PDz/AAAAAAAAAAAAAAAAAAAAADw8PLKzs7P/8PDw//j4+P/4+Pj/+Pj4//j4+P/4+Pj/+Pj4//X19f+zs7P/PDw8sgAAAAAAAAAAAAAAAAAAAAA8PDw9PDw8svb29v/X19f/PDw8//b29v/29vb/PDw8/9fX1//29vb/PDw8sjw8PD0AAAAAAAAAAAAAAAAAAAAAAAAAADw8PP/7+/v/29vb/3Z2dv/7+/v/+/v7/3Z2dv/b29v/+/v7/zw8PP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8PDyy/////+/v7//o6Oj////////////o6Oj/7+/v//////88PDyyAAAAAAAAAAAAAAAAPDw8fDw8PP88PDz/PDw8/2VlZf+8vLz/lJSU/7y8vP+UlJT/vLy8/5SUlP+8vLz/PDw8/zw8PP88PDz/PDw8fDw8PLL/////oKCg/zw8PP88PDz/ZWVl/zw8PP9lZWX/PDw8/2VlZf88PDz/PDw8/zw8PP+goKD//////zw8PLI8PDw9PDw8/zw8PP88PDx8PDw8sjw8PP88PDz/PDw8/zw8PP88PDz/PDw8/zw8PLI8PDx8PDw8/zw8PP88PDw9AAAAAAAAAAAAAAAAAAAAADw8PP//////PDw8sgAAAAAAAAAAPDw8sv////88PDz/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8PDz//////zw8PHwAAAAAAAAAADw8PHz/////PDw8/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPDw8Kzw8PP88PDz/AAAAAAAAAAA8PDz/PDw8/zw8PCsAAAAAAAAAAAAAAAAAAAAA8A8AAOAHAADAAwAAwAMAAMADAADAAwAAwAMAAOAHAADgBwAA4AcAAIABAAAAAAAAkAkAAPGPAADzzwAA+Z8AAA==';

		// used: http://www.motobit.com/util/base64-decoder-encoder.asp
		ss.href = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAZGRk/2RkZP9kZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAAAAAAAAZGRk/2RkZP9kZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/wAAAAAAAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/ZGRk/2RkZP8AAAAAAAAAAAAAAABkZGT/ZGRk/2RkZP9kZGT/AAAAAAAAAAAAAAAAAAAAAGRkZP9kZGT/ZGRk/2RkZP9kZGT/ZGRk/wAAAAAAAAAA4HgAAPA8AJB4Hu0RPA8AUB4H8XIPA/KMB4HzpwPA9MKB4PXewPD2++B4+BnwPPk4eB76VzwP+3ceB/yYDwP9ug==';
		//ss.href = "url('"+chrome.extension.getURL("imgs/favicon.ico")+"')";

		// Remove any existing favicons
		var links = h.getElementsByTagName('link');
		for (var i=0; i<links.length; i++) {
			if (links[i].href == ss.href) return;
			if (links[i].rel == "shortcut icon" || links[i].rel=="icon")
				h.removeChild(links[i]);
		}
		// Add this favicon to the head
		h.appendChild(ss);
		// Force browser to acknowledge
		var shim = document.createElement('iframe');
		shim.width = shim.height = 0;
		document.body.appendChild(shim);
		shim.src = "icon";
		document.body.removeChild(shim);

		})(document, head);

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

//------------------------------------------------
// BLOCK IFRAMES
// Unless they come from this domain
// Might be some needed script
// GMAIL breaks if we block iFrames
//------------------------------------------------

	function urlBelongsToThisSite(assetUrl) {
		var currHost = parseUri(window.location).host;
		var assetHost = parseUri(assetUrl).host;

		return (currHost === assetHost);
	}

	// Use HTML5 dataset to store edits
	// Namespace our keys to avoid conflicts
	var dataset_redirected_key = "__plain_text_redirected__";

	// Don't load any IFRAME unless it's from this same domain
	function doBeforeLoad(event) {

		// Use HTML5 dataset to store edits
		if (isEnabled &&
			!event.srcElement.dataset['redirected'] &&
			event.srcElement.tagName == "IFRAME"  &&
			urlBelongsToThisSite(event.srcElement.src)
			)
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

