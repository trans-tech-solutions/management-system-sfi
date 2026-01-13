import { useState, useEffect, useMemo, JSX } from 'react'
import logo from './assets/SFI.svg'
import './assets/theme.css'
import { FileSpreadsheet, ShoppingCart, Package, Settings } from 'lucide-react'
import PageCompras from './components/PageCompras'
import PageEstoque from './components/PageEstoque'
import PagePrecos from './components/PagePrecos'

// Tipos
type Material = { id: number; material: string; valor: number }
type Estoque = { material: string; peso: number }

function App(): JSX.Element {
  const [activeTab, setActiveTab] = useState('compras')
  const [db, setDb] = useState<{ precos: Material[]; estoque: Estoque[] }>({
    precos: [],
    estoque: []
  })

  // Form States
  const [compra, setCompra] = useState({ fornecedor: '', material: '', peso: '' })
  const [loading, setLoading] = useState(false)

  // Carregar dados ao iniciar
  async function carregarDados(): Promise<void> {
    const dados = await window.api.getDados()
    setDb(dados)
    if (dados.precos.length > 0 && !compra.material) {
      setCompra((prev) => ({ ...prev, material: dados.precos[0].material }))
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const dados = await window.api.getDados()
      if (!mounted) return
      setDb(dados)
      if (dados.precos.length > 0) {
        setCompra((prev) => ({ ...prev, material: prev.material || dados.precos[0].material }))
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Lógica de Cálculo Automático (valor computado)
  const valorTotal = useMemo(() => {
    if (compra.material && compra.peso) {
      const itemPreco = db.precos.find((p) => p.material === compra.material)
      if (itemPreco) {
        return parseFloat(compra.peso) * itemPreco.valor
      }
    }
    return 0
  }, [compra.peso, compra.material, db.precos])

  async function handleSalvarCompra(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    await window.api.salvarCompra({ ...compra, peso: parseFloat(compra.peso) })
    alert('Compra salva e Estoque atualizado!')
    setCompra({ ...compra, peso: '', fornecedor: '' }) // Limpa campos, mantém material
    await carregarDados() // Recarrega estoque
    setLoading(false)
  }

  async function gerarRelatorio(tipo: string): Promise<void> {
    await window.api.gerarExcel(tipo)
  }

  // --- LAYOUT PRINCIPAL ---
  return (
    <div className="sucatao-app flex h-screen text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800 flex flex-col items-center">
          <img src={logo} alt="SFI" className="w-20 h-20 mb-3 object-contain" />
          <h2 className="font-bold text-lg text-white">SUCATÃO FORTE ITAGUAÍ</h2>
          <p className="text-xs text-slate-200">Controle</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'compras', label: 'Nova Compra', icon: ShoppingCart },
            { id: 'estoque', label: 'Controle Estoque', icon: Package },
            { id: 'precos', label: 'Tabela de Preços', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-pressed={activeTab === item.id}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                activeTab === item.id
                  ? 'bg-blue-700 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => gerarRelatorio('dia')}
            className="w-full flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition"
          >
            <FileSpreadsheet size={16} /> Relatório do Dia
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <div className="sucatao-header">
          <div className="title">
            {activeTab === 'compras'
              ? 'Nova Compra'
              : activeTab === 'estoque'
                ? 'Estoque'
                : 'Tabela de Preços'}
          </div>
          <div className="actions">
            <button className="btn btn-ghost" onClick={() => carregarDados()}>
              Atualizar Dados
            </button>
            <button className="btn btn-primary" onClick={() => gerarRelatorio('dia')}>
              <FileSpreadsheet size={16} className="mr-2" />
              Relatório do Dia
            </button>
          </div>
        </div>

        {activeTab === 'compras' && (
          <PageCompras
            db={db}
            compra={compra}
            setCompra={setCompra}
            loading={loading}
            handleSalvarCompra={handleSalvarCompra}
            valorTotal={valorTotal}
          />
        )}
        {activeTab === 'estoque' && <PageEstoque db={db} setDb={setDb} carregarDados={carregarDados} gerarRelatorio={gerarRelatorio} />}
        {activeTab === 'precos' && <PagePrecos db={db} setDb={setDb} carregarDados={carregarDados} />}
      </main>
    </div>
  )
}

export default App