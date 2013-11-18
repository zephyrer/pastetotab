/*
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 *  Contributor(s):
 *  - LouCypher (original code)
 */

// Load utilityOverlay.js that has openLinkIn function
function load() {
  var chromeDir = "";
  switch (Application.id) {
    case "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": // Firefox
      chromeDir = "browser";
      break;
    case "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": // SeaMonkey 
      chromeDir = "communicator";
  }
  var baseDir = "chrome://" + chromeDir + "/content/";
  Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
            .getService(Components.interfaces.mozIJSSubScriptLoader)
            .loadSubScript(baseDir + "utilityOverlay.js");
}

function contribute() {
  var mainWin = Services.wm.getMostRecentWindow("navigator:browser");
  if (mainWin) {
    mainWin.PasteToTab.contribute();
    return;
  }
  var url = Services.urlFormatter.formatURL(Services.prefs.getCharPref(
            "extensions.pastetotab.contributionURL"));
  openLinkIn(url, "window", {}); // Requires utilityOverlay.js
}
