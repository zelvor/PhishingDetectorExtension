// var contextMenuItem = {
//   id: 'phishingDetector',
//   title: 'Sao chép địa chỉ để kiểm tra',
//   contexts: ['selection'],
// }

// chrome.contextMenus.create(contextMenuItem)
// chrome.contextMenus.onClicked.addListener(function (clickData) {
//   if (clickData.menuItemId == 'phishingDetector' && clickData.selectionText) {
//     // send selected text to input field has id = "url_input" in popup.html
//     chrome.storage.sync.set({ url: clickData.selectionText }, function () {
//       console.log('Value is set to ' + clickData.selectionText)
//     })
//   }
// })
