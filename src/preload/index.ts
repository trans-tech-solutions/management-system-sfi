import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Tipos locais para a API exposta
type Material = { id: number; material: string; valor: number }
type EstoqueItem = { material: string; peso: number }
type Compra = { fornecedor: string; material: string; peso: number; valorTotal?: number }
type DB = { precos: Material[]; estoque: EstoqueItem[] }

type Api = {
  getDados: () => Promise<DB>
  updatePrecos: (novosPrecos: Material[]) => Promise<boolean>
  updateEstoque: (novoEstoque: EstoqueItem[]) => Promise<boolean>
  salvarCompra: (compra: Compra) => Promise<boolean>
  gerarExcel: (tipo: string) => Promise<string>
}

// Custom APIs for renderer
const api: Api = {
  getDados: () => ipcRenderer.invoke('get-dados'),
  updatePrecos: (novosPrecos: Material[]) => ipcRenderer.invoke('update-precos', novosPrecos) as Promise<boolean>,
  updateEstoque: (novoEstoque: EstoqueItem[]) => ipcRenderer.invoke('update-estoque', novoEstoque) as Promise<boolean>,
  salvarCompra: (compra: Compra) => ipcRenderer.invoke('salvar-compra', compra) as Promise<boolean>,
  gerarExcel: (tipo: string) => ipcRenderer.invoke('gerar-excel', tipo) as Promise<string>
}

// Expose APIs to renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // Assign to window with a safe cast (no `any`)
  ;(window as unknown as Window & { api: Api; electron?: unknown }).electron = electronAPI
  ;(window as unknown as Window & { api: Api; electron?: unknown }).api = api
}