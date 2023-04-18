document.addEventListener('mouseup', function () {
  var selectedText = window.getSelection().toString().trim()
  if (selectedText.match(/^(http|https):\/\/[^ "]+$/)) {
    var popup = document.createElement('div')
    popup.id = 'ext-popup'
    popup.style.position = 'fixed'
    popup.style.top = '50%'
    popup.style.left = '50%'
    popup.style.transform = 'translate(-50%, -50%)'
    popup.style.zIndex = '9999'
    popup.style.background = '#fff'
    popup.style.padding = '10px'
    popup.style.border = '1px solid #000'
    popup.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)'
    popup.textContent = 'Test Popup'
    document.body.appendChild(popup)
  }
})

document.addEventListener("mousedown", function() {
    var popup = document.getElementById("ext-popup");
    if (popup !== null) {
      popup.parentNode.removeChild(popup);
    }
  });