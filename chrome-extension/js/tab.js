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
        //---
        config_img_bg_opacity = response.config_img_bg_opacity;
        config_img_bg_use_stripes = response.config_img_bg_use_stripes;

        setBodyClasses();
      }
      resolve();
    });
  });
}

getMode();

document.addEventListener("DOMContentLoaded", () => {
  injectCustomCSS();
  setBodyClasses();
  replaceBase64Images();
  replaceVideos();

  observeDOMChanges();
});

chrome.runtime.sendMessage({ method: "getMode", refresh: true }).then(getMode);

// ————————————————————————————————————
// Images + Videos
//
const blankImg = chrome.runtime.getURL("imgs/bg/bg_blank_1px.png");
// function getBlankImg() {
//   if (chrome.runtime?.id) {
//     return chrome.runtime.getURL("imgs/bg/bg_blank_1px.png");
//   }

//   return "";
// }
function replaceBase64Images() {
  if (isEnabled) {
    const imgs = document.querySelectorAll('img[src^="data:image/"]');
    // const blankImg = getBlankImg();
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
    // const blankImg = getBlankImg();
    imgs.forEach((img) => {
      image.src = blankImg;
    });
  }
}
function replaceVideos() {
  if (isEnabled) {
    const videos = document.querySelectorAll("video");
    // const blankImg = getBlankImg();
    videos.forEach((video) => {
      video.pause();
      video.src = "";
      video.poster = blankImg; // Optionally set a blank image as the poster
    });
  }
}

// ————————————————————————————————————
// Listen for dynamic content
//
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    console.log("MutationObserver");
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
// Custom CSS background ////
//
function injectCustomCSS() {
  // Find all elements with background-image
  const allElements = document.querySelectorAll("*");
  allElements.forEach((el) => {
    const style = window.getComputedStyle(el);
    if (style.backgroundImage !== "none") {
      el.classList.add("__text_mode_custom_bg__"); // Append custom class
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
function setBodyClasses() {
  const body = document.querySelector("body");
  if (!body) return;

  body.classList.add("__text_mode_READY__");

  if (isEnabled) {
    body.classList.add("__text_mode_ENABLED__");
    body.classList.add(`__text_mode_img_${replacementImageID}__`);
    if (isDesaturated) body.classList.add("__text_mode_desaturated__");
    if (increaseContrast) body.classList.add("__text_mode_increase_contrast__");
    if (useWhiteBg) body.classList.add("__text_mode_white_bg__");

    body.classList.add(`__text_mode_fg_${config_img_bg_opacity}__`);
    if (config_img_bg_use_stripes) body.classList.add("__text_mode_stripes__");
    else body.classList.add("__text_mode_solid__");

    replaceBase64Images();
    replaceVideos(); // Add this line
  }
}
