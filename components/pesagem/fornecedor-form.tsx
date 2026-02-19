"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FormData } from "@/lib/generate-pdf"

interface FornecedorFormProps {
  data: FormData
  onChange: (field: keyof FormData, value: string) => void
}

export function FornecedorForm({ data, onChange }: FornecedorFormProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="boleto" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Boleto
          </Label>
          <Input
            id="boleto"
            value={data.boleto}
            onChange={(e) => onChange("boleto", e.target.value)}
            placeholder="Ex: 9687 (Opcional)"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coleta" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Coleta
          </Label>
          <Input
            id="coleta"
            value={data.coleta}
            onChange={(e) => onChange("coleta", e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tipoPesagem" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tipo de Pesagem
          </Label>
          <Select
            value={data.tipoPesagem}
            onValueChange={(value) => onChange("tipoPesagem", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pesagem Manual">Pesagem Manual</SelectItem>
              <SelectItem value="Pesagem Automatica">Pesagem Automatica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Data
          </Label>
          <Input
            id="data"
            type="date"
            value={data.data}
            onChange={(e) => onChange("data", e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hora" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Hora
          </Label>
          <Input
            id="hora"
            type="time"
            value={data.hora}
            onChange={(e) => onChange("hora", e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nomeFornecedor" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nome do Fornecedor
          </Label>
          <Input
            id="nomeFornecedor"
            value={data.nomeFornecedor}
            onChange={(e) => onChange("nomeFornecedor", e.target.value)}
            placeholder="Ex: Sucatao Forte Itaguai"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <Label htmlFor="endereco" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Endereco
          </Label>
          <Input
            id="endereco"
            value={data.endereco}
            onChange={(e) => onChange("endereco", e.target.value)}
            placeholder="Rua, Avenida..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="numero" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Numero
          </Label>
          <Input
            id="numero"
            value={data.numero}
            onChange={(e) => onChange("numero", e.target.value)}
            placeholder="SN"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bairro" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Bairro
          </Label>
          <Input
            id="bairro"
            value={data.bairro}
            onChange={(e) => onChange("bairro", e.target.value)}
            placeholder="Bairro"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cidade" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cidade
          </Label>
          <Input
            id="cidade"
            value={data.cidade}
            onChange={(e) => onChange("cidade", e.target.value)}
            placeholder="Cidade"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="uf" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            UF
          </Label>
          <Input
            id="uf"
            value={data.uf}
            onChange={(e) => onChange("uf", e.target.value)}
            placeholder="RJ"
            maxLength={2}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cep" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            CEP
          </Label>
          <Input
            id="cep"
            value={data.cep}
            onChange={(e) => onChange("cep", e.target.value)}
            placeholder="00000-000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fone1" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Telefone 1
          </Label>
          <Input
            id="fone1"
            value={data.fone1}
            onChange={(e) => onChange("fone1", e.target.value)}
            placeholder="(21) 0000-0000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fone2" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Telefone 2
          </Label>
          <Input
            id="fone2"
            value={data.fone2}
            onChange={(e) => onChange("fone2", e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fone3" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Telefone 3
          </Label>
          <Input
            id="fone3"
            value={data.fone3}
            onChange={(e) => onChange("fone3", e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cnpjCpf" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            CNPJ / CPF
          </Label>
          <Input
            id="cnpjCpf"
            value={data.cnpjCpf}
            onChange={(e) => onChange("cnpjCpf", e.target.value)}
            placeholder="00.000.000/0000-00"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ieRg" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            IE / RG
          </Label>
          <Input
            id="ieRg"
            value={data.ieRg}
            onChange={(e) => onChange("ieRg", e.target.value)}
            placeholder="Isento"
          />
        </div>
      </div>
    </div>
  )
}
