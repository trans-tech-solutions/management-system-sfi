import { ElectronAPI } from '@electron-toolkit/preload'

export {}

declare global {
  type Material = { id: number; material: string; valor: number }
  type EstoqueItem = { material: string; peso: number }
  type Compra = { fornecedor: string; material: string; peso: number; valorTotal?: number; id?: number; data?: string }
  type DB = { precos: Material[]; estoque: EstoqueItem[]; historico: Compra[] }

  interface Api {
    getDados(): Promise<DB>
    updatePrecos(novosPrecos: Material[]): Promise<boolean>
    updateEstoque(novoEstoque: EstoqueItem[]): Promise<boolean>
    salvarCompra(compra: Compra): Promise<boolean>
    gerarExcel(tipo: string): Promise<string>
  }

  interface Window {
    api: Api
    electron?: ElectronAPI
  }

  // Allow importing SVGs
  declare module '*.svg' {
    const src: string
    export default src
  }
}
/// <reference types="vite/client" />
