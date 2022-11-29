type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';

// helper
export const render = (node: HTMLElement, appendElement: HTMLElement, position: InsertPosition = 'beforeend'): void => {
    if (!node || !appendElement) return
    if (position) {
      node.insertAdjacentElement(position, appendElement)
    }
  }
  
  export const showWhile = (modalName: string): void => {
    const modal = document.querySelector('#' + modalName) as HTMLElement
    fadeIn(modal)
    window.setTimeout(() => {
      fadeOut(modal)
    }, 1500)
  }
  
  export const fadeIn = (el: HTMLElement): void => {
    el.classList.remove('hide')
    el.style.opacity = '0'
    let last = +new Date()
    const tick = () => {
      el.style.opacity = `${+el.style.opacity + (new Date().valueOf() - last) / 100}`
      last = +new Date()
      if (+el.style.opacity < 1) {
        (requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 1)
      } else {
        el.style.opacity = '1'
      }
    }
    tick()
  }
  
  export const fadeOut = (el: HTMLElement): void => {
    el.style.opacity = '1'
    let last = +new Date()
    const tick = () => {
      el.style.opacity = `${+el.style.opacity - (new Date().valueOf() - last) / 100}`
      last = +new Date()
      if (+el.style.opacity > 0) {
        (requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 1)
      } else {
        el.style.opacity = '0'
        el.classList.add('hide')
      }
    }
    tick()
  }
  
  export const getBase64 = (file: File): Promise<any> => {
    return new Promise((resolve) => {
      const reader: FileReader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result)
      }
      reader.readAsDataURL(file)
    })
  }
  