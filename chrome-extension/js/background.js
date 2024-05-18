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
//
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

    chrome.action.setIcon({ path: iconCurr });
  });
}

//------------------------------------------------
// Refresh TAB
//------------------------------------------------
function refreshTab(tabId) {
  chrome.tabs.reload(tabId);
}

//------------------------------------------------
// ENABLE / DISABLE Mode
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

// ————————————————————————————————————
// Listen to calls from tab.js
// Calls:
// 	- getMode()
//
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
        // ---
        config_img_bg_opacity: options.config_img_bg_opacity || 50,
        config_img_bg_use_stripes: options.config_img_bg_use_stripes || false,
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
// BLOCKING RULES
// Prevent loading of image and video assets
//------------------------------------------------
function setListeners() {
  getIsEnableAll((isEnabled) => {
    if (isEnabled) {
      applyBlockingRules();
    } else {
      removeBlockingRules();
    }
  });
}

function applyBlockingRules() {
  var imageReplacement = chrome.runtime.getURL("imgs/bg/bg_blank_1px.png");

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          // type: "block",
          type: "redirect",
          redirect: { url: imageReplacement },
        },
        condition: {
          urlFilter: "*",
          resourceTypes: [
            "image",
            "object",
            "media",
            //   "xmlhttprequest",
            //   "websocket",
            //   "other",
            //   "sub_frame",
          ],
        },
      },
    ],
    removeRuleIds: [1],
  });
}

function removeBlockingRules() {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
  });
}

setListeners();
updateUI();
