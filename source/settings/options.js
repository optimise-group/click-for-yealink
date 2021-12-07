function save_options() {
  var username = document.getElementById('username').value || '';
  var password = document.getElementById('password').value || '';
  var enableTimeout = document.getElementById('enableTimeout').checked;
  var http = document.getElementById('http').value;
  var address = document.getElementById('address').value || '';

  let saveSet = { username, enableTimeout, http, address };

  if (password) {
    saveSet = { username, password, enableTimeout, http, address };
  }

  chrome.storage.sync.set(saveSet, function () {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';

    setTimeout(function () {
      status.textContent = '';
    }, 1500);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    username: '',
    password: '',
    enableTimeout: false,
    http: 'http',
    address: ''
  }, function (items) {
    document.getElementById('username').value = items.username;
    document.getElementById('enableTimeout').checked = items.enableTimeout;
    document.getElementById('http').value = items.http;
    document.getElementById('address').value = items.address;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
