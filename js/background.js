let results = []
const MAX_URLS = 1000
const MAX_DAYS = 5

function postAIResponse(urlInput, callback) {
  fetch(
    'https://phishingdetector.azurewebsites.net/getprediction?url=' + urlInput,
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      if (data.prediction == '[1]') {
        callback('Phish')
      } else if (data.prediction == '[0]') {
        callback('Legit')
      }
    })
}

function updateBadge(url) {
  chrome.action.setBadgeText({ text: '...' })
  chrome.action.setBadgeBackgroundColor({ color: '#5bc0de' })

  if (url.match(/^(http|https):\/\/[^ "]+$/)) {
    chrome.storage.local.get('results', function (data) {
      let found = false
      if (data.results) {
        for (let i = 0; i < data.results.length; i++) {
          if (data.results[i].url === url) {
            chrome.action.setBadgeText({ text: data.results[i].response })
            chrome.action.setBadgeBackgroundColor({
              color:
                data.results[i].response === 'Phish' ? '#bc5858' : '#5cb85c',
            })
            found = true
            break
          }
        }
      }

      if (!found) {
        postAIResponse(url, function (response) {
          chrome.action.setBadgeText({ text: response })
          chrome.action.setBadgeBackgroundColor({
            color: response === 'Phish' ? '#bc5858' : '#5cb85c',
          })
          const result = { url: url, response: response }
          results.push(result)

          if (results.length > MAX_URLS) {
            results.shift() // remove the oldest URL
          }

          chrome.storage.local.set({ results: results }, function () {})
        })
      }
    })
  } else {
    return
  }
}

function cleanupExpiredData() {
  chrome.storage.local.get('results', function (data) {
    if (data.results) {
      const now = Date.now()
      const maxAge = MAX_DAYS * 24 * 60 * 60 * 1000 // convert days to milliseconds
      const validResults = data.results.filter(
        (result) => now - result.timestamp <= maxAge,
      )

      chrome.storage.local.set({ results: validResults }, function () {})
    }
  })
}

// Clean up expired data once a day
setInterval(cleanupExpiredData, 24 * 60 * 60 * 1000)

chrome.tabs.onActivated.addListener(function (activeInfo) {
  activeTab = activeInfo.tabId
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    console.log('OnActivated: ' + tab.url)
    updateBadge(tab.url)
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url && tabId === activeTab) {
    console.log('OnUpdated: ' + changeInfo.url)
    updateBadge(tab.url)
  }
})
