import { contextBridge, ipcRenderer } from 'electron'

// Aqui definimos o que o Front-end pode chamar
const api = {
  salvarCompra: (dados: any) => ipcRenderer.invoke('salvar-compra', dados)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (wise)
  window.api = api
}
