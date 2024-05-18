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
    // console.log("  options.replacement_image: " + options.replacement_image);

    if (input.value === options.replacement_image) {
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

  options.replacement_image = event.target.value;
  options.config_img_bg_use_stripes = img_bg_use_stripes;
  options.config_img_bg_opacity = img_bg_opacity;

  console.log(options);

  chrome.storage.sync.set({ options });

  // Add "selected" class to the selected li and remove from others
  imageReplacementInputs.forEach((input) => {
    input.parentElement.classList.toggle("selected", input.checked);
  });
}
