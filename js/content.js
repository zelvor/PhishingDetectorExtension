chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var url = tabs[0].url
  document.getElementById('domain-name').innerHTML = new URL(url).hostname
  chrome.storage.sync.get(['results'], function (result) {
    console.log(result)
    const matchingURL = result.results.find((element) => element.url === url)
    if (matchingURL) {
      if (matchingURL.response === 'Phish') {
        showPhish()
      } else {
        showLegit()
      }
    } else {
      // wait for storaged changed and find again
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

// new code
// if tab is changed or storage is changed
// find url in storage
// if found, show result

const circle = document.getElementById('res-circle')

function showLegit() {
  circle.style.backgroundColor = '#5cb85c'
  circle.classList.remove('spinner-border')
  document.getElementById('res-circle').style.backgroundColor = '#5cb85c'
  document.getElementById('site_score').innerHTML = 'Legit'
  document.getElementById('site_msg').innerHTML = 'Trang web này an toàn'
}

function showPhish() {
  circle.style.backgroundColor = '#bc5858'
  circle.classList.remove('spinner-border')
  document.getElementById('res-circle').style.backgroundColor = '#bc5858'
  document.getElementById('site_score').innerHTML = 'Phish'
  document.getElementById('site_msg').innerHTML = 'Trang web này không an toàn'
}
