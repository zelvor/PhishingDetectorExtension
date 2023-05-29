let db;

function openDB() {
  const request = indexedDB.open("myDatabase", 1);

  request.onerror = function(event) {
    console.log("Error opening indexedDB");
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    console.log("IndexedDB connection successful");
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Tạo object store (bảng) để lưu trữ dữ liệu
    if (!db.objectStoreNames.contains("reportedURLs")) {
      const objectStore = db.createObjectStore("reportedURLs", { keyPath: "id", autoIncrement: true });

      // Tạo các chỉ mục (indexes) nếu cần thiết
      objectStore.createIndex("urlIndex", "url", { unique: true });
    }
  };
}

openDB();

function addToReportedURLs(url) {
  const transaction = db.transaction(["reportedURLs"], "readwrite");
  const objectStore = transaction.objectStore("reportedURLs");

  const request = objectStore.add({ url: url });

  request.onsuccess = function(event) {
    console.log("URL added to reportedURLs in IndexedDB");
  };

  request.onerror = function(event) {
    console.log("Error adding URL to reportedURLs in IndexedDB");
  };
}





const button = document.getElementById('button-addon2')
button.addEventListener('click', function () {
  var urlInput = document.getElementById('url_input').value
  if (urlInput == '') {
    alert('Please enter the URL')
    return
  }
  var regex = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  resetUI()
  if (!regex.test(urlInput)) {
    document.getElementById('res-circle-2').style.backgroundColor = '#808080'
    document.getElementById('site_msg_2').innerHTML = 'URL không hợp lệ'
  }
  postAIResponse(urlInput)
  // chrome.storage.sync.set({ url: '' }, function () {})
})

function resetUI() {
  const circle = document.getElementById('res-circle-2')
  circle.style.backgroundColor = '#fff'
  circle.classList.add('spinner-border')
  document.getElementById('res-circle-2').style.backgroundColor = '#fff'
  document.getElementById('res-circle-2').style.width = '120px'
  document.getElementById('res-circle-2').style.height = '120px'
  document.getElementById('site_score_2').innerHTML = ''
  document.getElementById('site_msg_2').innerHTML = ''
}

function postAIResponse(urlInput) {
  fetch(
    'https://phishingdetector.azurewebsites.net/getprediction?url=' + urlInput,
  )
    .then((response) => response.json())
    .then((data) => {
      const circle2 = document.getElementById('res-circle-2')

      function showLegit() {
        circle2.style.backgroundColor = '#5cb85c'
        circle2.classList.remove('spinner-border')
        document.getElementById('res-circle-2').style.backgroundColor =
          '#5cb85c'
        document.getElementById('res-circle-2').style.width = '150px'
        document.getElementById('res-circle-2').style.height = '150px'
        document.getElementById('site_score_2').innerHTML = 'Legit'
        document.getElementById('site_msg_2').innerHTML =
          'Trang web này an toàn'
      }

      function showPhish() {
        circle2.style.backgroundColor = '#bc5858'
        circle2.classList.remove('spinner-border')
        document.getElementById('res-circle-2').style.backgroundColor =
          '#bc5858'
        document.getElementById('res-circle-2').style.width = '150px'
        document.getElementById('res-circle-2').style.height = '150px'
        document.getElementById('site_score_2').innerHTML = 'Phish'
        document.getElementById('site_msg_2').innerHTML =
          'Trang web này không an toàn'
      }

      console.log(data)
      if (data.prediction == '[1]') {
        showPhish()
      } else if (data.prediction == '[0]') {
        showLegit()
      }
    })
}

const button2 = document.getElementById('button-addon3')
button2.addEventListener('click', function () {
  var urlInput = document.getElementById('url_input_3').value
  console.log(urlInput)
  ReportHandler(urlInput)
})

function ReportHandler(urlInput) {
  if (urlInput == '') {
    alert('Please enter the URL')
    return
  }
  var regex = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ) // fragment locator
  if (!regex.test(urlInput)) {
    alert('Please enter the valid URL')
    return
  }

  // send url report to report_url.txt on Azure Blob Storage
  var myHeaders = new Headers()
  myHeaders.append('Content-Type', 'text/plain')

  var raw = ''

  var requestOptions = {
    method: 'POST',
    body: raw,
    redirect: 'follow',
  }

  fetch(
    'https://phishingdetector.azurewebsites.net/postreporturl?url=' + urlInput,
    requestOptions,
  )
    .then((response) => response.text())
    .then(
      (result) =>
        (document.getElementById('report_msg').innerHTML =
          'Báo cáo thành công!'),
    )
    .catch((error) => console.log('error', error))

  // Lưu URL vào bộ nhớ cục bộ của extension
  addToReportedURLs(urlInput);

  // console.log data
  chrome.storage.local.get(['reportedURLs'], function (result) {
    console.log(result)
  })

  setTimeout(function () {
    document.getElementById('report_msg').innerHTML = ''
  }, 3000)
}
