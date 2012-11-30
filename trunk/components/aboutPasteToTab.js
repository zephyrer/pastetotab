// https://developer.mozilla.org/En/Custom_about:_URLs#For_Firefox_4

const name = "pastetotab";
const desc = "Paste to Tab and Go";
const uuid = "{7a430414-917e-47d0-aa57-464e8d402acc}";
const chrm = "chrome://pastetotab/content/";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function AboutPasteToTab() {}

AboutPasteToTab.prototype = {
  classDescription: desc,
  contractID: "@mozilla.org/network/protocol/about;1?what=" + name,
  classID: Components.ID(uuid),
  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIAboutModule]),
  
  getURIFlags: function(aURI) {
    return Components.interfaces.nsIAboutModule.ALLOW_SCRIPT;
  },
  
  newChannel: function(aURI) {
    let ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    let channel = ios.newChannel(chrm, null, null);
    channel.originalURI = aURI;
    return channel;
  }
}

const NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutPasteToTab]);