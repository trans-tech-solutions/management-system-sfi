"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { Edit2, Save, X, Download, Minus } from "lucide-react"
import RemoveQuantityModal from "@/components/ui/remove-quantity-modal"
import { useToast } from "@/hooks/use-toast"
import { exportInventoryToExcel } from "@/lib/excel-export"
import { formatDateTimeBrazil } from "@/lib/date-utils"
import { Navigation } from "@/components/navigation"

type InventoryItem = {
  id: string
  material_name: string
  quantity_kg: number
  last_updated: string
  price_per_kg?: number
}

export default function EstoquePage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    const { data, error } = await supabase.from("inventory").select("*").order("material_name")

    if (error) {
      toast({ title: "Erro ao carregar estoque.", description: error.message, variant: "destructive" })
      return
    }

    // também buscar preços de compra para calcular o valor em estoque
    const { data: materialsData } = await supabase.from("materials_prices").select("*")
    const priceMap = new Map<string, number>((materialsData || []).map((m: any) => [m.material_name, m.price_per_kg]))

    const enriched = (data || []).map((item: any) => ({
      ...item,
      price_per_kg: priceMap.get(item.material_name) ?? 0,
    }))

    setInventory(enriched)
  }

  const handleStartEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditQuantity(item.quantity_kg.toString())
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditQuantity("")
  }

  const handleSaveEdit = async (id: string) => {
    const quantityNum = Number.parseFloat(editQuantity)
    if (isNaN(quantityNum) || quantityNum < 0) {
      toast({ title: "Erro", description: "Digite uma quantidade válida.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    const { error } = await supabase
      .from("inventory")
      .update({ quantity_kg: quantityNum, last_updated: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      toast({ title: "Erro ao atualizar estoque.", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Sucesso!", description: "Estoque atualizado com sucesso." })
      setEditingId(null)
      setEditQuantity("")
      loadInventory()
    }
    setIsLoading(false)
  }

  const handleRemoveQuantity = async (item: InventoryItem) => {
    // mantenho função por compatibilidade; fluxo agora usa modal
    openRemoveModal(item)
  }

  // estado do modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [removeItem, setRemoveItem] = useState<InventoryItem | null>(null)

  const openRemoveModal = (item: InventoryItem) => {
    setRemoveItem(item)
    setRemoveModalOpen(true)
  }

  const closeRemoveModal = () => {
    setRemoveItem(null)
    setRemoveModalOpen(false)
  }

  const confirmRemove = async (quantityToRemove: number) => {
    if (!removeItem) return
    const removeNum = quantityToRemove
    if (isNaN(removeNum) || removeNum <= 0) {
      toast({ title: "Erro", description: "Digite uma quantidade válida", variant: "destructive" })
      return
    }

    const newQuantity = Math.max(0, removeItem.quantity_kg - removeNum)

    setIsLoading(true)
    const { error } = await supabase
      .from("inventory")
      .update({ quantity_kg: newQuantity, last_updated: new Date().toISOString() })
      .eq("id", removeItem.id)

    if (error) {
      toast({ title: "Erro ao atualizar estoque.", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Sucesso!", description: `${removeNum} kg removidos do estoque` })
      loadInventory()
    }
    setIsLoading(false)
    closeRemoveModal()
  }

  const handleExportInventory = () => {
    if (inventory.length === 0) {
      toast({ title: "Aviso", description: "Não há itens no estoque para exportar.", variant: "destructive" })
      return
    }
    exportInventoryToExcel(inventory)
    toast({ title: "Sucesso!", description: "Planilha exportada com sucesso" })
  }

  const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity_kg), 0)
  const totalValuePurchase = inventory.reduce((sum, item) => sum + Number(item.quantity_kg) * Number(item.price_per_kg || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Estoque</h1>
            <p className="text-muted-foreground">Controle de materiais em estoque</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportInventory}>
            <Download className="h-4 w-4" />
            Exportar Estoque
          </Button>
        </div>

        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex flex-col items-center mb-4 md:mb-0">
                  <p className="text-sm text-muted-foreground">Total em Estoque</p>
                  <p className="text-3xl font-bold text-secondary">{totalQuantity.toFixed(2)} kg</p>
                </div>

                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                  <p className="text-3xl font-bold text-secondary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValuePurchase)}</p>
                  <p className="text-xs text-muted-foreground">(valor de compra, não de venda)</p>
                </div>

                <div className="hidden md:flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Materiais</p>
                  <p className="text-3xl font-bold text-secondary">{inventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Materiais em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {inventory.length > 0 ? (
              <div className="space-y-2">
                {inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex-1">
                      <p className="font-medium">{item.material_name}</p>
                      <p className="text-xs text-muted-foreground">Atualizado: {formatDateTimeBrazil(item.last_updated)}</p>
                    </div>

                    {editingId === item.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          className="w-32"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          autoFocus
                        />
                        <span className="text-sm text-muted-foreground">kg</span>
                        <Button size="icon" variant="default" onClick={() => handleSaveEdit(item.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row items-center gap-3">
                        <p className="text-lg font-semibold text-secondary min-w-25 text-center md:text-right">
                          {item.quantity_kg.toFixed(2)} kg
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                                onClick={() => openRemoveModal(item)}
                            title="Remover quantidade (venda)"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={() => handleStartEdit(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum material em estoque.</p>
            )}
          </CardContent>
        </Card>
        <RemoveQuantityModal
          open={removeModalOpen}
          itemName={removeItem?.material_name}
          maxQuantity={removeItem?.quantity_kg}
          initialValue={""}
          onCancel={closeRemoveModal}
          onConfirm={confirmRemove}
        />
      </main>
    </div>
  )
}
