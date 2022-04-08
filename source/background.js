const { parsePhoneNumber, isValidNumber } = require('libphonenumber-js');

chrome.runtime.onInstalled.addListener((_reason) => {
  browser.tabs.create({
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

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  chrome.storage.sync.get(['username', 'password', 'enableTimeout', 'http', 'country', 'address'], (config) => {
    if (info.menuItemId === 'selection-call' || info.menuItemId === 'link-call') {
      let number = '';

      if (info.menuItemId === 'selection-call') {
        number = parsePhoneNumber(info.selectionText, config?.country || 'BE').format('E.164');

        confirm(number);
      } else if (info.menuItemId === 'link-call') {
        if (info.linkUrl.startsWith('tel:')) {
          number = info.linkUrl.substring(4);
        } else if (info.linkUrl.includes('servlet?key=number=')) {
          number = decodeURIComponent(info.linkUrl.substring(info.linkUrl.indexOf('servlet?key=number=') + 'servlet?key=number='.length));
        } else {
          number = info.linkUrl;
        }
      }

      let isValid = true;

      if (!isValidNumber(number)) {
        isValid = confirm(`The phone number (${number}) you selected isn't a valid number. Would you like to call it anyway?`);
      }

      if (isValid) {
        browser.tabs.create({
          url: `${config.http}://${config.username}:${encodeURIComponent(config.password)}@${config.address}/servlet?key=number=${encodeURIComponent(number)}`,
          active: false
        }, (tab) => {
          if (config.enableTimeout) {
            setTimeout(() => browser.tabs.remove(tab.id), 1000);
          }
        });
      }
    }
  });
});
