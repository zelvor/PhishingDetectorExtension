chrome.storage.sync.get('url', function (result) {
  if (result.url.match(/^(http|https):\/\/[^ "]+$/)) {
    const page1 = document.getElementById('page-1')
    const page2 = document.getElementById('page-2')
    page1.style.display = 'none'
    page2.style.display = 'block'
    document.getElementById('url_input').value = result.url
    var hostname = new URL(result.url).hostname
    document.getElementById('domain-name-2').innerHTML = hostname
  }
})
