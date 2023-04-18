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
    postAIResponse(url, function (response) {
      chrome.action.setBadgeText({ text: response })
      chrome.action.setBadgeBackgroundColor({
        color: response === 'Phish' ? '#bc5858' : '#5cb85c',
      })
    })
  }
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    console.log("OnActivated: " + tab.url)
    updateBadge(tab.url)
  })
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url) {
    console.log("OnUpdated: " + changeInfo.url)
    updateBadge(tab.url)
  }
})
