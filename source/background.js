const { parsePhoneNumber, isValidNumber } = require('libphonenumber-js');

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
      number = parsePhoneNumber(info.selectionText, 'BE').format('E.164');
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
      chrome.storage.sync.get(['username', 'password', 'http', 'address'], (items) => {
        chrome.tabs.create({
          url: `${items.http}://${items.username}:${encodeURIComponent(items.password)}@${items.address}/servlet?key=number=${encodeURIComponent(number)}`,
          active: false
        }, (tab) => {
          setTimeout(() => chrome.tabs.remove(tab.id), 1000)
        });
      });
    }
  }
});
