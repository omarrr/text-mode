

\\ NOT IN USE \\

/*************************************************

	POPUP.js
	------
	This code is executed on the POPUP
	It runs in the context of the extension (not the page)
	Is fired when the extension is clicked if
		it's called in the manifest.json

			"browser_action": {
				"default_popup": "html/popup.html"
			}

*************************************************/

//------------------------------------------------
// SETTINGS
//------------------------------------------------
// Saves options to localStorage.
function write_settings() {

  var enableAll = document.getElementById("all_field").checked? "true": "false";
	isEnabled = enableAll;

  localStorage["enable_all"] = isEnabled;

  update();
}

// Restores select box state to saved value from localStorage.
function read_settings() {
	var enableAll = localStorage["enable_all"] === "true";
		isEnabled = enableAll;

	document.getElementById("all_field").checked = isEnabled;

	update();
}

//------------------------------------------------
// UPDATE
//------------------------------------------------
// Update the UI
var isEnabled = false;
function update() {
	var enableAll = localStorage["enable_all"] === "true";

	isEnabled = enableAll;

	update_popup();
	update_UI();
}

function update_popup() {
	// Update status to let user know options were saved.
	var statusON = document.getElementById("onMode");
		statusON.style.display = isEnabled ? "block" : "none";
	var statusOFF = document.getElementById("offMode");
		statusOFF.style.display = isEnabled ? "none" : "block";

}
var iconOn = "../imgs/iconOn.png";
var iconOff = "../imgs/iconOff.png";
function update_UI() {
	var iconCurr = isEnabled ? iconOn : iconOff;
	chrome.browserAction.setIcon({path:iconCurr});
}

//------------------------------------------------
// INIT - DOC READY
//------------------------------------------------

// onLoad Function needs to be defined this way on Chrome Extensions "because of Content-Security-Policy."
document.addEventListener('DOMContentLoaded', function () {

	var inputs = document.getElementsByTagName("input");
	for (i = 0; i < inputs.length; i++) {
		// update settings onChange
		inputs[i].addEventListener('change', write_settings);
	}

	read_settings();

});
