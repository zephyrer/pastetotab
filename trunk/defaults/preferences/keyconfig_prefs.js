//JS functions for keyconfig extension
pref("keyconfig.main.xxx_key1_Paste & Go", "!][][][// Added by Paste to Tab and Go extension\n// https://addons.mozilla.org/addon/paste-to-tab-and-go/about\n\nif (gURLBar) {\n  gURLBar.select();\n  goDoCommand(\"cmd_paste\");\n  gURLBar.handleCommand();\n} else {\n  loadURI(readFromClipboard(), null, null, true);\n}\n][chrome://browser/content/browser.xul");
pref("keyconfig.main.xxx_key1_Paste & Search", "!][][][// Added by Paste to Tab and Go extension\n// https://addons.mozilla.org/addon/paste-to-tab-and-go/about\n\nvar searchBar = BrowserSearch.searchBar;\nif (searchBar) {\n  BrowserSearch.searchBar.select();\n  goDoCommand(\"cmd_paste\");\n  BrowserSearch.searchBar.handleSearchCommand();\n} else {\n  BrowserSearch.loadSearch(readFromClipboard())\n}\n][chrome://browser/content/browser.xul");
pref("keyconfig.main.xxx_key1_Paste to New Tab & Go", "!][][][// Added by Paste to Tab and Go extension\n// https://addons.mozilla.org/addon/paste-to-tab-and-go/about\n\nPasteToTab.go();\n][chrome://browser/content/browser.xul");
pref("keyconfig.main.xxx_key1_Paste to New Tab & Search", "!][][][// Added by Paste to Tab and Go extension\n// https://addons.mozilla.org/addon/paste-to-tab-and-go/about\n\nPasteToTab.search();\n][chrome://browser/content/browser.xul");