const { findPhoneNumbersInText } = require('libphonenumber-js');

renderPhoneNumbers();

async function renderPhoneNumbers() {
  // Get all elements on a page
  const elements = document.getElementsByTagName('*');
  let elementalLength = elements.length;

  const clickConfiguration = await getAllStorageSyncData();

  for (let i = 0; i < elementalLength; i++) {
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

          // Create the new anchor tag
          let anchor;

          if (node.parentNode.nodeName === 'A') {
            // If the parent is an anchor already, we replace the URL of the parent
            anchor = node.parentNode;

            anchor.setAttribute('href', `${clickConfiguration.http}://${clickConfiguration.username}:${encodeURIComponent(clickConfiguration.password)}@${clickConfiguration.address}/servlet?key=number=${encodeURIComponent(number.number.format('E.164'))}`);
            anchor.setAttribute('class', 'sippy-click-touched');
            anchor.setAttribute('target', '_blank');

            node.parentNode = anchor;
          } else {
            // The parent isn't an anchor, and we should insert a new A-node into it
            anchor = document.createElement('a');
          
            anchor.setAttribute('href', `${clickConfiguration.http}://${clickConfiguration.username}:${encodeURIComponent(clickConfiguration.password)}@${clickConfiguration.address}/servlet?key=number=${encodeURIComponent(number.number.format('E.164'))}`);
            anchor.setAttribute('class', 'sippy-click-touched');
            anchor.setAttribute('target', '_blank');
            // The following line would insert an E.164-formatted number
            // anchor.appendChild(document.createTextNode(number.number.number));
            anchor.appendChild(document.createTextNode(text.substring(number.startsAt, number.endsAt)));
          
            let parentNode = node.parentNode;
            parentNode.replaceChild(appendable, node);
            parentNode.insertBefore(anchor, appendable);
            parentNode.insertBefore(prependable, anchor);
          }
        });

        if (numbers.length > 0) {
          // Manually bump loop integer and elementalLength to accomodate for new nodes
          elementalLength += numbers.length;
          i++;
        }
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