import React, { JSX } from 'react'
import { FileSpreadsheet } from 'lucide-react'

type EstoqueItem = { material: string; peso: number }
type Material = { id: number; material: string; valor: number }

type DB = { precos: Material[]; estoque: EstoqueItem[] }

type Props = {
  db: DB
  setDb: React.Dispatch<React.SetStateAction<DB>>
  carregarDados: () => Promise<void>
  gerarRelatorio: (tipo: string) => Promise<void>
}

export default function PageEstoque({
  db,
  setDb,
  carregarDados,
  gerarRelatorio
}: Props): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Estoque Atual</h2>
        <div className="flex gap-3">
          <button onClick={() => gerarRelatorio('estoque')} className="bg-green-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-green-700">
            <FileSpreadsheet size={20} /> Baixar Relatório
          </button>
          <button onClick={async () => { await carregarDados() }} className="bg-slate-200 px-4 py-2 rounded-lg">Atualizar</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-sm">
            <tr>
              <th className="p-3">Material</th>
              <th className="p-3">Peso (KG)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {db.estoque.map((item, idx) => (
              <tr key={idx}>
                <td className="p-3 font-medium text-slate-700">{item.material}</td>
                <td className="p-3">
                  <input
                    type="number"
                    step="0.1"
                    className="w-28 border border-slate-300 rounded px-2 py-1"
                    value={item.peso}
                    onChange={(e) => {
                      const novos = [...db.estoque]
                      novos[idx] = { ...novos[idx], peso: parseFloat(e.target.value || '0') }
                      setDb({ ...db, estoque: novos })
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex gap-3">
          <button onClick={async () => { await window.api.updateEstoque(db.estoque); alert('Estoque salvo.'); await carregarDados(); }} className="bg-blue-700 text-white px-4 py-2 rounded-lg">Salvar Estoque</button>
          <button onClick={async () => { await carregarDados(); alert('Dados recarregados.'); }} className="bg-slate-200 px-4 py-2 rounded-lg">Recarregar</button>
        </div>
      </div>
    </div>
  )
}
