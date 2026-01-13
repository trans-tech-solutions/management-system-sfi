import React from 'react'
import { ShoppingCart, DollarSign } from 'lucide-react'

type CompraState = { fornecedor: string; material: string; peso: string }

type Material = { id: number; material: string; valor: number }

type DB = { precos: Material[]; estoque: { material: string; peso: number }[] }

type Props = {
  db: DB
  compra: CompraState
  setCompra: React.Dispatch<React.SetStateAction<CompraState>>
  loading: boolean
  handleSalvarCompra: (e: React.FormEvent) => Promise<void>
  valorTotal: number
}

export default function PageCompras({ db, compra, setCompra, loading, handleSalvarCompra, valorTotal }: Props) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <ShoppingCart className="text-blue-600" /> Nova Compra
      </h2>

      <form onSubmit={handleSalvarCompra} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Fornecedor</label>
          <input
            required
            className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Nome do cliente..."
            value={compra.fornecedor}
            onChange={(e) => setCompra({ ...compra, fornecedor: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Material</label>
            <select
              className="w-full p-3 rounded-lg border border-slate-300 bg-white"
              value={compra.material}
              onChange={(e) => setCompra({ ...compra, material: e.target.value })}
            >
              {db.precos.map((p) => (
                <option key={p.id} value={p.material}>
                  {p.material}
                </option>
              ))}
            </select>
            <div className="text-xs text-blue-600 mt-1 font-medium">
              Preço atual: R$
              {db.precos.find((p) => p.material === compra.material)?.valor.toFixed(2)} /kg
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">Peso (KG)</label>
            <input
              type="number"
              step="0.1"
              required
              className="w-full p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              value={compra.peso}
              onChange={(e) => setCompra({ ...compra, peso: e.target.value })}
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center">
          <span className="text-slate-500 font-medium">Valor a Pagar:</span>
          <span className="text-3xl font-bold text-green-600">
            R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-lg transition shadow-lg flex justify-center gap-2"
        >
          {loading ? (
            'Salvando...'
          ) : (
            <>
              <DollarSign /> CONFIRMAR PAGAMENTO
            </>
          )}
        </button>
      </form>
    </div>
  )
}
