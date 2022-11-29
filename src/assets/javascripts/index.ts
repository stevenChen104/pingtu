import { render, showWhile, getBase64 } from './util.js'

 // Observer
interface PreviewerHandlerInterface {
    handle(event: any): void
}

// js繼承/實作多個得這樣做
interface PreviewerInterface {
    name: string
    getElement(index: number): Promise<HTMLDivElement>
}

// Objects
class Previewer extends EventTarget implements PreviewerInterface {
    observers: Array<EventTarget>
    file: File
    name: string
    encoded: string

    constructor(file: File) {
        super()
        this.observers = []
        this.file = file
        this.name = file.name
        this.encoded = ''
    }

    async getEncodedFile(): Promise<string> {
        if (this.encoded) return this.encoded
        this.encoded = await getBase64(this.file)
        return this.encoded
    }
    async getElement(index: number): Promise<HTMLDivElement> {
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
        fileSeqDiv.innerText = `${index + 1}`
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

class Slider implements PreviewerHandlerInterface {
    slider: HTMLElement;
    previewers: Array<Previewer>;
    removeHandler: (event: Event) => void;

    constructor(sliderElement: HTMLElement) {
        this.slider = sliderElement
        this.previewers = []
        this.removeHandler = (event) => this.handle(event)
    }

    async appendPreviewer(previewer: Previewer) {
        previewer.addEventListener('remove', this.removeHandler)
        this.previewers = [...this.previewers, previewer]
        if (getSortType() === 'byName') {
            this.previewers = sortPreviewerByName(this.previewers)
        }
    }

    preview() {
        clearPreviewElement()
        this.create()
    }

    async create(index?: any) {
        const uploadItem = getUploadItem()
        for (index in this.previewers) {
            const previewer = this.previewers[index]
            const containerDiv = await previewer.getElement(Number(index))
            render(uploadItem, containerDiv, 'beforebegin')
        }
        this.slider.scrollLeft = this.slider.scrollWidth
    }

    handle(event: any) {
        const index = event.detail
        const deleted = this.previewers.splice(index, 1) as Array<Previewer>
        deleted[0].removeEventListener('remove', this.removeHandler)
        this.preview()
    }

    clear() {
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
  const el = document.querySelector('.preview-area') as HTMLElement
  const slider = new Slider(el)
  document.querySelector('#addFileButton')?.addEventListener('click', triggerUpload)
  document.querySelector('#clearButton')?.addEventListener('click', slider.clear.bind(slider))
  document.querySelector('#submitButton')?.addEventListener('click', pingtu)
  document.querySelector('#uploadFile')?.addEventListener('change', function () {
    uploadNewFile(this, slider)
  })
})

//
const pingtu = () => {
    const canvas = document.querySelector('#resultImage') as HTMLCanvasElement
    if (canvas.getContext) {
        const images = document.querySelectorAll('.real-image') as NodeListOf<HTMLCanvasElement>
        const ctx = canvas.getContext('2d')
        let totalHeight = 0
        let totalWidth = 0
        let thisHeight = 0
        let thisWidth = 0
        if (images.length > 0) {
            // 調整畫布大小
            // getCanvasSize
            images.forEach((img: HTMLCanvasElement) => {
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
            images.forEach((img: HTMLCanvasElement) => {
                thisHeight = img.height
                thisWidth = img.width
                ctx?.drawImage(img, totalWidth, totalHeight, thisWidth, thisHeight)
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
const triggerUpload = (): void => {
    const el = document.querySelector('.input-area input[type=file]') as HTMLElement
    el.click()
}

const getSortType = (): string => {
    const el = document.querySelector('input[type=radio][name="sort"]:checked') as HTMLInputElement
    return el.value
}

const getUploadItem = (): HTMLElement => {
    const el = document.querySelector('.preview-area .upload-item') as HTMLElement
    return el
}

const hideResultArea = (): void => {
    document.querySelector('.result-area')?.classList.add('hide')
}

const showResultArea = (): void => {
    document.querySelector('.result-area')?.classList.remove('hide')
}

const clearPreviewElement = (): void => {
    document.querySelectorAll('.image-container').forEach((container) => {
        container.remove()
    })
}

const uploadNewFile = (input: any, slider: Slider): void => {
    if (input.files.length > 0) {
        [...input.files].forEach((file) => {
            const previewer = new Previewer(file)
            slider.appendPreviewer(previewer)
        })
        slider.preview()
    }
}

const sortPreviewerByName = (previewer: any) => {
    return previewer.sort((a: any, b: any) => Number(a.name.replace(/\D/g, '')) - Number(b.name.replace(/\D/g, '')))
}