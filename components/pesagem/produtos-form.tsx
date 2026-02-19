"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import type { Produto } from "@/lib/generate-pdf"

interface ProdutosFormProps {
  produtos: Produto[]
  onAdd: () => void
  onRemove: (index: number) => void
  onChange: (index: number, field: keyof Produto, value: string | number) => void
}

export function ProdutosForm({
  produtos,
  onAdd,
  onRemove,
  onChange,
}: ProdutosFormProps) {
  const handleNumericChange = (
    index: number,
    field: keyof Produto,
    value: string
  ) => {
    const parsed = parseFloat(value) || 0
    onChange(index, field, parsed)

    // Auto-calculate liquido
    if (field === "bruto" || field === "tara" || field === "descKg") {
      const produto = { ...produtos[index] }
      if (field === "bruto") produto.bruto = parsed
      if (field === "tara") produto.tara = parsed
      if (field === "descKg") produto.descKg = parsed

      const liquido = produto.bruto - produto.tara - produto.descKg
      onChange(index, "liquido", Math.max(0, liquido))

      // Recalc total (forçar número e arredondar para 2 casas)
      const precoNum = Number(produto.preco) || 0
      const totalRs = Math.max(0, liquido) * precoNum
      const rounded = Math.round((totalRs + Number.EPSILON) * 100) / 100
      onChange(index, "totalRs", rounded)
    }

    if (field === "preco") {
      const liquidoNum = Number(produtos[index].liquido) || 0
      const totalRs = liquidoNum * parsed
      const rounded = Math.round((totalRs + Number.EPSILON) * 100) / 100
      onChange(index, "totalRs", rounded)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {produtos.map((produto, index) => (
        <div
          key={index}
          className="relative rounded-lg border border-border bg-white/30 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Produto {index + 1}
            </span>
            {produtos.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemove(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Remover produto</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input
                value={produto.nome}
                onChange={(e) => onChange(index, "nome", e.target.value)}
                placeholder="Ex: SUCATA PESADA"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Bruto (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={produto.bruto || ""}
                onChange={(e) =>
                  handleNumericChange(index, "bruto", e.target.value)
                }
                placeholder="0,0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Tara (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={produto.tara || ""}
                onChange={(e) =>
                  handleNumericChange(index, "tara", e.target.value)
                }
                placeholder="0,0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Desconto KG</Label>
              <Input
                type="number"
                step="0.1"
                value={produto.descKg || ""}
                onChange={(e) =>
                  handleNumericChange(index, "descKg", e.target.value)
                }
                placeholder="0,0"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">
                Liquido (kg)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={produto.liquido || ""}
                readOnly
                className="bg-accent font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Preco (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={produto.preco || ""}
                onChange={(e) =>
                  handleNumericChange(index, "preco", e.target.value)
                }
                placeholder="0,00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Unidade</Label>
              <Input
                value={produto.unidade}
                onChange={(e) => onChange(index, "unidade", e.target.value)}
                placeholder="KG"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">
                Total R$
              </Label>
              <Input
                type="number"
                step="0.01"
                value={produto.totalRs || ""}
                readOnly
                className="bg-accent font-semibold"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Hora</Label>
              <Input
                type="time"
                value={produto.hora}
                onChange={(e) => onChange(index, "hora", e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={onAdd}
        className="w-full border-dashed"
      >
        <Plus className="size-4" />
        Adicionar Produto
      </Button>
    </div>
  )
}
