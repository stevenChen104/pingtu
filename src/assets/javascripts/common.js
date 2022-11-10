import { render, showWhile, getBase64 } from './util.js'


// Objects
class Image {
  constructor (file, seq) {
    this.file = file
    this.seq = seq
    this.base64 = null
  }
  async setBase64 () {
    this.base64 = await getBase64(this.file)
  }
}

class Previewer {
  constructor (sliderElement, uploadItemElement) {
    this.slider = sliderElement
    this.uploadItem = uploadItemElement
    this.images = []
  }

  async appendImages (files) {
    const images = []
    const seqOffset = this.images.length + 1
    for (const index in files) {
      const file = files[index]
      const image = new Image(file, seqOffset + Number(index))
      await image.setBase64()
      images.push(image)
    }
    this.images = [...this.images, ...images]
    if (getSortType() === 'byName') {
      const sortedImages = sortImageByName(this.images)
      sortedImages.forEach((image, index) => image.seq = index + 1)
      this.images = sortedImages
    }
  }

  preview () {
    clearPreviewElement()
    this.images.forEach((image) => {
      this.create(image)
    })
  }
  
  create (image) {
    const fileName = image.file.name
    const seq = image.seq
    const base64 = image.base64
    const containerDiv = document.createElement('div')
    const previewImageDiv = document.createElement('div')
    const removeIconDiv = document.createElement('div')
    const realImageImg = document.createElement('img')
    const fileSeqDiv = document.createElement('div')
    const fileNameDiv = document.createElement('div')

    removeIconDiv.classList.add('remove-icon')
    removeIconDiv.dataset.seq = seq
    removeIconDiv.onclick = () => this.remove(seq)
    previewImageDiv.classList.add('preview-image')
    previewImageDiv.style.backgroundImage = `url('${base64}')`
    previewImageDiv.appendChild(removeIconDiv)
    realImageImg.classList.add('real-image', 'hide')
    realImageImg.src = base64
    fileSeqDiv.classList.add('file-seq')
    fileSeqDiv.innerText = seq
    fileNameDiv.classList.add('file-name')
    fileNameDiv.innerText = fileName
    containerDiv.classList.add('image-container')
    containerDiv.appendChild(previewImageDiv)
    containerDiv.appendChild(realImageImg)
    containerDiv.appendChild(fileSeqDiv)
    containerDiv.appendChild(fileNameDiv)

    render(this.uploadItem, containerDiv, 'beforebegin')
    this.slider.scrollLeft = this.slider.scrollWidth
  }

  remove (seq) {
    this.images = this.images.filter((image) => image.seq !== seq)
    this.images.forEach((image, index) => image.seq = index + 1)
    this.preview()
  }

  clear () {
    this.images = []
    clearPreviewElement()
    hideResultArea()
  }
}

// main program
window.addEventListener('load', () => {
  const previewer = new Previewer(document.querySelector('.preview-area'), document.querySelector('.preview-area .upload-item'))
  document.querySelector('#addFileButton').addEventListener('click', triggerUpload)
  document.querySelector('#clearButton').addEventListener('click', previewer.clear.bind(previewer))
  document.querySelector('#submitButton').addEventListener('click', pingtu)
  document.querySelector('#uploadFile').addEventListener('change', function () {
    uploadNewFile(this, previewer)
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

const uploadNewFile = async (input, previewer) => {
  if (input.files.length > 0) {
    await previewer.appendImages([...input.files])
    previewer.preview()
  }
}

const sortImageByName = (images) => {
  return images.sort((a, b) => Number(a.file.name.replace(/\D/g, '')) - Number(b.file.name.replace(/\D/g, '')))
}