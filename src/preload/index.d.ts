import { ElectronAPI } from '@electron-toolkit/preload'

type Material = { id: number; material: string; valor: number }
type EstoqueItem = { material: string; peso: number }
type Compra = { fornecedor: string; material: string; peso: number; valorTotal?: number }
type DB = { precos: Material[]; estoque: EstoqueItem[] }

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getDados: () => Promise<DB>
      updatePrecos: (novosPrecos: Material[]) => Promise<boolean>
      updateEstoque: (novoEstoque: EstoqueItem[]) => Promise<boolean>
      salvarCompra: (compra: Compra) => Promise<boolean>
      gerarExcel: (tipo: string) => Promise<string>
    }
  }
}