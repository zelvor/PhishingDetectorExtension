// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   const result = request.message
//   console.log(result)
//   if (result == 'Phish') {
//     showPhish()
//   } else if (result == 'Legit') {
//     showLegit()
//   }
// })

// get url of current tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var url = tabs[0].url
  document.getElementById('domain-name').innerHTML = new URL(url).hostname
})

chrome.storage.sync.get('response', function (result) {
  if (result.response == 'Phish') {
    showPhish()
  } else if (result.response == 'Legit') {
    showLegit()
  }
})

// if response is changed
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log(changes.response.newValue)
  if (changes.response.newValue == 'Phish') {
    showPhish()
  } else if (changes.response.newValue == 'Legit') {
    showLegit()
  }
})

const circle = document.getElementById('res-circle');

function showLegit() {
  
  circle.style.backgroundColor = '#5cb85c'
  circle.classList.remove('spinner-border')
  document.getElementById('res-circle').style.backgroundColor = '#5cb85c'
  document.getElementById('site_score').innerHTML = 'Legit'
  document.getElementById('site_msg').innerHTML =
    'Trang web này an toàn'
}

function showPhish() {
  circle.style.backgroundColor = '#bc5858'
  circle.classList.remove('spinner-border')
  document.getElementById('res-circle').style.backgroundColor = '#bc5858'
  document.getElementById('site_score').innerHTML = 'Phish'
  document.getElementById('site_msg').innerHTML =
    'Trang web này không an toàn'
}