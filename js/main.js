// Phát hiện sự kiện thay đổi tab
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    const url = window.location.href
    findURLInStorage(url)
  }
})

// kiểm tra lại url sau khi reload xong
window.onload = function () {
  const url = window.location.href
  findURLInStorage(url)
}

// khi storage thay đổi
chrome.storage.onChanged.addListener(function (changes, namespace) {
  // find the url in the storage
  const url = window.location.href
  findURLInStorage(url)
})

// function findURLInStorage(url) {
//   chrome.storage.local.get(['results'], function (result) {
//     const matchingURL = result.results.find((element) => element.url === url)
//     if (matchingURL) {
//       if (matchingURL.response === 'Phish') {
//         showPopup()
//       }
//     }
//   })
// }

async function findURLInStorage(url) {
  try {
    const result = await chrome.storage.local.get(['results'])
    const matchingURL = result.results.find((element) => element.url === url)
    if (matchingURL && matchingURL.response === 'Phish') {
      showPopup()
    }
  } catch (error) {
    console.error('Error retrieving storage:', error)
  }
}

// function removePopup() {
//   document.getElementById('my-popup-phishing-detector')?.remove()
//   document.getElementById('my-overlay-phishing-detector')?.remove()
// }

function showPopup() {
  // if popup is already shown, do nothing
  if (document.getElementById('my-popup-phishing-detector')) {
    return
  }

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
