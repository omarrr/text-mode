
/*************************************************

	TAB.js
	------
	This code is executed on the TAB
	Runs on the Page context
	Is fired with each page refresh

	Communication
		* Background.js <-> Tab.js		via Message Passing (http://developer.chrome.com/extensions/messaging.html)

*************************************************/


//------------------------------------------------
// PAGE >> POPUP
// Get mode (enabled?)
//------------------------------------------------

// Get Preferences from the Extension
	var isEnabled = false;
	var replacementImageID = 0;

	function getMode(response) {
		isEnabled = (response.enableAll === "true");
		replacementImageID = parseInt(response.replacementImageID);
		isDesaturated = (response.isDesaturated === "true");
		useWhiteBg = (response.useWhiteBg === "true");

		this.setBodyType();
		this.setFavicon();
	}
	chrome.extension.sendMessage({method: "getMode", refresh: true}, this.getMode);

//Images
function getBlankImg(){
	return chrome.extension.getURL("imgs/bg/bg_blank_1px.png");
}
var img_url = "imgs/bg/bg_%ID%.png";
function getBgImg(){
	img_curr = img_url.replace("%ID%", replacementImageID);

	return chrome.extension.getURL(img_curr);
}

// Get BODY tag
	// domReady = false;
	function onReady() {
		// domReady = true;

		this.setBodyType();
		this.setFavicon();
		this.replaceHolderImgs();
		this.setupLoadability()
	}
	window.addEventListener('DOMContentLoaded', onReady, false);


//------------------------------------------------
// Set BODY type (plain_text?)
// Requires both:
//	- settings from the Extension (sendMessage)
//	- <BODY> tag to be ready
//------------------------------------------------
var body_class_ready = "__plain_text_READY__";
var body_class_whitelisted = "__plain_text_whitelisted__";
var body_class_plain_text = "__plain_text__";

var body_class_text_mode_img = "__text_mode_img_%ID%__";
var body_class_text_mode_img_curr = "";

var body_class_text_mode_white_bg = "__text_mode_white_bg__";
var body_class_text_mode_desaturated = "__text_mode_desaturated__";

function setBodyType() {
	/*
	var body = null;
	var bodies = document.getElementsByTagName("body"); // << I've never seen a DOM with more than one body but that doesn't mean they don't exist :!

	if (bodies && bodies.length > 0)
		body = bodies[0];
	*/
	var body = document.getElementsByTagName("body")[0];
	body_class_text_mode_img_curr = body_class_text_mode_img.replace("%ID%", replacementImageID);

	if(body) {
		// If the page is not whitelisted (now only options.html)
		if (body.className.indexOf(body_class_whitelisted) < 0)
		{
			if (body.className.indexOf(body_class_ready) < 0)
				body.className += " " + body_class_ready;

			if (isEnabled) {
				if (body.className.indexOf(body_class_plain_text) < 0)
					body.className += " " + body_class_plain_text;

				// CSS: Image Replacement
				if (body.className.indexOf(body_class_text_mode_img_curr) < 0)
					body.className += " " + body_class_text_mode_img_curr;

				// CSS: Desaturated
				if (isDesaturated)
					if (body.className.indexOf(body_class_text_mode_desaturated) < 0)
						body.className += " " + body_class_text_mode_desaturated;

				// CSS: White Bg
				if (useWhiteBg)
					if (body.className.indexOf(body_class_text_mode_white_bg) < 0)
						body.className += " " + body_class_text_mode_white_bg;
			}
		}
	}
}

const reloadedAtQueryPattern = /reloadedAt=\d+/
const startQueryPattern = /\?.+/
function setupLoadability () {
	var forEach = Array.prototype.forEach;
	var imgs = document.getElementsByTagName('img');
	forEach.call(imgs, function (img) {
		img.onclick = function (event) {
			event.preventDefault()
			event.stopPropagation()

			const parser = document.createElement('a');
			parser.href = event.currentTarget.src

			if (reloadedAtQueryPattern.test(parser.search)) {
				event.currentTarget.src = event.currentTarget.src.replace(reloadedAtQueryPattern, `reloadedAt=${Date.now()}`)
			} else if (startQueryPattern.test(parser.search)) {
				event.currentTarget.src = event.currentTarget.src + `&reloadedAt=${Date.now()}`
			} else {
				event.currentTarget.src = event.currentTarget.src + `?reloadedAt=${Date.now()}`
			}
		}
	});

	var links = document.getElementsByTagName('a');
	forEach.call(links, function (link) {
		link.onclick = function (event) {
			const children = event.currentTarget.getElementsByTagName('*')
			const length = children.length
			for (let i = 0; i < length; ++ i) {
				const child = children[i]
				if (child.tagName === 'IMG') {
					const parser = document.createElement('a');
					parser.href = child.src

					if (reloadedAtQueryPattern.test(parser.search)) {
						return
					} else if (startQueryPattern.test(parser.search)) {
						child.src = child.src + `&reloadedAt=${Date.now()}`
						event.preventDefault()
						event.stopPropagation()
					} else {
						child.src = child.src + `?reloadedAt=${Date.now()}`
						event.preventDefault()
						event.stopPropagation()
					}
				}
			}
		}
	});
}

//------------------------------------------------
// Holder.js
//------------------------------------------------
function replaceHolderImgs()
{
	if(isEnabled 
		&&
		(replacementImageID === 0) )
	{
		var holderImg = "holder.js/%W%x%H%/";
		var holderTextImg = "holder.js/%W%x%H%/text:%T%";
		var holderBgImg = "url(?holder.js/%W%x%H%/) no-repeat";
		var imgs = document.getElementsByTagName('img');
		
		for (var i=0; i<imgs.length; i++) {

			var imgEl = imgs[i];
			var imgAlt = imgEl.alt;
			var styleW = imgEl.style.width?imgEl.style.width:imgEl.width;
			var styleH = imgEl.style.height?imgEl.style.height:imgEl.height;

			if (imgAlt) {
				// if (styleW && styleH){
					// imgEl.src = holderTextImg.split("%W%").join(styleW).split("%H%").join(styleH).split("%T%").join(imgAlt);
					// imgEl.style.backgroundImage = "";									
				// }
				// else {
					imgEl.src = "";
					imgEl.style.backgroundImage = holderBgImg.split("%W%").join(styleW).split("%H%").join(styleH);				
				// }
			}
			else {
				imgEl.src = holderImg.split("%W%").join(styleW).split("%H%").join(styleH);
				imgEl.style.backgroundImage = "";				
			}
		}
		Holder.run();		
	}
}

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
				// If it is something we want to redirect then set a data attribute so we know its already been changed
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

				event.srcElement.src = getBlankImg();
				event.srcElement.style.backgroundImage = "url('"+getBgImg()+"')";
		}
	}

	document.addEventListener('beforeload', doBeforeLoad, true);






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

