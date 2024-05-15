/*************************************************

	BG.js
	------
	This code is executed on the BACKGROUND
	It runs in the context of the extension (not the page)
	Is fired when the extension loads and it's always running

	Communication
		* Background.js <-> Options.js via chrome.storage.sync
		* Background.js <-> Tab.js via Message Passing 
		(http://developer.chrome.com/extensions/messaging.html)

*************************************************/

//————————————————————————————————————
// DUP
//	- background.js
//	- tab.js
//	- options.html
//————————————————————————————————————
const imageReplacementUrls = [
  // "imgs/bg/bg_blank_1px.png",
  // "imgs/bg/bg_yellow_1000px.png",
  "imgs/bg/bg_grey_90.png",
  "imgs/bg/bg_grey_75.png",
  "imgs/bg/bg_grey_50.png",
  "imgs/bg/bg_3.png",
  "imgs/bg/bg_4.png",
];
//————————————————————————————————————

function setDefaultOptions() {
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    if (!data.options) {
      options.enable_all = false;
      options.replacement_image = 1;
      options.is_desaturated = true;
      options.increase_contrast = false;
      options.use_white_bg = false;
      chrome.storage.sync.set({ options });
    }
  });
}

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  setDefaultOptions();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  setDefaultOptions();
});

//------------------------------------------------
// UI [T] Button
//------------------------------------------------

chrome.action.onClicked.addListener((tab) => {
  toggleIsEnableAll();
  updateUI();
  refreshTab(tab.id);
});

function updateUI() {
  getIsEnableAll((isEnabled) => {
    const iconCurr = isEnabled
      ? {
          16: chrome.runtime.getURL("imgs/icon/icon-ON@16px.png"),
          32: chrome.runtime.getURL("imgs/icon/icon-ON@32px.png"),
        }
      : {
          16: chrome.runtime.getURL("imgs/icon/icon-OFF@16px.png"),
          32: chrome.runtime.getURL("imgs/icon/icon-OFF@32px.png"),
        };

    // chrome.action.setIcon({ path: iconCurr }, () => {
    //   if (chrome.runtime.lastError) {
    //     console.error("Failed to set icon:", chrome.runtime.lastError.message);
    //   }
    // });
    chrome.action.setIcon({ path: iconCurr });
  });
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
function getIsEnableAll(callback) {
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    // console.log("getIsEnableAll");
    // console.log(options);
    // console.log(
    //   "options.enable_all => " +
    //     options.enable_all +
    //     "..." +
    //     typeof options.enable_all
    // );
    callback(options.enable_all === true);
  });
}

function setIsEnableAll(enable, callback) {
  //   console.log(">>> setIsEnableAll: " + enable + "..." + typeof enable);

  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    options.enable_all = enable;
    chrome.storage.sync.set({ options });

    callback(enable);
  });
}

function toggleIsEnableAll() {
  getIsEnableAll((isEnabled) => {
    setIsEnableAll(!isEnabled, (isEnabled) => {
      setListeners();
      updateUI();
    });
  });
}
//------------------------------------------------
// OPTIONS
//------------------------------------------------
function getIsDesaturated(callback) {
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    callback(options.is_desaturated === true);
  });
}
function getIncreaseContrast(callback) {
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    callback(options.increase_contrast === true);
  });
}
function getUseWhiteBg(callback) {
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    callback(options.use_white_bg === true);
  });
}

//------------------------------------------------
// Replacement Image
//------------------------------------------------
function getReplacementImageID(callback) {
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    const currImageReplacementDefault = 1;
    const currImageReplacementID =
      options.replacement_image || currImageReplacementDefault;
    callback(currImageReplacementID);
  });
}

function getReplacementImage(callback) {
  getReplacementImageID((currImageReplacementID) => {
    var currImageReplacement = chrome.runtime.getURL(
      imageReplacementUrls[currImageReplacementID]
      //   "imgs/bg/bg_" + currImageReplacementID + ".png"
    );
    callback(currImageReplacement);
  });
}

function getBlankReplacementImage(callback) {
  var imageReplacement = chrome.runtime.getURL("imgs/bg/bg_blank_1px.png");
  //   var imageReplacement = chrome.runtime.getURL("imgs/bg/bg_grey_1px.png");
  //   var imageReplacement = chrome.runtime.getURL("imgs/bg/bg_yellow_1000px.png");
  callback(imageReplacement);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.method === "getMode") {
    chrome.storage.sync.get("options", (data) => {
      const options = data.options || {};
      const response = {
        enableAll: options.enable_all === true,
        replacementImageID: options.replacement_image || 1,
        isDesaturated: options.is_desaturated === true,
        increaseContrast: options.increase_contrast === true,
        useWhiteBg: options.use_white_bg === true,
      };
      sendResponse(response);
    });
    return true; // Keeps the message channel open for sendResponse.
  }

  if (request.refresh === "true") {
    setListeners();
    updateUI();
  }
  return true;
});

//------------------------------------------------
// Avoid loading IMGs and OBJECTs
//------------------------------------------------

//------------------------------------------------
// Listeners
function setListeners() {
  console.log("setListeners");
  getIsEnableAll((isEnabled) => {
    if (isEnabled) {
      // Apply blocking rules when enableAll is true
      applyBlockingRules();
    } else {
      // Remove blocking rules when enableAll is false
      removeBlockingRules();
    }
  });
}

function applyBlockingRules() {
  console.log("applyBlockingRules");
  //   return;
  getReplacementImageID((imageID) => {
    getBlankReplacementImage((blankImageUrl) => {
      getReplacementImage((replacementImageUrl) => {
        chrome.declarativeNetRequest.updateDynamicRules({
          addRules: [
            {
              id: 1,
              priority: 1,
              action: {
                type: "redirect",
                redirect: { url: blankImageUrl },
                // redirect: { url: replacementImageUrl },
              },
              condition: { urlFilter: "*", resourceTypes: ["image"] },
            },
            // {
            //   id: 1,
            //   priority: 1,
            //   action: {
            //     type: "block",
            //   },
            //   condition: { urlFilter: "*", resourceTypes: ["image"] },
            // },
            {
              id: 2,
              priority: 1,
              action: {
                type: "redirect",
                redirect: { url: replacementImageUrl },
              },
              condition: { urlFilter: "*", resourceTypes: ["object"] },
            },
            {
              id: 3,
              priority: 1,
              action: {
                // type: "block",
                type: "redirect",
                redirect: { url: replacementImageUrl },
              },
              condition: {
                urlFilter: "*",
                resourceTypes: [
                  "media",
                  //   "xmlhttprequest",
                  //   "websocket",
                  //   "other",
                  //   "sub_frame",
                ],
              },
            },
          ],
          removeRuleIds: [1, 2, 3],
        });
      });
    });
  });
}

function removeBlockingRules() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1, 2, 3],
  });
}

setListeners();
updateUI();
