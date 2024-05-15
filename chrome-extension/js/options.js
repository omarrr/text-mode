// In-page cache of the user's options
const options = {};
const optionsForm = document.getElementById("optionsForm");

// Immediately persist options changes
const imageReplacementInputs = optionsForm.querySelectorAll(
  'input[name="imageReplacement"]'
);
imageReplacementInputs.forEach((input) => {
  input.addEventListener("change", handleImageReplacementClick);
});

// ——————————————————
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

// ——————————————————
// Initialize the form with the user's option settings
chrome.storage.sync.get("options", (data) => {
  Object.assign(options, data.options);
  imageReplacementInputs.forEach((input) => {
    console.log(">>>>>");
    console.log("  input.value: " + input.value);
    console.log("  options.replacement_image: " + options.replacement_image);

    if (parseInt(input.value) === parseInt(options.replacement_image)) {
      input.checked = true;
      input.parentElement.classList.add("selected");
    }
  });
  optionsForm.desat.checked = Boolean(options.is_desaturated);
  optionsForm.increaseContrast.checked = Boolean(options.increase_contrast);
  optionsForm.whiteBg.checked = Boolean(options.use_white_bg);
});

function handleImageReplacementClick(event) {
  options.replacement_image = event.target.value;
  chrome.storage.sync.set({ options });

  // Add "selected" class to the selected li and remove from others
  imageReplacementInputs.forEach((input) => {
    input.parentElement.classList.toggle("selected", input.checked);
  });
}
