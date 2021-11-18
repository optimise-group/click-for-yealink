function save_options() {
  var username = document.getElementById('username').value || '';
  var password = document.getElementById('password').value || '';
  var http = document.getElementById('http').value;
  var address = document.getElementById('address').value || '';

  chrome.storage.sync.set({
    username,
    password,
    http,
    address
  }, function () {
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
    http: 'http',
    address: ''
  }, function (items) {
    document.getElementById('username').value = items.username;
    document.getElementById('http').value = items.http;
    document.getElementById('address').value = items.address;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);