import { render, showWhile, getBase64 } from './util.js'

class PreviewerHandlerInterface { //Observer
  handle () {}
}

// js繼承/實作多個得這樣做
class PreviewerInterface extends EventTarget {
  constructor () {
    super()
    this.name = null
  }
  getElement (index) {}
}

// Objects
class Image extends PreviewerInterface {
  constructor (file) {
    super()
    this.observers = []
    this.file = file
    this.name = file.name
    this.encoded = null
  }
  async getEncodedFile() {
    if (this.encoded) return this.encoded
    this.encoded = await getBase64(this.file)
    return this.encoded
  }
  async getElement (index) {
    const fileName = this.name
    const base64 = await this.getEncodedFile()
    const containerDiv = document.createElement('div')
    const previewImageDiv = document.createElement('div')
    const removeIconDiv = document.createElement('div')
    const realImageImg = document.createElement('img')
    const fileSeqDiv = document.createElement('div')
    const fileNameDiv = document.createElement('div')

    removeIconDiv.classList.add('remove-icon')
    removeIconDiv.onclick = () => {
      const event = new CustomEvent('remove', { detail: index })
      this.dispatchEvent(event)
    }
    previewImageDiv.classList.add('preview-image')
    previewImageDiv.style.backgroundImage = `url('${base64}')`
    previewImageDiv.appendChild(removeIconDiv)
    realImageImg.classList.add('real-image', 'hide')
    realImageImg.src = base64
    fileSeqDiv.classList.add('file-seq')
    fileSeqDiv.innerText = index + 1
    fileNameDiv.classList.add('file-name')
    fileNameDiv.innerText = fileName
    containerDiv.classList.add('image-container')
    containerDiv.appendChild(previewImageDiv)
    containerDiv.appendChild(realImageImg)
    containerDiv.appendChild(fileSeqDiv)
    containerDiv.appendChild(fileNameDiv)

    return containerDiv
  }
}

class Slider extends PreviewerHandlerInterface {
  constructor (sliderElement) {
    super()
    this.slider = sliderElement
    this.previewers = []
    this.removeHandler = (event) => this.handle(event)
  }

  async appendPreviewer (previewer) {
    previewer.addEventListener('remove', this.removeHandler)
    this.previewers = [...this.previewers, previewer]
    if (getSortType() === 'byName') {
      this.previewers = sortPreviewerByName(this.previewers)
    }
  }

  preview () {
    clearPreviewElement()
    this.create()
  }
  
  async create (index) {
    const uploadItem = getUploadItem()
    for (index in this.previewers) {
      const previewer = this.previewers[index]
      const containerDiv = await previewer.getElement(Number(index))
      render(uploadItem, containerDiv, 'beforebegin')
    }
    this.slider.scrollLeft = this.slider.scrollWidth
  }

  handle (event) {
    const index = event.detail
    const deleted = this.previewers.splice(index, 1)
    deleted[0].removeEventListener('remove', this.removeHandler)
    this.preview()
  }

  clear () {
    this.previewers.forEach((previewer) => {
      previewer.removeEventListener('remove', this.removeHandler)
    })
    this.previewers = []
    clearPreviewElement()
    hideResultArea()
  }
}

// main program
window.addEventListener('load', () => {
  const slider = new Slider(document.querySelector('.preview-area'))
  document.querySelector('#addFileButton').addEventListener('click', triggerUpload)
  document.querySelector('#clearButton').addEventListener('click', slider.clear.bind(slider))
  document.querySelector('#submitButton').addEventListener('click', pingtu)
  document.querySelector('#uploadFile').addEventListener('change', function () {
    uploadNewFile(this, slider)
  })
})

//
const pingtu = () => {
  const canvas = document.querySelector('#resultImage')
  if (canvas.getContext) {
    const images = document.querySelectorAll('.real-image')
    const ctx = canvas.getContext('2d')
    let totalHeight = 0
    let totalWidth = 0
    let thisHeight = 0
    let thisWidth = 0
    if (images.length > 0) {
      // 調整畫布大小
      // getCanvasSize
      images.forEach((img) => {
        thisHeight = img.height
        thisWidth = img.width
        totalWidth = thisWidth > totalWidth ? thisWidth : totalWidth
        totalHeight = totalHeight + thisHeight
      })
      canvas.height = totalHeight
      canvas.width = totalWidth
      // 拼接圖片
      // draw
      totalHeight = 0
      totalWidth = 0
      images.forEach((img) => {
        thisHeight = img.height
        thisWidth = img.width
        ctx.drawImage(img, totalWidth, totalHeight, thisWidth, thisHeight)
        totalHeight = totalHeight + thisHeight
      })
      showResultArea()
      showWhile('welldone')
    } else {
      showWhile('nothing')
    }
  } else {
    alert('網站目前不支援您的瀏覽器')
  }
}

// helper
const triggerUpload = () => {
  document.querySelector('.input-area input[type=file]').click()
}

const getSortType = () => {
  return document.querySelector('input[type=radio][name="sort"]:checked').value
}

const getUploadItem = () => {
  return document.querySelector('.preview-area .upload-item')
}

const hideResultArea = () => {
  document.querySelector('.result-area').classList.add('hide')
}

const showResultArea = () => {
  document.querySelector('.result-area').classList.remove('hide')
}

const clearPreviewElement = () => {
  document.querySelectorAll('.image-container').forEach((container) => {
    container.remove()
  })
}

const uploadNewFile = (input, slider) => {
  if (input.files.length > 0) {
    [...input.files].forEach((file) => {
      const image = new Image(file)
      slider.appendPreviewer(image)
    })
    slider.preview()
  }
}

const sortPreviewerByName = (previewer) => {
  return previewer.sort((a, b) => Number(a.name.replace(/\D/g, '')) - Number(b.name.replace(/\D/g, '')))
}