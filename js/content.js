// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   const result = request.message
//   console.log(result)
//   if (result == 'Phish') {
//     showPhish()
//   } else if (result == 'Legit') {
//     showLegit()
//   }
// })

// get local storage
chrome.storage.sync.get('response', function (result) {
  console.log(result.response)
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


function showLegit() {
  document.getElementById('res-circle').style.backgroundColor = '#5cb85c'
  document.getElementById('site_score').innerHTML = 'Legit'
  document.getElementById('site_msg').innerHTML =
    'This website is safe to visit'
}

function showPhish() {
  document.getElementById('res-circle').style.backgroundColor = '#bc5858'
  document.getElementById('site_score').innerHTML = 'Phish'
  document.getElementById('site_msg').innerHTML =
    'This website is a phishing site'
}