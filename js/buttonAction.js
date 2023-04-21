const button = document.getElementById('button-addon2')
button.addEventListener('click', function () {
  var urlInput = document.getElementById('url_input').value
  console.log(urlInput)
  postAIResponse(urlInput)
  // chrome.storage.sync.set({ url: '' }, function () {})
})

function postAIResponse(urlInput) {
  fetch(
    'https://phishingdetector.azurewebsites.net/getprediction?url=' + urlInput,
  )
    .then((response) => response.json())
    .then((data) => {
      const circle2 = document.getElementById('res-circle-2')

      function showLegit() {
        circle2.style.backgroundColor = '#5cb85c'
        circle2.classList.remove('spinner-border')
        document.getElementById('res-circle-2').style.backgroundColor =
          '#5cb85c'
        document.getElementById('site_score_2').innerHTML = 'Legit'
        document.getElementById('site_msg_2').innerHTML =
          'Trang web này an toàn'
      }

      function showPhish() {
        circle2.style.backgroundColor = '#bc5858'
        circle2.classList.remove('spinner-border')
        document.getElementById('res-circle-2').style.backgroundColor =
          '#bc5858'
        document.getElementById('site_score_2').innerHTML = 'Phish'
        document.getElementById('site_msg_2').innerHTML =
          'Trang web này không an toàn'
      }

      console.log(data)
      if (data.prediction == '[1]') {
        showPhish()
      } else if (data.prediction == '[0]') {
        showLegit()
      }
    })
}
