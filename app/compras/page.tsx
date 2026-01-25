"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportPurchasesToExcel } from "@/lib/excel-export"
import { formatTimeBrazil, getTodayBrazil } from "@/lib/date-utils"
import ConfirmDialog from "@/components/ui/confirm-dialog"


type MaterialPrice = {
  id: string
  material_name: string
  price_per_kg: number
}

type Purchase = {
  id: string
  material_name: string
  quantity_kg: number
  price_per_kg: number
  total_value: number
  purchase_date: string
  created_at: string
}

export default function ComprasPage() {
  const [materials, setMaterials] = useState<MaterialPrice[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<string>("")
  const [quantity, setQuantity] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)

  useEffect(() => {
    loadMaterials()
    loadTodayPurchases()
  }, [])

  const loadMaterials = async () => {
    const { data, error } = await supabase.from("materials_prices").select("*").order("material_name")

    if (error) {
      toast({ title: "Erro ao carregar materiais", description: error.message, variant: "destructive" })
    } else {
      setMaterials(data || [])
    }
  }

  const loadTodayPurchases = async () => {
    const today = getTodayBrazil()
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("purchase_date", today)
      .order("created_at", { ascending: false })

    if (error) {
      toast({ title: "Erro ao carregar compras", description: error.message, variant: "destructive" })
    } else {
      setPurchases(data || [])
    }
  }

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const material = materials.find((m) => m.material_name === selectedMaterial)
    if (!material) {
      toast({ title: "Erro", description: "Selecione um material", variant: "destructive" })
      setIsLoading(false)
      return
    }

    const quantityNum = Number.parseFloat(quantity)
    if (isNaN(quantityNum) || quantityNum <= 0) {
      toast({ title: "Erro", description: "Digite uma quantidade válida", variant: "destructive" })
      setIsLoading(false)
      return
    }

    const totalValue = quantityNum * material.price_per_kg

    const { error } = await supabase.from("purchases").insert({
      material_name: material.material_name,
      quantity_kg: quantityNum,
      price_per_kg: material.price_per_kg,
      total_value: totalValue,
      purchase_date: getTodayBrazil(),
    })

    if (error) {
      toast({ title: "Erro ao registrar compra", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Sucesso!", description: "Compra registrada com sucesso" })
      setSelectedMaterial("")
      setQuantity("")
      loadTodayPurchases()
    }

    setIsLoading(false)
  }

  const handleExportPurchases = () => {
    if (purchases.length === 0) {
      toast({ title: "Aviso", description: "Não há compras para exportar", variant: "destructive" })
      return
    }
    exportPurchasesToExcel(purchases)
    toast({ title: "Sucesso!", description: "Planilha exportada com sucesso" })
  }

  const calculatePreview = () => {
    const material = materials.find((m) => m.material_name === selectedMaterial)
    const quantityNum = Number.parseFloat(quantity)

    if (material && !isNaN(quantityNum) && quantityNum > 0) {
      return (quantityNum * material.price_per_kg).toFixed(2)
    }
    return "0.00"
  }

  const todayTotal = purchases.reduce((sum, p) => sum + Number(p.total_value), 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Registrar Compra</h1>
            <p className="text-muted-foreground">Adicione novas compras de materiais</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExportPurchases}>
              <Download className="h-4 w-4" />
              Exportar Compras do Dia
            </Button>
            <Button
              variant="outline"
              className="gap-2 hover:bg-destructive/50 transition-colors"
              onClick={() => setShowCleanupConfirm(true)}
            >
              Limpar Antigos
            </Button>
          </div>
          <ConfirmDialog
            open={showCleanupConfirm}
            title="Apagar compras antigas"
            description="Deseja apagar registro de compras antigos? Essa ação é irreversível."
            confirmLabel="Apagar"
            cancelLabel="Cancelar"
            onCancel={() => setShowCleanupConfirm(false)}
            onConfirm={async () => {
              setShowCleanupConfirm(false)
              const resp = await fetch('/api/cleanup/purchases', { method: 'POST' })
              const json = await resp.json()
              if (resp.ok && json.success) {
                toast({ title: 'Sucesso', description: `Registros antigos apagados!` })
                loadTodayPurchases()
              } else {
                toast({ title: 'Erro', description: json?.error || 'Falha ao apagar registros.', variant: 'destructive' })
              }
            }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 h-96">
            <CardHeader>
              <CardTitle>Nova Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material</Label>
                  <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                    <SelectTrigger id="material">
                      <SelectValue placeholder="Selecione o material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material.id} value={material.material_name}>
                          {material.material_name} - R$ {material.price_per_kg.toFixed(2)}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantidade (kg)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground mb-1">Valor Total</p>
                  <p className="text-2xl font-bold text-[var(--color-primary)]">R$ {calculatePreview()}</p>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                  {isLoading ? "Registrando..." : "Registrar Compra"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between border-b pb-2">
                <CardTitle>Compras de Hoje</CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total do dia</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">R$ {todayTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {purchases.length > 0 ? (
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between border-border pb-1 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{purchase.material_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {purchase.quantity_kg} kg × R$ {Number(purchase.price_per_kg).toFixed(2)}/kg
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--color-primary)]">
                          R$ {Number(purchase.total_value).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTimeBrazil(purchase.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma compra registrada hoje</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
