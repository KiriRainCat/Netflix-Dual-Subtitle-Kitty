class Subtitle {
  /** @type {string} */
  text
  /** @type {number} */
  begin
  /** @type {number} */
  end

  constructor(text, begin, end) {
    this.text = text
    this.begin = begin
    this.end = end
  }
}

/** @type {HTMLVideoElement} */
let video
/** @type {Array<Subtitle>} */
const subtitleList = []

let prevTick = 0
let curSubtitleIdx = 0

let tickOffset = 0
let subtitleBottomMargin = '3.8%'

/**
 * @param {number} curTick
 * @returns {number} 0 [no update] 1 [updated] -1 [no subtitle]
 */
function findSubtitle(curTick) {
  if (curTick < prevTick) curSubtitleIdx = 0
  prevTick = curTick

  if (curTick > subtitleList[curSubtitleIdx].end && curTick < subtitleList[curSubtitleIdx + 1].begin) return -1

  for (let i = curSubtitleIdx; i < subtitleList.length; i++) {
    const subtitle = subtitleList[i]

    if (subtitle.begin <= curTick && curTick <= subtitle.end) {
      if (curSubtitleIdx == i) return 0
      curSubtitleIdx = i
      return 1
    }
  }

  return -1
}

async function getVideoElement() {
  tickOffset = (await chrome.storage.local.get('tickOffset'))['tickOffset'] ?? 0
  subtitleBottomMargin = (await chrome.storage.local.get('subtitleBottomMargin'))['subtitleBottomMargin'] ?? '3.8%'

  video = document.querySelector('video')
  if (video == undefined) {
    setTimeout(getVideoElement, 1000)
    return
  }

  video.ontimeupdate = () => {
    const curTick = video.currentTime * 1000 * 10000 + Number.parseInt(tickOffset)

    const subTitleStatus = findSubtitle(curTick)
    if (subTitleStatus == 0) return
    if (subTitleStatus == -1) {
      try {
        document.getElementById('secondary-subtitle-kiriraincat').remove()
      } catch (_) {}
      return
    }

    const textNode = document.createElement('div')
    const subtitleContent = new DOMParser().parseFromString(subtitleList[curSubtitleIdx].text, 'text/html')

    textNode.id = 'secondary-subtitle-kiriraincat'
    textNode.innerHTML = subtitleContent.querySelector('body').textContent.replace(/-/g, '  -')
    textNode.style.position = 'absolute'
    textNode.style.bottom = subtitleBottomMargin
    textNode.style.left = '0'
    textNode.style.right = '0'
    textNode.style.textAlign = 'center'
    textNode.style.fontSize = '32px'
    textNode.style.fontWeight = '700'
    textNode.style.zIndex = '5201314510'
    textNode.style.color = '#ddd'

    const prevTextNode = document.getElementById('secondary-subtitle-kiriraincat')
    if (prevTextNode != null) {
      prevTextNode.replaceWith(textNode)
    } else if (video.parentElement != null) {
      video.parentElement.appendChild(textNode)
    }
  }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg === 'reset') {
    subtitleList = []
    curSubtitleIdx = 0
    prevTick = 0
    return
  }

  if (msg === 'update') {
    tickOffset = (await chrome.storage.local.get('tickOffset'))['tickOffset'] ?? 0
    subtitleBottomMargin = (await chrome.storage.local.get('subtitleBottomMargin'))['subtitleBottomMargin'] ?? '3.8%'
    return
  }

  if (subtitleList.length == 0) {
    const parser = new DOMParser()
    const nodeList = parser.parseFromString(msg, 'text/xml').getElementsByTagName('p')
    for (let i = 0; i < nodeList.length; i++) {
      const el = nodeList.item(i)
      const text = el.innerHTML
      const begin = Number.parseInt(el.getAttribute('begin').replace('t', ''))
      const end = Number.parseInt(el.getAttribute('end'))
      subtitleList.push(new Subtitle(text, begin, end))
    }

    console.log(subtitleList)
  }
})

getVideoElement()
