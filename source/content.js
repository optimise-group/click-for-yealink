const { findPhoneNumbersInText } = require('libphonenumber-js');

renderPhoneNumbers();

async function renderPhoneNumbers() {
  // Get all elements on a page
  const elements = document.body.getElementsByTagName('*');
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
        const originalTextLength = text.length;

        let nodeComponents = [text];

        if (numbers) {
          numbers.forEach((number) => {
            const lastArrayItem = nodeComponents.pop();
            const newTextLEngth = lastArrayItem.length;
            const textLengthDifference = originalTextLength - newTextLEngth;

            const newComponents = [];
            newComponents.push(lastArrayItem.substring(0, number.startsAt - textLengthDifference));
            newComponents.push(lastArrayItem.substring(number.startsAt - textLengthDifference, number.endsAt - textLengthDifference));
            newComponents.push(lastArrayItem.substring(number.endsAt - textLengthDifference));

            newComponents.forEach((newComponent) => nodeComponents.push(newComponent));
          });

          if (node.parentNode.nodeName !== 'A') {
            let parentNode = node.parentNode;

            nodeComponents.forEach((item, index) => {
              if (index === 0) {
                parentNode.replaceChild(document.createTextNode(item), node);
                return;
              }

              if (index % 2 == 0) {
                parentNode.appendChild(document.createTextNode(item));
                return;
              }

              const number = numbers.pop();

              // The parent isn't an anchor, and we should insert a new A-node into it
              let anchor = document.createElement('a');

              // We just created a new node, we should account for that in our loop
              elementalLength++;
              i++;

              anchor.setAttribute('href', `${clickConfiguration.http}://${clickConfiguration.username}:${encodeURIComponent(clickConfiguration.password)}@${clickConfiguration.address}/servlet?key=number=${encodeURIComponent(number.number.format('E.164'))}`);
              anchor.setAttribute('class', 'sippy-click-touched');
              anchor.setAttribute('target', '_blank');
              // The following line would insert an E.164-formatted number
              // anchor.appendChild(document.createTextNode(number.number.number));
              anchor.appendChild(document.createTextNode(item));

              parentNode.appendChild(anchor);
            });

            node.parentNode = parentNode;
          } else {
            if (!node.parentNode.href.includes('tel:') || numbers.length === 0) {
            } else {
              const number = numbers.pop();
              let anchor = node.parentNode;
  
              anchor.setAttribute('href', `${clickConfiguration.http}://${clickConfiguration.username}:${encodeURIComponent(clickConfiguration.password)}@${clickConfiguration.address}/servlet?key=number=${encodeURIComponent(number.number.format('E.164'))}`);
              anchor.setAttribute('class', 'sippy-click-touched');
              anchor.setAttribute('target', '_blank');

              nodeComponents = nodeComponents.filter((item) => item !== '');
  
              nodeComponents.forEach((item, index) => {
                anchor.replaceChild(document.createTextNode(item), anchor.childNodes[index]);
              });
  
              node.parentNode = anchor;
            }
          }
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