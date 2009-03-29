/*
  Version: MPL 1.1/GPL 2.0/LGPL 2.1

  The contents of this file are subject to the Mozilla Public License Version
  1.1 (the "License"); you may not use this file except in compliance with
  the License. You may obtain a copy of the License at
  http://www.mozilla.org/MPL/

  Software distributed under the License is distributed on an "AS IS" basis,
  WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
  for the specific language governing rights and limitations under the
  License.

  The Original Code is "Paste to Tab and Go" extension

  The Initial Developer of the Original Code is LouCypher.
  Portions created by the Initial Developer are Copyright (C) 2006
  the Initial Developer. All Rights Reserved.

  Contributor(s):
    LouCypher <me@loucypher.mp>

  Alternatively, the contents of this file may be used under the terms of
  either the GNU General Public License Version 2 or later (the "GPL"), or
  the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
  in which case the provisions of the GPL or the LGPL are applicable instead
  of those above. If you wish to allow use of your version of this file only
  under the terms of either the GPL or the LGPL, and not to allow others to
  use your version of this file under the terms of the MPL, indicate your
  decision by deleting the provisions above and replace them with the notice
  and other provisions required by the GPL or the LGPL. If you do not delete
  the provisions above, a recipient may use your version of this file under
  the terms of any one of the MPL, the GPL or the LGPL.
*/

var PasteToTab = {

  get tabbrowser() {
    return getBrowser();
  },

  get menuitem() {
    return document.getElementById("paste-to-tab-and-go");
  },

  get statusbar() {
    return document.getElementById("status-bar");
  },

  get statusbarText() {
    return document.getElementById("statusbar-display");
  },

  andGo: function pasteToTab_andGo(aTab, aEvent) {
    var string = readFromClipboard();
    if (!string) return;
    if (aEvent.ctrlKey || aEvent.metaKey) {
      this.tabbrowser.loadOneTab(string, null, null, null, null, true);
    } else {
      aTab.linkedBrowser.loadURI(string, null, null, true);
    }
  },

  checkForMiddleClick: function pasteToTab_checkForMiddleClick(aNode, aEvent) {
    if (aNode.getAttribute("disabled") == "true") return;
    var string = readFromClipboard();
    if (!string) return;
    if (aEvent.button == 1) {
      this.tabbrowser.loadOneTab(string, null, null, null, null, true);
    }
    closeMenus(aEvent.target);
  },

  mouseOver: function pasteToTab_mouseOver(aNode) {
    var text = readFromClipboard();
    if (this.statusbar.hidden) {
      aNode.setAttribute("tooltiptext", text);
    } else {
      this.statusbarText.label = text;
    }
  },

  mouseOut: function pasteToTab_mouseOut(aNode) {
    if (this.statusbar.hidden) {
      aNode.removeAttribute("tooltiptext");
    } else {
      this.statusbarText.label = "";
    }
  },

  initContext: function pasteToTab_initContext() {
    this.menuitem.setAttribute("disabled", !readFromClipboard()
                                           ? true : false);
  },

  init: function pasteToTab_init() {
    var tabContext = document.getAnonymousElementByAttribute(
                      this.tabbrowser, "anonid", "tabContextMenu");
    tabContext.insertBefore(this.menuitem, tabContext.firstChild);
    tabContext.addEventListener("popupshowing", function(e) {
      PasteToTab.initContext();
    }, false);
  }
}

window.addEventListener("load", function(e) {
  PasteToTab.init();
}, false);

