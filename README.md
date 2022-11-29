# SOLID 分析

## 單一職責原則(SRP)
appendImages 不只 append 也 resort，可以 previewer().appendImages(images).resort() 把他拆開

## 開放封閉原則(OCP)
未來若要修改 Previewer 內的檔案格式、DOM 排列順序或內容，必須修改 Previewer 的 appendImage、create 方法，故違反開放封閉原則

## 里氏替換原則(LSP)
原本程式碼沒有使用到繼承，故不會違反里氏替換原則

## 介面隔離原則(ISP)
Previewer有依賴Image格式才需要的方法(appendImage)，故違反介面隔離原則

## 依賴反轉原則(DIP)
Previewer 直接依賴 Image，兩者都應依賴抽象，故違反依賴反轉原則


# 使用到的 pattern

## Adapter 轉接器模式

原本 Slider 直接聚合 Previewer，因此使用介面 PreviewerInterface，讓 Slider 跟 PreviewerInterface 聚合，而 Previewer 再去實作 PreviewerInterface 內的方法

## Observer 觀察者模式

利用 Web API 的 EventTarget 來實現觀察者模式
- dispatch 發送事件
- addEventListener 新增監聽
- removeEventListener 移除監聽

1. PreviewerHandlerInterface 定義了所有 Subcriber 的共同行為 (handle)
2. Previewer 繼承 EventTarget 後便可以發出事件 (dispatch)
3. Slider 去實作 PreviewerHandlerInterface 去實現所有 Subcriber 的共同行為 (handle)
4. 當 Previewer (Observer) 發出事件時，通知 Slider (Subcriber) 去執行共同行為 (handle)
