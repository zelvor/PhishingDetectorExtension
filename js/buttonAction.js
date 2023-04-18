const button = document.getElementById('button-addon2')
button.addEventListener('click', function () {
  var urlInput = document.getElementById('url_input').value
  postAIResponse(urlInput)
  chrome.storage.sync.set({ url: '' }, function () {})
})

function postAIResponse(urlInput) {
  var xhr = new XMLHttpRequest()
  var url = 'https://phishingdetector.azurewebsites.net/getprediction'
  xhr.open('GET', url + '?url=' + urlInput, true)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send()
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var json = JSON.parse(xhr.responseText)['prediction']
      console.log(json)
      if (json == '[1]') {
        showPhish()
      } else if (json == '[0]') {
        showLegit()
      }
    }
  }
}

function showLegit() {
  document.getElementById('res-circle-2').style.backgroundColor = '#5cb85c'
  document.getElementById('site_score_2').innerHTML = 'Legit'
  document.getElementById('site_msg_2').innerHTML =
    'This website is safe to visit'
}

function showPhish() {
  document.getElementById('res-circle-2').style.backgroundColor = '#bc5858'
  document.getElementById('site_score_2').innerHTML = 'Phish'
  document.getElementById('site_msg_2').innerHTML =
    'This website is a phishing site'
}
