"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Edit2, Plus, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDateTimeBrazil } from "@/lib/date-utils"

type MaterialPrice = {
  id: string
  material_name: string
  price_per_kg: number
  updated_at: string
}

export default function PrecosPage() {
  const [materials, setMaterials] = useState<MaterialPrice[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState<string>("")
  const [newMaterialName, setNewMaterialName] = useState<string>("")
  const [newMaterialPrice, setNewMaterialPrice] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    const { data, error } = await supabase.from("materials_prices").select("*").order("material_name")

    if (error) {
      toast({ title: "Erro ao carregar materiais.", description: error.message, variant: "destructive" })
    } else {
      setMaterials(data || [])
    }
  }

  const handleStartEdit = (material: MaterialPrice) => {
    setEditingId(material.id)
    setEditPrice(material.price_per_kg.toString())
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditPrice("")
  }

  const handleSaveEdit = async (id: string) => {
    const priceNum = Number.parseFloat(editPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Erro", description: "Digite um preço válido.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    const { error } = await supabase
      .from("materials_prices")
      .update({ price_per_kg: priceNum, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      toast({ title: "Erro ao atualizar preço.", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Sucesso!", description: "Preço atualizado com sucesso." })
      setEditingId(null)
      setEditPrice("")
      loadMaterials()
    }
    setIsLoading(false)
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMaterialName.trim()) {
      toast({ title: "Erro", description: "Digite o nome do material.", variant: "destructive" })
      return
    }

    const priceNum = Number.parseFloat(newMaterialPrice)
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Erro", description: "Digite um preço válido.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    const { error } = await supabase.from("materials_prices").insert({
      material_name: newMaterialName.trim(),
      price_per_kg: priceNum,
    })

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Erro", description: "Material já cadastrado.", variant: "destructive" })
      } else {
        toast({ title: "Erro ao adicionar material.", description: error.message, variant: "destructive" })
      }
    } else {
      toast({ title: "Sucesso!", description: "Material adicionado com sucesso." })
      setNewMaterialName("")
      setNewMaterialPrice("")
      loadMaterials()
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Tabela de Preços</h1>
          <p className="text-muted-foreground">Gerencie os preços pagos por kg de cada material</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 h-72">
            <CardHeader>
              <CardTitle>Adicionar Material</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-material-name">Nome do Material</Label>
                  <Input
                    id="new-material-name"
                    type="text"
                    placeholder="Ex: Alumínio"
                    value={newMaterialName}
                    onChange={(e) => setNewMaterialName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-material-price">Preço por kg (R$)</Label>
                  <Input
                    id="new-material-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newMaterialPrice}
                    onChange={(e) => setNewMaterialPrice(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                  <Plus className="h-4 w-4" />
                  Adicionar Material
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Materiais Cadastrados ({materials.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{material.material_name}</p>
                        <p className="text-xs text-muted-foreground">
                          Atualizado: {" "}
                          {formatDateTimeBrazil(material.updated_at)}
                        </p>
                      </div>

                      {editingId === material.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            className="w-32"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            autoFocus
                          />
                          <Button size="icon" variant="default" onClick={() => handleSaveEdit(material.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" onClick={handleCancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <p className="text-lg font-semibold text-primary">
                            R$ {material.price_per_kg.toFixed(2)}
                          </p>
                          <Button size="icon" variant="outline" onClick={() => handleStartEdit(material)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum material cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
