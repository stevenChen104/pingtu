// helper
export const render = (node, appendElement, position = 'beforeend') => {
  if (!node || !appendElement) return
  if (position) {
    node.insertAdjacentElement(position, appendElement)
  }
}

export const showWhile = (modalName) => {
  const modal = document.querySelector('#' + modalName)
  fadeIn(modal)
  window.setTimeout(() => {
    fadeOut(modal)
  }, 1500)
}

export const fadeIn = (el) => {
  el.classList.remove('hide')
  el.style.opacity = 0
  let last = +new Date()
  const tick = () => {
    el.style.opacity = +el.style.opacity + (new Date() - last) / 100
    last = +new Date()
    if (+el.style.opacity < 1) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 1)
    } else {
      el.style.opacity = 1
    }
  }
  tick()
}

export const fadeOut = (el) => {
  el.style.opacity = 1
  let last = +new Date()
  const tick = () => {
    el.style.opacity = +el.style.opacity - (new Date() - last) / 100
    last = +new Date()
    if (+el.style.opacity > 0) {
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 1)
    } else {
      el.style.opacity = 0
      el.classList.add('hide')
    }
  }
  tick()
}

export const getBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    reader.readAsDataURL(file)
  })
}
