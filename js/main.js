// // var urlInput = window.location.href
// // var hostname = new URL(urlInput).hostname

// // function postAIResponse(urlInput) {
// //   var xhr = new XMLHttpRequest()
// //   var url = 'https://phishingdetector.azurewebsites.net/getprediction'

// //   xhr.open('GET', url + '?url=' + urlInput, true)
// //   xhr.setRequestHeader('Content-Type', 'application/json')
// //   xhr.send()

// //   xhr.onreadystatechange = function () {
// //     if (xhr.readyState == 4 && xhr.status == 200) {
// //       var json = JSON.parse(xhr.responseText)['prediction']
// //       console.log(json)
// //       response = json == '[1]' ? 'Phish' : 'Legit'

// //       chrome.pageAction.setBadgeText({ text: response })
// //       chrome.pageAction.setBadgeBackgroundColor({
// //         color: response === 'Phish' ? '#bc5858' : '#5cb85c',
// //       })
// //     }
// //   }
// // }

// // postAIResponse(urlInput)

// function postAIResponse(urlInput, callback) {
//   var xhr = new XMLHttpRequest()
//   var url = 'https://phishingdetector.azurewebsites.net/getprediction'
//   xhr.open('GET', url + '?url=' + urlInput, true)
//   xhr.setRequestHeader('Content-Type', 'application/json')
//   xhr.send()
//   xhr.onreadystatechange = function () {
//     if (xhr.readyState == 4 && xhr.status == 200) {
//       var json = JSON.parse(xhr.responseText)['prediction']
//       console.log(json)
//       if (json == '[1]') {
//         callback('Phish')
//       } else {
//         callback('Legit')
//       }
//     }
//   }
// }

// let urlInput = window.location.href
// let hostname = new URL(urlInput).hostname

// postAIResponse(urlInput, function (response) {
// //   chrome.action.setBadgeText({ text: response })
// //   chrome.action.setBadgeBackgroundColor({
// //     color: response === 'Phish' ? '#bc5858' : '#5cb85c',
// //   })

//     // it is running in the content script
//     // we have to use document.getElementById   
    
//     // so we can't use chrome.action.setBadgeText

// })

// // chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
// //   console.log('tab updated')
// //   if (changeInfo.status === 'complete') {
// //     let url = tab.url
// //     console.log(url)
// //     // check url is right regex
// //     if (url.match(/^(http|https):\/\/[^ "]+$/)) {
// //       let domain = new URL(url).hostname
// //       postAIResponse(url, function (response) {
// //         // document.getElementById('res-circle').style.backgroundColor =
// //         //   response === 'Phish' ? '#bc5858' : '#5cb85c'
// //         chrome.action.setBadgeText({ text: response })
// //         chrome.action.setBadgeBackgroundColor({
// //           color: response === 'Phish' ? '#bc5858' : '#5cb85c',
// //         })
// //       })
// //     }
// //   }
// // })
