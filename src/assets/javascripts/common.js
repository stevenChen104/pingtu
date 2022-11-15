import { render, showWhile, getBase64 } from './util.js'


// Interface
class PreviewerInterface {
  constructor () {
    this.name = null
  }
  getElement (index) {}
}

class ObservableInterface {
  addObserver(observer) {}
  removeObserver(observer) {}
  callObserversRemove() {}
}

class ObserverInterface {
  removePreviewer() {}
}

// js繼承/實作多個得這樣做
const ObservableInterfaceMixin = (Base) => class extends Base {
  constructor() {
    super()
  }
  addObserver(observer) {}
  removeObserver(observer) {}
  callObserversRemove() {}
}

// Objects
class Image extends ObservableInterfaceMixin(PreviewerInterface) {
  constructor (file) {
    super()
    this.observers = []
    this.file = file
    this.name = file.name
  }
  async getElement (index) {
    const fileName = this.name
    const base64 = await getBase64(this.file)
    const containerDiv = document.createElement('div')
    const previewImageDiv = document.createElement('div')
    const removeIconDiv = document.createElement('div')
    const realImageImg = document.createElement('img')
    const fileSeqDiv = document.createElement('div')
    const fileNameDiv = document.createElement('div')

    removeIconDiv.classList.add('remove-icon')
    removeIconDiv.onclick = () => this.callObserversRemove(index)
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
  addObserver (observer) {
    this.observers.push(observer)
  }
  removeObserver(observer) {
    const index = array.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }

  callObserversRemove(index) {
    this.observers.forEach((observer) => {
      observer.removePreviewer(index)
    })
  }
}

class Slider extends ObserverInterface {
  constructor (sliderElement) {
    super()
    this.slider = sliderElement
    this.previewers = []
  }

  async appendPreviewer (previewer) {
    previewer.addObserver(this)
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

  removePreviewer (index) {
    this.previewers.splice(index, 1); 
    this.preview()
  }

  clear () {
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
      slider.appendPreviewer(new Image(file))
    })
    slider.preview()
  }
}

const sortPreviewerByName = (previewer) => {
  return previewer.sort((a, b) => Number(a.name.replace(/\D/g, '')) - Number(b.name.replace(/\D/g, '')))
}