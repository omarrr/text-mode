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
// OPTIONS (AKA Config)
//————————————————————————————————————

let options;

function setDefaultOptions() {
  // Very first session ever running the extensions by the user
  options.enable_all = false;

  options.config_adjust_saturation = true;
  options.config_adjust_contrast = false;
  options.config_adjust_white_bg = false;

  options.config_img_bg_type = "stripes-50";
  options.config_img_bg_use_stripes = true;
  options.config_img_bg_opacity = 50;

  chrome.storage.sync.set({ options });
}
function loadOptions(callback) {
  console.log("loadOptions");
  //   if (options && callback) {
  //     callback();
  //     return;
  //   }
  chrome.storage.sync.get("options", (data) => {
    // const options = data.options || {};
    options = data.options || {};
    if (!data.options) {
      setDefaultOptions();
    }
    if (callback) callback();

    console.log(options);
  });
}

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  //   loadOptions();
  loadOptions(() => {
    setListeners();
    updateUI();
  });
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  //   loadOptions();
  loadOptions(() => {
    setListeners();
    updateUI();
  });
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
// function getIsEnableAll(callback) {
//   callback(options.enable_all === true);
// }
function setIsEnableAll(enable, callback) {
  //   console.log(">>> setIsEnableAll: " + enable + "..." + typeof enable);
  chrome.storage.sync.get("options", (data) => {
    const options = data.options || {};
    options.enable_all = enable;
    chrome.storage.sync.set({ options });

    callback(enable);
  });
}
// function setIsEnableAll(enable, callback) {
//   //   console.log(">>> setIsEnableAll: " + enable + "..." + typeof enable);
//   options.enable_all = enable;
//   chrome.storage.sync.set({ options });

//   callback(enable);
// }

function toggleIsEnableAll() {
  getIsEnableAll((isEnabled) => {
    setIsEnableAll(!isEnabled, (isEnabled) => {
      setListeners();
      updateUI();
    });
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
        config_adjust_saturation: options.config_adjust_saturation === true,
        config_adjust_contrast: options.config_adjust_contrast === true,
        config_adjust_white_bg: options.config_adjust_white_bg === true,
        // ---
        config_img_bg_type: options.config_img_bg_type || 1,
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

const imageReplacement = chrome.runtime.getURL("imgs/bg/bg_blank_1px.png");
function applyBlockingRules() {
  console.log("applyBlockingRules");

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
            //   "xmlhttprequest","websocket","other","sub_frame",
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

// ————————————————————————————————————

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (let key in changes) {
    let storageChange = changes[key];
    // console.log(
    //   'Storage key "%s" in namespace "%s" changed. Old value was "%s", new value is "%s".',
    //   key, namespace, storageChange.oldValue, storageChange.newValue
    // );
    // Update your options configuration here based on the new value
    if (key === "options") {
      updateConfiguration(storageChange.newValue);
    }
  }
});

function updateConfiguration(newOptions) {
  // Apply the new configuration settings from newOptions
  console.log("Options updated to:", newOptions);
}

// ————————————————————————————————————
// setListeners();
// updateUI();

loadOptions(() => {
  setListeners();
  updateUI();
});
