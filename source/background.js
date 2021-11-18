chrome.runtime.onInstalled.addListener((_reason) => {
  chrome.tabs.create({
    url: 'settings/options.html'
  });
});

chrome.contextMenus.create({
  'id': 'start-call',
  'title': 'Call %s',
  'contexts': ['link', 'selection']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'start-call') {
    let number = '';

    if (info.selectionText) {
      number = info.selectionText;
    } else if (info.linkUrl) {
      if (info.linkUrl.startsWith('tel:')) {
        number = info.linkUrl.substring(4);
      } else {
        number = info.linkUrl;
      }
    }

    chrome.storage.sync.get(['username', 'password', 'http', 'address'], function (items) {
      chrome.tabs.create({
        url: `${items.http}://${items.username}:${encodeURIComponent(items.password)}@${items.address}/servlet?key=number=${encodeURIComponent(number)}`
      });
    });
  }
});