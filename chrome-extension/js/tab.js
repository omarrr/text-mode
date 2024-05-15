/*************************************************

	TAB.js
	------
	This code is executed on the TAB
	Runs on the Page context
	Is fired with each page refresh

	Communication
		* Background.js <-> Tab.js via Message Passing (http://developer.chrome.com/extensions/messaging.html)

*************************************************/

//————————————————————————————————————
// DUP
//	- background.js
//	- tab.js
//	- options.html
//————————————————————————————————————
const imageReplacementUrls = [
  // "imgs/bg/bg_blank_1px.png",
  //   "imgs/bg/bg_yellow_1000px.png",
  "imgs/bg/bg_grey_90.png",
  "imgs/bg/bg_grey_75.png",
  "imgs/bg/bg_grey_50.png",
  //   "imgs/bg/bg_1.png",
  //   "imgs/bg/bg_2.png",
  "imgs/bg/bg_3.png",
  "imgs/bg/bg_4.png",
];
//————————————————————————————————————

// Get Preferences from the Extension

let isEnabled = false;
let replacementImageID = 0;
let isDesaturated = false;
let useWhiteBg = false;

function getMode() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ method: "getMode" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("response", response);
        isEnabled = response.enableAll;
        replacementImageID = parseInt(response.replacementImageID);
        isDesaturated = response.isDesaturated;
        increaseContrast = response.increaseContrast;
        useWhiteBg = response.useWhiteBg;
        setBodyType();
      }
      resolve();
    });
  });
}

getMode();

document.addEventListener("DOMContentLoaded", () => {
  injectCustomCSS();
  setBodyType();
  replaceHolderImgs();
  replaceBase64Images();
  replaceVideos();

  observeDOMChanges();
});

chrome.runtime.sendMessage({ method: "getMode", refresh: true }).then(getMode);

//Images
function getBlankImg() {
  return chrome.runtime.getURL("imgs/bg/bg_blank_1px.png");
}

function getBgImg() {
  const imgUrl = `imgs/bg/bg_${replacementImageID}.png`;
  return chrome.runtime.getURL(imgUrl);
}

// // Get BODY tag
// document.addEventListener("DOMContentLoaded", () => {
//   setBodyType();
//   replaceHolderImgs();
//   replaceBase64Images();
//   replaceVideos();
// });

function replaceBase64Images() {
  if (isEnabled) {
    const imgs = document.querySelectorAll('img[src^="data:image/"]');
    const blankImg = getBlankImg();
    imgs.forEach((img) => {
      img.src = blankImg;
    });
    replaceBase64ImagesInSVGs();
  }
}
function replaceBase64ImagesInSVGs() {
  if (isEnabled) {
    const imgs = document.querySelectorAll(
      'svg image[href^="data:image/"], svg image[xlink\\:href^="data:image/"]'
    );
    const blankImg = getBlankImg();
    imgs.forEach((img) => {
      image.src = blankImg;
    });
  }
}

function replaceVideos() {
  if (isEnabled) {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      video.pause();
      video.src = "";
      video.poster = getBlankImg(); // Optionally set a blank image as the poster
    });
  }
}

// ————————————————————————————————————

