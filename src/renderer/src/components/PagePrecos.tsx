import React, { JSX } from 'react'

type Material = { id: number; material: string; valor: number }
type DB = { precos: Material[]; estoque: { material: string; peso: number }[] }

type Props = {
  db: DB
  setDb: React.Dispatch<React.SetStateAction<DB>>
  carregarDados: () => Promise<void>
}

export default function PagePrecos({ db, setDb, carregarDados }: Props): JSX.Element {
  const handleEdit = async (index: number, novoValor: string): Promise<void> => {
    const novosPrecos = [...db.precos]
    novosPrecos[index].valor = parseFloat(novoValor)
    setDb({ ...db, precos: novosPrecos })
    await window.api.updatePrecos(novosPrecos)
  }

  const handleAdd = async (): Promise<void> => {
    const nome = prompt('Nome do material (ex: Latinha)')
    if (!nome) return
    const valorStr = prompt('Preço por KG (R$)')
    if (!valorStr) return
    const valor = parseFloat(valorStr.replace(',', '.'))
    const novos = [...db.precos, { id: Date.now(), material: nome, valor }]
    setDb({ ...db, precos: novos })
    await window.api.updatePrecos(novos)
  }

  const handleRemove = async (index: number): Promise<void> => {
    if (!confirm('Remover este material?')) return
    const novos = db.precos.filter((_, i) => i !== index)
    setDb({ ...db, precos: novos })
    await window.api.updatePrecos(novos)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Tabela de Preços de Compra</h2>
        <div className="flex gap-3">
          <button onClick={handleAdd} className="text-blue-600 text-sm font-bold">+ Adicionar Material</button>
          <button onClick={() => carregarDados()} className="text-slate-500 text-sm">Recarregar</button>
        </div>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-slate-500 font-semibold text-sm">
          <tr>
            <th className="p-4">Material</th>
            <th className="p-4">Preço por KG (R$)</th>
            <th className="p-4">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {db.precos.map((p, idx) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="p-4 font-medium text-slate-700">{p.material}</td>
              <td className="p-4">
                <input
                  type="number"
                  step="0.01"
                  className="border border-slate-300 rounded px-2 py-1 w-28"
                  value={p.valor}
                  onChange={(e) => handleEdit(idx, e.target.value)}
                />
              </td>
              <td className="p-4">
                <button onClick={() => handleRemove(idx)} className="text-red-600">Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
