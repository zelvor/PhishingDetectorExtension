chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var url = tabs[0].url
  // if valid url
  if (url.match(/^(http|https):\/\/[^ "]+$/)) {
    document.getElementById('domain-name').innerHTML = new URL(url).hostname
  }
  chrome.storage.local.get(['results'], function (result) {
    console.log(result)
    const matchingURL = result.results.find((element) => element.url === url)
    if (matchingURL) {
      if (matchingURL.response === 'Phish') {
        showPhish()
      } else {
        showLegit()
      }
    } else {
      chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (var key in changes) {
          var storageChange = changes[key]
          if (storageChange.newValue) {
            const matchingURL = storageChange.newValue.find(
              (element) => element.url === url,
            )
            if (matchingURL) {
              if (matchingURL.response === 'Phish') {
                showPhish()
              } else {
                showLegit()
              }
            }
          }
        }
      })
    }
  })
})

const circle = document.getElementById('res-circle')

function showLegit() {
  circle.style.backgroundColor = '#5cb85c'
  circle.classList.remove('spinner-border')
  document.getElementById('res-circle').style.backgroundColor = '#5cb85c'
  document.getElementById('res-circle').style.width = '150px'
  document.getElementById('res-circle').style.height = '150px'
  document.getElementById('site_score').innerHTML = 'Legit'
  document.getElementById('site_msg').innerHTML = 'Trang web này an toàn'
}

function showPhish() {
  circle.style.backgroundColor = '#bc5858'
  circle.classList.remove('spinner-border')
  document.getElementById('res-circle').style.backgroundColor = '#bc5858'
  document.getElementById('res-circle').style.width = '150px'
  document.getElementById('res-circle').style.height = '150px'
  document.getElementById('site_score').innerHTML = 'Phish'
  document.getElementById('site_msg').innerHTML = 'Trang web này không an toàn'
}
