/*
    Version: MPL 1.1/GPL 2.0/LGPL 2.1

    The contents of this file are subject to the Mozilla Public License
    Version 1.1 (the "License"); you may not use this file except in
    compliance with the License. You may obtain a copy of the License
    at http://www.mozilla.org/MPL/1.1/

    Software distributed under the License is distributed on an
    "AS IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
    See the License for the specific language governing rights and
    limitations under the License.

    The Original Code is "Paste to Tab and Go" extension

    The Initial Developer of the Original Code is LouCypher.
    Portions created by the Initial Developer are Copyright (C) 2012
    the Initial Developer. All Rights Reserved.

    Contributor(s):
    - LouCypher <zoolcar9@gmail.com>

    Alternatively, the contents of this file may be used under the terms
    of either the GNU General Public License Version 2 or later (the "GPL"),
    or the GNU Lesser General Public License Version 2.1 or later
    (the "LGPL"), in which case the provisions of the GPL or the LGPL are
    applicable instead of those above. If you wish to allow use of your
    version of this file only under the terms of either the GPL or the LGPL,
    and not to allow others to use your version of this file under the terms
    of the MPL, indicate your decision by deleting the provisions above and
    replace them with the notice and other provisions required by the GPL or
    the LGPL. If you do not delete the provisions above, a recipient may use
    your version of this file under the terms of any one of the MPL, the GPL
    or the LGPL.
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