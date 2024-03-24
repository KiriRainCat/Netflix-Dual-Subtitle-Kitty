let prevUrl = ''

// 拦截字幕XML文件请求，读取其字幕数据，发送到 content 脚本
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes('?o=') && !details.url.includes('range') && details.url !== prevUrl) {
      prevUrl = details.url

      fetch(details.url)
        .then((res) => {
          res.text().then((text) => {
            chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
              chrome.tabs.sendMessage(tabs[0].id, text)
            })
          })
        })
        .catch((_) => {})
    }
  },
  { urls: ['<all_urls>'] }
)
