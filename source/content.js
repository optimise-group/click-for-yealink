renderPhoneNumbers();

async function renderPhoneNumbers() {
  const clickConfiguration = await getAllStorageSyncData();

  const formats = [
    '(xxx) xxx-xxxx',
    '(xxx)xxx-xxxx',
    '+xx xx xx xx xx',
    '+xx xxx xx xx xx',
    '+xx(0)xx/xx.xx.xx',
    '+xx(0)xx/xx.xx.xx',
    '+xx(0)xxx/xx.xx.xx',
    '+xx/xx.xx.xx',
    '+xxxxxxxxxx',
    'x xx xx xx xx',
    'xx xx xx xx xx',
    'xx+xxxxxxxxxx',
    'xxx-xxx-xxxx',
    'xxx/xx.xx.xx',
    'xxx+xxxxxxxxxx',
    'xxxxxxxxxxx',
    'xxxxxxxxx',
    'xxxxxxxxx'
  ];
  
  const str = formats.join('|')         // split patterns by OR operator
    .replace(/[()+]/g, '\\$&')      // escape special characters
    .replace(/-/g, '[-. ]')         // hyphen can be space or dot as well
    .replace(/(^|[|])x/g, '$1\\bx') // require first digit to be start of a word
    .replace(/x($|[|])/g, 'x\\b$1') // require last digit to be end of a word
    .replace(/x/g, '\\d')           // set digit placeholders
  ;

  const r = RegExp('(' + str + ')', '');
  let node;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

  while (node = walker.nextNode()) {
    // Ignore form and script tags
    if (node.parentNode.tagName.search(/SCRIPT|SELECT|OPTION|BUTTON|TEXTAREA|LABEL/) === -1) {
      if (node.parentNode.tagName === 'A' && node.parentNode.href.includes('tel:')) {
        console.log('anchor', node.parentNode.tagName, node.parentNode.href, node.parentNode.href.slice(4).replace(/\+?[^\d+]/g, ''));

        node.parentNode.setAttribute('href', callableUri(clickConfiguration, node.parentNode.href.slice(4).replace(/\+?[^\d+]/g, '')));
        node.parentNode.setAttribute('class', 'sippy-click-touched');
        node.parentNode.setAttribute('target', '_blank');
      } else {
        // Split elements between phone and normal text
        const nodeCompartments = node.nodeValue.split(r);
  
        while (nodeCompartments.length > 1) {
          const text = nodeCompartments.shift();
  
          if (text.length) {
            // Insert new text node for normal text
            node.parentNode.insertBefore(document.createTextNode(text), node);
          }

          // Create an anchor element for phone numbers
          const phoneNumber = nodeCompartments.shift();
          const anchor = document.createElement('a');
          anchor.setAttribute('href', callableUri(clickConfiguration, phoneNumber.replace(/\+?[^\d+]/g, '')));
          anchor.setAttribute('class', 'sippy-click-touched');
          anchor.setAttribute('target', '_blank');
          anchor.textContent = phoneNumber;
            
          // Re-insert phonenumber
          node.parentNode.insertBefore(anchor, node);
        }
        
        // reduce the original node to the ending non-phone part
        node.nodeValue = nodeCompartments[0];
      }
    };
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