function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    let needUpdate = false;
    mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check for Element node
            needUpdate = true;
          }
        });
      }
    });
    if (needUpdate) {
      replaceHolderImgs();
      replaceBase64Images();
      replaceVideos();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ————————————————————————————————————
// @#TODO REMOVE
function injectCustomCSS__DELETE_ME() {
  const style = document.createElement("style");
  let cssText = "";

  imageReplacementUrls.forEach((url, index) => {
    cssText += `
	.__text_mode_img_${index}__ img,
	.__text_mode_img_${index}__ svg,
	.__text_mode_img_${index}__ canvas,
		.__text_mode_img_${index}__ video,
		.__text_mode_img_${index}__ object,
		.__text_mode_img_${index}__ iframe,
		.__text_mode_img_${index}__ embed,
		.__text_mode_img_${index}__ applet
		{
		  content: url('${chrome.runtime.getURL("imgs/bg/bg_blank_1px.png")}');
		  background-image: url('${chrome.runtime.getURL(url)}') !important;
		  background-repeat: repeat !important;
		  background-size: unset !important;
		}
	  `;
  });

  style.textContent = cssText;
  document.head.appendChild(style);
}

function injectCustomCSS() {
  //   // Define the custom class properties
  //   const style = document.createElement("style");
  //   document.head.appendChild(style);
  //   style.sheet.insertRule(
  //     `
  // 	  .custom-background-class {
  // 		border: 2px solid red; /* Example style */
  // 	  }
  // 	`,
  //     style.sheet.cssRules.length
  //   );

  // Find all elements with background-image
  const allElements = document.querySelectorAll("*");
  allElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.backgroundImage !== "none") {
      el.classList.add("custom-background-class"); // Append custom class
    }
  });
}

// document.addEventListener("DOMContentLoaded", injectCustomCSS);

//------------------------------------------------
// Set BODY type (plain_text?)
// Requires both:
//	- settings from the Extension (sendMessage)
//	- <BODY> tag to be ready
//------------------------------------------------
function setBodyType() {
  const body = document.querySelector("body");
  if (!body) return;

  body.classList.add("__plain_text_READY__");

  if (isEnabled) {
    body.classList.add("__plain_text__");
    body.classList.add(`__text_mode_img_${replacementImageID}__`);
    if (isDesaturated) body.classList.add("__text_mode_desaturated__");
    if (increaseContrast) body.classList.add("__text_mode_increase_contrast__");
    if (useWhiteBg) body.classList.add("__text_mode_white_bg__");

    replaceBase64Images();
    replaceVideos(); // Add this line
  }
}

//------------------------------------------------
// Holder.js
//------------------------------------------------
function replaceHolderImgs() {
  if (isEnabled && replacementImageID === 0) {
    // const holderImg = chrome.runtime.getURL("js/vendor/holder.js/%W%x%H%/");
    const holderImg = "holder.js/%W%x%H%/";
    const imgs = document.querySelectorAll("img");
    imgs.forEach((imgEl) => {
      const styleW = imgEl.style.width || imgEl.width;
      const styleH = imgEl.style.height || imgEl.height;
      imgEl.src = holderImg.replace("%W%", styleW).replace("%H%", styleH);
      imgEl.style.backgroundImage = "";
    });
  }
}

/* 
//------------------------------------------------
// BLOCK IFRAMES
// Unless they come from this domain
// Might be some needed script
// GMAIL breaks if we block iFrames
//------------------------------------------------

function urlBelongsToThisSite(assetUrl) {
  var currHost = parseUri(window.location).host;
  var assetHost = parseUri(assetUrl).host;

  return currHost === assetHost;
}

// Use HTML5 dataset to store edits
// Namespace our keys to avoid conflicts
var dataset_redirected_key = "__plain_text_redirected__";

// Don't load any IFRAME unless it's from this same domain
function doBeforeLoad(event) {
  // Use HTML5 dataset to store edits
  if (
    isEnabled &&
    !event.srcElement.dataset["redirected"] &&
    event.srcElement.tagName == "IFRAME" &&
    urlBelongsToThisSite(event.srcElement.src)
  ) {
    // If it is something we want to redirect then set a data attribute so we know its already been changed
    // Set that attribute to it original src in case we need to know what it was later
    event.srcElement.dataset["redirected"] = event.srcElement.src;
    // Set the source to the new url you want the element to point to
    // event.srcElement.src = "replacement.png";

    event.srcElement.src = getBlankImg();
    event.srcElement.style.backgroundImage = "url('" + getBgImg() + "')";
  }
}

document.addEventListener("beforeload", doBeforeLoad, true);
*/
