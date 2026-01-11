import { JSX, useState } from 'react'

function App(): JSX.Element {
  const [form, setForm] = useState({
    fornecedor: '',
    material: 'Latinha',
    peso: '',
    valor: ''
  })
  const [msg, setMsg] = useState('')

  const materiais = ['Latinha', 'Cobre', 'Ferro', 'Papelão', 'Plástico']

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setMsg('Salvando...')

    try {
      // @ts-ignore (O TypeScript vai reclamar do window.api, depois a gente arruma com types)
      const resp = await window.api.salvarCompra({
        fornecedor: form.fornecedor,
        material: form.material,
        peso: Number(form.peso),
        valor: Number(form.valor)
      })

      if (resp.sucesso) {
        setMsg(`Salvo em: ${resp.caminho}`)
        setForm({ ...form, fornecedor: '', peso: '', valor: '' }) // Limpa campos
      }
    } catch (error) {
      setMsg('Erro ao salvar!')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🏗️ Sucatão Forte - Controle</h1>

      <form 
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md gap-4 flex flex-col"
      >
        <div>
          <label className="block text-sm mb-1">Fornecedor</label>
          <input 
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            value={form.fornecedor}
            onChange={e => setForm({...form, fornecedor: e.target.value})}
            placeholder="Ex: Sr. João"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Material</label>
          <select 
            className="w-full p-2 rounded bg-slate-700 border border-slate-600"
            value={form.material}
            onChange={e => setForm({...form, material: e.target.value})}
          >
            {materiais.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Peso (KG)</label>
            <input 
              type="number" step="0.1"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              value={form.peso}
              onChange={e => setForm({...form, peso: e.target.value})}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Valor (R$)</label>
            <input 
              type="number" step="0.01"
              className="w-full p-2 rounded bg-slate-700 border border-slate-600"
              value={form.valor}
              onChange={e => setForm({...form, valor: e.target.value})}
            />
          </div>
        </div>

        <button type="submit" className="bg-green-600 hover:bg-green-500 p-3 rounded font-bold mt-4 transition">
          💾 SALVAR NO EXCEL
        </button>

        {msg && <p className="text-xs text-yellow-400 mt-2 text-center">{msg}</p>}
      </form>
    </div>
  )
}

export default App