const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

chrome.runtime.onInstalled.addListener((_reason) => {
  chrome.tabs.create({
    url: 'settings/options.html'
  });
});

chrome.contextMenus.create({
  'id': 'selection-call',
  'title': 'Call %s',
  'contexts': ['selection']
});

chrome.contextMenus.create({
  'id': 'link-call',
  'title': 'Call this phone number',
  'contexts': ['link']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'selection-call' || info.menuItemId === 'link-call') {
    let number = '';

    if (info.menuItemId === 'selection-call') {
      number = phoneUtil.format(phoneUtil.parse(info.selectionText, phoneUtil.getRegionCodeForNumber(phoneUtil.parseAndKeepRawInput(info.selectionText))), PNF.E164);
    } else if (info.menuItemId === 'link-call') {
      if (info.linkUrl.startsWith('tel:')) {
        number = info.linkUrl.substring(4);
      } else {
        number = info.linkUrl;
      }
    }

    chrome.storage.sync.get(['username', 'password', 'http', 'address'], (items) => {
      chrome.tabs.create({
        url: `${items.http}://${items.username}:${encodeURIComponent(items.password)}@${items.address}/servlet?key=number=${encodeURIComponent(number)}`,
        active: false
      }, (tab) => {
        setTimeout(() => chrome.tabs.remove(tab.id), 1000)
      });
    });
  }
});
