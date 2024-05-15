Text Mode
==========

Text Mode is a Chrome extension that allows to browse the web without distractions via clean simple text based pages.

![Text Mode](https://raw.github.com/omarrr/text-mode/master/assets/icons/icon_128x128.png)

Text Mode declutters the web by loading all pages in text form (no images, animation or video) so content is easier to scan and read.

* View text only pages
* Images, Video, flash, are never loaded
* Color-free pages are easier on the eye
* Reduce pages load
* One-click easy access
* Removes 99% of the ads with no extra software

![Screenshot](https://raw.github.com/omarrr/text-mode/master/assets/screenshots/screenshot_04.jpg)

## Chrome web store

[Text Mode](https://chrome.google.com/webstore/detail/adelhekhakakocomdfejiipdnaadiiib/) is available at the Chrome web store.

## Resources

* Chrome Extensions
    * [Chrome Extensions](http://developer.chrome.com/extensions/getstarted.html)
    * [Debugging Chrome Extensions](http://developer.chrome.com/extensions/tut_debugging.html)
    * [Chrome Content Scripts](http://developer.chrome.com/extensions/content_scripts.html)
    * [Chrome Tabs](http://developer.chrome.com/extensions/tabs.html)
    * [Chrome's webRequest](http://developer.chrome.com/extensions/webRequest.html)
    * [Chrome's Message Passing](http://developer.chrome.com/extensions/messaging.html)

* Other
    * [dataset API](http://davidwalsh.name/element-dataset)
    * [beforeload event listener](http://stackoverflow.com/questions/11837944/change-a-img-src-in-chrome-extension-before-the-image-has-loaded)
    * [Image to Base64 Converter](http://webcodertools.com/imagetobase64converter/Create)
    * [parseUri](http://stevenlevithan.com/demo/parseuri/js/) Split URLs in JavaScript
    * [Holder.js](http://imsky.github.io/holder/) image placeholders entirely on the client side

## Development process

* Development
    * Disable production version of TextMode if enabled from the Chrome Store
    * Edit files locally
    * Update version # in 'manifest.json'
* Local test
    * Visit locally 'chrome://extensions/'
    * Turn on `Developer mode` on the top right
    * Click `Load unpacked extension`
    * Select the 'chrome-extension' dev folder
    * Reload extension with every code update via 'Reload (⌘R)'
* Deployment to Chrome Store
    * ZIP the 'chrome-extension' folder
    * Upload to the developer dashboard: [https://chrome.google.com/webstore/developer/dashboard](https://chrome.google.com/webstore/developer/dashboard)
    * More details at [Publishing Your App](https://developers.google.com/chrome/web-store/docs/publish)
