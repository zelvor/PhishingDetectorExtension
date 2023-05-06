// chrome.tabs.onActivated.addListener(function (activeInfo) {
//   activeTab = activeInfo.tabId
//   url = activeInfo.url
//   console.log(url)
//   removePopup()
//   findURLInStorage(url)
// })

// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
//   if (changeInfo.url && tabId === activeTab) {
//     url = changeInfo.url
//     removePopup()
//     findURLInStorage(url)
//   }
// })

// Phát hiện sự kiện thay đổi tab
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    const url = window.location.href
    findURLInStorage(url)
  }
})

chrome.storage.onChanged.addListener(function(changes, areaName) {
  if (areaName === "sync" && "results" in changes) {
    console.log("Storage changed")
    const url = window.location.href
    findURLInStorage(url)
  }
});

function findURLInStorage(url) {
  chrome.storage.sync.get(['results'], function (result) {
    console.log(result)
    removePopup()
    const matchingURL = result.results.find((element) => element.url === url)
    if (matchingURL) {
      if (matchingURL.response === 'Phish') {
        showPopup()
      }
    }
  })
}

function removePopup() {
  // check if popup exists
  if (document.getElementById('my-popup-phishing-detector')) {
    document.getElementById('my-popup-phishing-detector').remove()
  }

  if (document.getElementById('my-overlay-phishing-detector')) {
    document.getElementById('my-overlay-phishing-detector').remove()
  }
}

function showPopup() {
  var popup = document.createElement('div')
  popup.id = 'my-popup-phishing-detector'

  // Set the styles for the popup
  popup.style.position = 'fixed'
  popup.style.top = '50%'
  popup.style.left = '50%'
  popup.style.transform = 'translate(-50%, -50%)'
  popup.style.zIndex = '9999'
  popup.style.width = '350px'
  popup.style.height = '100px'
  popup.style.backgroundColor = '#fff'
  popup.style.border = '1px solid #ccc'
  popup.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)'
  popup.style.display = 'flex'
  popup.style.flexDirection = 'column'
  popup.style.justifyContent = 'space-between'
  popup.style.padding = '20px'
  popup.style.borderRadius = '20px'

  // Set the content of the popup
  popup.innerHTML =
    '<p style="color: #000 !important; font-size: 18px; font-weight: bold; margin-bottom: 20px;">Trang web này không an toàn. Bạn có muốn truy cập tiếp không?</p>' +
    '<div style="display: flex; justify-content: space-between">' +
    '<button id="back-btn" style="padding: 10px 20px; background-color: #ccc; border: none; border-radius: 5px; cursor: pointer;">Quay lại trang trước</button>' +
    '<button id="proceed-btn" style="padding: 10px 20px; background-color: #f00; color: #fff; border: none; border-radius: 5px; cursor: pointer;">Tiếp tục truy cập</button>' +
    '</div>'

  // Add event listeners to the buttons
  var proceedBtn = popup.querySelector('#proceed-btn')
  proceedBtn.addEventListener('click', function () {
    // Handle click event for "proceed" button
    popup.remove()
    overlay.remove()
  })

  var backBtn = popup.querySelector('#back-btn')
  backBtn.addEventListener('click', function () {
    // Handle click event for "back" button
    popup.remove()
    overlay.remove()
    if (history.length > 1) {
      history.back()
    } else {
      window.location.href = 'https://www.google.com'
    }
  })
  // Append the popup to the document
  document.body.appendChild(popup)

  // Create the overlay element
  var overlay = document.createElement('div')
  overlay.id = 'my-overlay-phishing-detector'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  overlay.style.zIndex = '9998'

  // Append the overlay to the document
  document.body.appendChild(overlay)
}
