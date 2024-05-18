// ————————————————————————————————————
// CONFIG OPTIONS
// ————————————————————————————————————
// In-page cache of the user's options
// ————————————————————————————————————
let options = {};
function getOptions(callback) {
  chrome.storage.sync.get("options", (data) => {
    Object.assign(options, data.options);

    callback();
  });
}

// ————————————————————————————————————
// DOM ELEMENTS
// ————————————————————————————————————
const optionsForm = document.getElementById("optionsForm");
const imageReplacementInputs = optionsForm.querySelectorAll(
  'input[name="imageReplacement"]'
);

// ————————————————————————————————————
// LOAD INITIAL OPTIONS
// ————————————————————————————————————
// Initialize the form with the user's option settings
// ————————————————————————————————————
getOptions(() => {
  optionsForm.adjust_saturation_el.checked = Boolean(
    options.config_adjust_saturation
  );
  optionsForm.config_adjust_contrast_el.checked = Boolean(
    options.config_adjust_contrast
  );
  optionsForm.adjust_white_bg_el.checked = Boolean(
    options.config_adjust_white_bg
  );
  imageReplacementInputs.forEach((input) => {
    // console.log(">>>>>");
    // console.log("  input.value: " + input.value);
    // console.log("  options.config_img_bg_type: " + options.config_img_bg_type);

    if (input.value === options.config_img_bg_type) {
      input.checked = true;
      input.parentElement.classList.add("selected");
    }
  });
  setHeadClasses();
});
// ————————————————————————————————————
// EVENT LISTENERS - SAVE OPTIONS
// ————————————————————————————————————
// Immediately persist options changes
// ————————————————————————————————————
optionsForm.adjust_saturation_el.addEventListener("change", (event) => {
  options.config_adjust_saturation = event.target.checked;
  chrome.storage.sync.set({ options });

  setHeadClasses();
});
optionsForm.config_adjust_contrast_el.addEventListener("change", (event) => {
  options.config_adjust_contrast = event.target.checked;
  chrome.storage.sync.set({ options });

  setHeadClasses();
});
optionsForm.adjust_white_bg_el.addEventListener("change", (event) => {
  options.config_adjust_white_bg = event.target.checked;
  chrome.storage.sync.set({ options });

  setHeadClasses();
});
// ————————————————————————————————————
imageReplacementInputs.forEach((input) => {
  input.addEventListener("change", handleImageReplacementClick);
});
// ————————————————————————————————————
// IMAGE REPLACEMENT MODES
// ————————————————————————————————————
function handleImageReplacementClick(event) {
  getOptions(() => {
    let val = event.target.value; // eg. stripes-70
    let img_bg_use_stripes = val.indexOf("stripes") >= 0;
    let img_bg_opacity = parseInt(val.split("-")[1]);
    // let img_bg_opacity = parseInt(val.split("-")[1]) / 100; // Converts "70" to 0.7 or "50" to 0.5

    options.config_img_bg_type = event.target.value;
    options.config_img_bg_use_stripes = img_bg_use_stripes;
    options.config_img_bg_opacity = img_bg_opacity;

    // console.log(options);

    chrome.storage.sync.set({ options });

    // Add "selected" class to the selected li and remove from others
    imageReplacementInputs.forEach((input) => {
      input.parentElement.classList.toggle("selected", input.checked);
    });

    setHeadClasses();
  });
}

//------------------------------------------------
// Set HEAD classes
//------------------------------------------------
// (See also setBodyClasses in tqb.js)
//------------------------------------------------
function setHeadClasses() {
  const icon_right = document.querySelector("#icon_right");

  if (!icon_right) return;

  icon_right.className = "";

  icon_right.classList.add("__text_mode_READY__");
  icon_right.classList.add("__text_mode_ENABLED__");
  if (options.config_adjust_saturation)
    icon_right.classList.add("__text_mode_desaturated__");
  if (options.config_adjust_contrast)
    icon_right.classList.add("__text_mode_increase_contrast__");
  if (options.config_adjust_white_bg)
    icon_right.classList.add("__text_mode_white_bg__");

  icon_right.classList.add(`__text_mode_fg_${options.config_img_bg_opacity}__`);
  if (options.config_img_bg_use_stripes)
    icon_right.classList.add("__text_mode_stripes__");
  else icon_right.classList.add("__text_mode_solid__");
}
