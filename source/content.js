const { findPhoneNumbersInText } = require('libphonenumber-js');

renderPhoneNumbers();

async function renderPhoneNumbers() {
  // Get all elements on a page
  let elements = document.getElementsByTagName('*');

  const clickConfiguration = await getAllStorageSyncData();

  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];

    for (let j = 0; j < element.childNodes.length; j++) {
      let node = element.childNodes[j];

      // Only act on text nodes
      if (node.nodeType === 3) {
        let text = node.nodeValue;

        const numbers = findPhoneNumbersInText(text);

        numbers.forEach((number) => {
          let prependable = document.createTextNode(text.substring(0, number.startsAt));
          let appendable = document.createTextNode(text.substring(number.endsAt));

          let anchor = document.createElement('a');
          
          anchor.setAttribute('href', `${clickConfiguration.http}://${clickConfiguration.username}:${encodeURIComponent(clickConfiguration.password)}@${clickConfiguration.address}/servlet?key=number=${encodeURIComponent(number.number.format('E.164'))}`);
          anchor.setAttribute('class', 'sippy-click-touched');
          anchor.setAttribute('target', '_blank');
          anchor.appendChild(document.createTextNode(number.number.number));
          
          let parentNode = node.parentNode;
          parentNode.replaceChild(appendable, node);
          parentNode.insertBefore(anchor, appendable);
          parentNode.insertBefore(prependable, anchor);
        });
      }
    }
  }
}

function getAllStorageSyncData() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(null, (items) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      resolve(items);
    });
  });
}