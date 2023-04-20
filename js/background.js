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

let activeTab = null

function updateBadge(url) {
  chrome.action.setBadgeText({ text: '...' })
  chrome.action.setBadgeBackgroundColor({ color: '#5bc0de' })
  chrome.storage.sync.set({ response: '' }, function () {})

  if (url.match(/^(http|https):\/\/[^ "]+$/)) {
    postAIResponse(url, function (response) {
      chrome.action.setBadgeText({ text: response })
      chrome.action.setBadgeBackgroundColor({
        color: response === 'Phish' ? '#bc5858' : '#5cb85c',
      })
      // chrome.runtime.sendMessage({ message: response })
      chrome.storage.sync.set({ response: response }, function () {})
      
    })
  }
}

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

