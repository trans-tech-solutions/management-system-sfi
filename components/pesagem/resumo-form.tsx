"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FormData } from "@/lib/generate-pdf"

interface ResumoFormProps {
  data: FormData
  onChange: (field: keyof FormData, value: string) => void
}

export function ResumoForm({ data, onChange }: ResumoFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fretePorConta" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Frete por Conta
          </Label>
          <Select
            value={data.fretePorConta}
            onValueChange={(value) => onChange("fretePorConta", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Empresa">Empresa</SelectItem>
              <SelectItem value="Fornecedor">Fornecedor</SelectItem>
              <SelectItem value="Cliente">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="motorista" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Motorista
          </Label>
          <Input
            id="motorista"
            value={data.motorista}
            onChange={(e) => onChange("motorista", e.target.value)}
            placeholder="Nome do motorista"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="placa" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Placa
          </Label>
          <Input
            id="placa"
            value={data.placa}
            onChange={(e) => onChange("placa", e.target.value)}
            placeholder="ABC-1D23"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="balanceiro" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Balanceiro
          </Label>
          <Input
            id="balanceiro"
            value={data.balanceiro}
            onChange={(e) => onChange("balanceiro", e.target.value)}
            placeholder="Nome"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="impressoPor" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Impresso por
          </Label>
          <Input
            id="impressoPor"
            value={data.impressoPor}
            onChange={(e) => onChange("impressoPor", e.target.value)}
            placeholder="Nome"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="classificadoPor" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Classificado por
          </Label>
          <Input
            id="classificadoPor"
            value={data.classificadoPor}
            onChange={(e) => onChange("classificadoPor", e.target.value)}
            placeholder="Nome"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observacao" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Observacao
        </Label>
        <Textarea
          id="observacao"
          value={data.observacao}
          onChange={(e) => onChange("observacao", e.target.value)}
          placeholder="Ex: EMPRESA COM BALANCA ELETRONICA AUTOMATIZADA"
          rows={2}
        />
      </div>
    </div>
  )
}
