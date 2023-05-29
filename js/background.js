const MAX_URLS = 30;
const MAX_DAYS = 5;
var activeTab = 0;
var results = [];
let db;

function openDB() {
  const request = indexedDB.open('myDatabase', 1);

  request.onerror = function (event) {
    console.log('Error opening indexedDB');
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log('IndexedDB connection successful');
  };

  request.onupgradeneeded = function (event) {
    db = event.target.result;

    // Create an object store (table) to store the data
    if (!db.objectStoreNames.contains('reportedURLs')) {
      const objectStore = db.createObjectStore('reportedURLs', {
        keyPath: 'id',
        autoIncrement: true,
      });

      // Create any necessary indexes
      objectStore.createIndex('urlIndex', 'url', { unique: true });
    }
  };
}

openDB();

function postAIResponse(urlInput, callback) {
  fetch('https://phishingdetector.azurewebsites.net/getprediction?url=' + urlInput)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.prediction == '[1]') {
        callback('Phish');
      } else if (data.prediction == '[0]') {
        callback('Legit');
      }
    })
    .catch((error) => {
      console.log('Error fetching AI response:', error);
      callback(null);
    });
}

function updateBadge(url) {
  chrome.action.setBadgeText({ text: '...' });
  chrome.action.setBadgeBackgroundColor({ color: '#5bc0de' });

  checkURLInIndexedDB(url, function (response) {
    if (response) {
      // URL has been reported and identified as phishing
      chrome.action.setBadgeText({ text: response });
      chrome.action.setBadgeBackgroundColor({ color: '#bc5858' });

      const result = { url: url, response: response };
      results.push(result);

      if (results.length > MAX_URLS) {
        results.shift(); // remove the oldest URL
      }

      chrome.storage.local.set({ results: results }, function () {});
    } else {
      if (url.match(/^(http|https):\/\/[^ "]+$/)) {
        chrome.storage.local.get('results', function (data) {
          let found = false;
          if (data.results) {
            for (let i = 0; i < data.results.length; i++) {
              if (data.results[i].url === url) {
                chrome.action.setBadgeText({ text: data.results[i].response });
                chrome.action.setBadgeBackgroundColor({
                  color:
                    data.results[i].response === 'Phish' ? '#bc5858' : '#5cb85c',
                });
                found = true;
                break;
              }
            }
          }

          if (!found) {
            postAIResponse(url, function (response) {
              if (response) {
                chrome.action.setBadgeText({ text: response });
                chrome.action.setBadgeBackgroundColor({
                  color: response === 'Phish' ? '#bc5858' : '#5cb85c',
                });
                const result = { url: url, response: response };
                results.push(result);

                if (results.length > MAX_URLS) {
                  results.shift(); // remove the oldest URL
                }
                chrome.storage.local.set({ results: results }, function () {});
              }
            });
          }
        });
      } else {
        return;
      }
    }
  });
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  activeTab = activeInfo.tabId;
  chrome.tabs.get(activeInfo.tabId, function (tab) {
    console.log('OnActivated: ' + tab.url);
    updateBadge(tab.url);
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.url && tabId === activeTab) {
    console.log('OnUpdated: ' + changeInfo.url);
    updateBadge(tab.url);
  }
});

function checkURLInIndexedDB(url, callback) {
  if (!db) {
    console.log('IndexedDB is not open');
    callback(null);
    return;
  }

  const transaction = db.transaction(['reportedURLs'], 'readonly');
  const objectStore = transaction.objectStore('reportedURLs');
  const index = objectStore.index('urlIndex');

  const request = index.get(url);

  request.onsuccess = function (event) {
    const data = event.target.result;
    if (data) {
      callback('Phish');
    } else {
      callback(null); // URL not found in IndexedDB
    }
  };

  request.onerror = function (event) {
    console.log('Error checking URL in IndexedDB');
    callback(null);
  };
}

// function cleanupExpiredData() {
//   chrome.storage.local.get('results', function (data) {
//     if (data.results) {
//       const now = Date.now();
//       const maxAge = MAX_DAYS * 24 * 60 * 60 * 1000; // convert days to milliseconds
//       const validResults = data.results.filter(
//         (result) => now - result.timestamp <= maxAge
//       );

//       chrome.storage.local.set({ results: validResults }, function () {});
//     }
//   });
// }

// // Clean up expired data once a day
// setInterval(cleanupExpiredData, 24 * 60 * 60 * 1000);
