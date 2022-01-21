const { findPhoneNumbersInText, isValidPhoneNumber } = require('libphonenumber-js');

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
        if (node.parentNode.nodeName === 'BUTTON' || node.parentNode.nodeName === 'TEXTAREA' || node.parentNode.nodeName === 'OPTION' || node.parentNode.nodeName === 'LABEL') {
          continue;
        }
        
        let text = node.nodeValue;

        const numbers = findPhoneNumbersInText(text);
        const originalTextLength = text.length;

        let nodeComponents = [text];

        if (numbers.length >= 1) {
          numbers.forEach((number) => {
            const lastArrayItem = nodeComponents.pop();
            const newTextLEngth = lastArrayItem.length;
            const textLengthDifference = originalTextLength - newTextLEngth;

            const newComponents = [];

            if (number.startsAt !== 0) {
              newComponents.push(lastArrayItem.substring(0, number.startsAt - textLengthDifference));
            }

            newComponents.push(lastArrayItem.substring(number.startsAt - textLengthDifference, number.endsAt - textLengthDifference));
            
            if (number.endsAt !== lastArrayItem.length - 1) {
              newComponents.push(lastArrayItem.substring(number.endsAt - textLengthDifference));
            }

            newComponents.forEach((newComponent) => nodeComponents.push(newComponent));
          });

          if (node.parentNode.nodeName !== 'A') {
            let parentNode = node.parentNode;

            nodeComponents.forEach((item, index) => {
              if (!isValidPhoneNumber(item)) {
                if (index === 0) {
                  parentNode.replaceChild(document.createTextNode(item), node);
                } else {
                  parentNode.appendChild(document.createTextNode(item));
                }

                return;
              }

              const number = numbers.pop();

              // The parent isn't an anchor, and we should insert a new A-node into it
              let anchor = document.createElement('a');

              // We just created a new node, we should account for that in our loop
              elementalLength++;
              i++;

              anchor.setAttribute('href', callableUri(clickConfiguration, number.number.format('E.164')));
              anchor.setAttribute('class', 'sippy-click-touched');
              anchor.setAttribute('target', '_blank');
              // The following line would insert an E.164-formatted number
              // anchor.appendChild(document.createTextNode(number.number.number));
              anchor.appendChild(document.createTextNode(item));

              if (index === 0) {
                parentNode.replaceChild(anchor, node);
              } else {
                parentNode.appendChild(anchor);
              }
            });

            node.parentNode = parentNode;
          } else {
            if (node.parentNode.href.includes('tel:') && numbers.length !== 0) {
              const number = numbers.pop();
              let anchor = node.parentNode;
  
              anchor.setAttribute('href', callableUri(clickConfiguration, number.number.format('E.164')));
              anchor.setAttribute('class', 'sippy-click-touched');
              anchor.setAttribute('target', '_blank');

              nodeComponents = nodeComponents.filter((item) => item !== '');
  
              nodeComponents.forEach((item, index) => {
                anchor.replaceChild(document.createTextNode(item), anchor.childNodes[index]);
              });
  
              node.parentNode = anchor;
            }
          }
        } else if (node.parentNode.nodeName === 'A' && node.parentNode.href.includes('tel:')) {
          let anchor = node.parentNode;

          anchor.setAttribute('href', callableUri(clickConfiguration, node.parentNode.href.replace('tel:', '')));
          anchor.setAttribute('class', 'sippy-click-touched');
          anchor.setAttribute('target', '_blank');
  
          node.parentNode = anchor;
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

function callableUri(config, number) {
  return `${config.http}://${config.username}:${encodeURIComponent(config.password)}@${config.address}/servlet?key=number=${encodeURIComponent(number)}`;
}