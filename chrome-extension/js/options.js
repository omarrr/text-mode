// ————————————————————————————————————
// CONFIG OPTIONS
// ————————————————————————————————————
// In-page cache of the user's options
// ————————————————————————————————————
let options = {};
const optionsForm = document.getElementById("optionsForm");

// ————————————————————————————————————
// LOAD INITIAL OPTIONS
// ————————————————————————————————————
// Initialize the form with the user's option settings
// ————————————————————————————————————
chrome.storage.sync.get("options", (data) => {
  Object.assign(options, data.options);
  imageReplacementInputs.forEach((input) => {
    // console.log(">>>>>");
    // console.log("  input.value: " + input.value);
    // console.log("  options.config_img_bg_type: " + options.config_img_bg_type);

    if (input.value === options.config_img_bg_type) {
      input.checked = true;
      input.parentElement.classList.add("selected");
    }
  });
  optionsForm.desat.checked = Boolean(options.is_desaturated);
  optionsForm.increaseContrast.checked = Boolean(options.increase_contrast);
  optionsForm.whiteBg.checked = Boolean(options.use_white_bg);
});

// ————————————————————————————————————
// EVENT LISTENERS - SAVE OPTIONS
// ————————————————————————————————————
// Immediately persist options changes
// ————————————————————————————————————
optionsForm.desat.addEventListener("change", (event) => {
  options.is_desaturated = event.target.checked;
  chrome.storage.sync.set({ options });
});
optionsForm.increaseContrast.addEventListener("change", (event) => {
  options.increase_contrast = event.target.checked;
  chrome.storage.sync.set({ options });
});
optionsForm.whiteBg.addEventListener("change", (event) => {
  options.use_white_bg = event.target.checked;
  chrome.storage.sync.set({ options });
});
// ————————————————————————————————————
const imageReplacementInputs = optionsForm.querySelectorAll(
  'input[name="imageReplacement"]'
);
imageReplacementInputs.forEach((input) => {
  console.log("imageReplacementInputs.forEach");
  input.addEventListener("change", handleImageReplacementClick);
});
// ————————————————————————————————————
function handleImageReplacementClick(event) {
  console.log("handleImageReplacementClick");

  let val = event.target.value; // eg. stripes-70
  let img_bg_use_stripes = val.indexOf("stripes") >= 0;
  let img_bg_opacity = parseInt(val.split("-")[1]);
  // let img_bg_opacity = parseInt(val.split("-")[1]) / 100; // Converts "70" to 0.7 or "50" to 0.5

  options.config_img_bg_type = event.target.value;
  options.config_img_bg_use_stripes = img_bg_use_stripes;
  options.config_img_bg_opacity = img_bg_opacity;

  console.log(options);

  chrome.storage.sync.set({ options });

  // Add "selected" class to the selected li and remove from others
  imageReplacementInputs.forEach((input) => {
    input.parentElement.classList.toggle("selected", input.checked);
  });

  setHeadClasses();
}

//------------------------------------------------
// Set HEAD classes
// (See also setBodyClasses in tqb.js)
//------------------------------------------------
function setHeadClasses() {
  const head = document.querySelector("#head");
  if (!head) return;

  head.className = "";

  head.classList.add("__text_mode_READY__");
  head.classList.add("__text_mode_ENABLED__");
  if (options.is_desaturated) head.classList.add("__text_mode_desaturated__");
  if (options.increase_contrast)
    head.classList.add("__text_mode_increase_contrast__");
  if (options.use_white_bg) head.classList.add("__text_mode_white_bg__");

  head.classList.add(`__text_mode_fg_${options.config_img_bg_opacity}__`);
  if (options.config_img_bg_use_stripes)
    head.classList.add("__text_mode_stripes__");
  else head.classList.add("__text_mode_solid__");
}
