"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FornecedorForm } from "@/components/pesagem/fornecedor-form"
import { ResumoForm } from "@/components/pesagem/resumo-form"
import { ProdutosForm } from "@/components/pesagem/produtos-form"
import { generatePDF, type FormData, type Produto } from "@/lib/generate-pdf"
import {
  FileDown,
  Building2,
  Truck,
  Scale,
  ClipboardList,
  RotateCcw,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

const emptyProduto: Produto = {
  nome: "",
  bruto: 0,
  tara: 0,
  descKg: 0,
  liquido: 0,
  preco: 0,
  unidade: "KG",
  totalRs: 0,
  hora: new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
}

const initialFormData: FormData = {
  razaoSocial: "",
  boleto: "",
  coleta: "",
  data: new Date().toISOString().split("T")[0],
  hora: new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  tipoPesagem: "Pesagem Manual",
  nomeFornecedor: "",
  endereco: "",
  numero: "",
  cidade: "",
  uf: "",
  bairro: "",
  cep: "",
  email: "",
  fone1: "",
  fone2: "",
  fone3: "",
  cnpjCpf: "",
  ieRg: "",
  produtos: [{ ...emptyProduto }],
  fretePorConta: "Empresa",
  motorista: "",
  placa: "",
  balanceiro: "",
  impressoPor: "",
  classificadoPor: "",
  observacao: "",
}

export default function Page() {
  const [formData, setFormData] = useState<FormData>(initialFormData)

  const handleFieldChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleProdutoChange = useCallback(
    (index: number, field: keyof Produto, value: string | number) => {
      setFormData((prev) => {
        const produtos = [...prev.produtos]
        produtos[index] = { ...produtos[index], [field]: value }
        return { ...prev, produtos }
      })
    },
    []
  )

  const handleAddProduto = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      produtos: [...prev.produtos, { ...emptyProduto }],
    }))
  }, [])

  const handleRemoveProduto = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index),
    }))
  }, [])

  const handleGeneratePDF = () => {
    generatePDF(formData)
  }

  const handleReset = () => {
    setFormData({
      ...initialFormData,
      produtos: [{ ...emptyProduto }],
      data: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })
  }

  const totalLiquido = formData.produtos.reduce((s, p) => s + p.liquido, 0)
  const totalValor = formData.produtos.reduce((s, p) => s + p.totalRs, 0)

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Pesagem</h1>
            <p className="text-muted-foreground">Controle de pesagens de materiais</p>
          </div>
          
        </div>

        <div className="flex flex-col gap-6">
          {/* Razao Social */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <CardTitle className="text-base">Empresa</CardTitle>
              </div>
              <CardDescription>
                Dados da empresa emissora do demonstrativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="razaoSocial"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Razao Social
                </Label>
                <Input
                  id="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={(e) =>
                    handleFieldChange("razaoSocial", e.target.value)
                  }
                  placeholder="Ex: RECUPERAÇÃO FORTE DE METAIS LTDA"
                />
              </div>
            </CardContent>
          </Card>

          {/* Fornecedor */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Truck className="size-5 text-primary" />
                <CardTitle className="text-base">Fornecedor</CardTitle>
              </div>
              <CardDescription>
                Dados do fornecedor e informacoes de contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FornecedorForm
                data={formData}
                onChange={handleFieldChange}
              />
            </CardContent>
          </Card>

          {/* Produtos - Balanca */}
          <Card className="bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Scale className="size-5 text-primary" />
                <CardTitle className="text-base">
                  Balanca Bruto / Tara
                </CardTitle>
              </div>
              <CardDescription>
                Adicione os produtos e suas pesagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProdutosForm
                produtos={formData.produtos}
                onAdd={handleAddProduto}
                onRemove={handleRemoveProduto}
                onChange={handleProdutoChange}
              />
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Produtos
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formData.produtos.length}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Liquido Total
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {totalLiquido.toLocaleString("pt-BR", {
                  minimumFractionDigits: 1,
                })}
              </p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Descontos
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formData.produtos
                  .reduce((s, p) => s + p.descKg, 0)
                  .toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
              </p>
              <p className="text-xs text-muted-foreground">kg</p>
            </div>
            <div className="rounded-lg border bg-accent/100 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Valor Total
              </p>
              <p className="mt-1 text-2xl font-bold">
                R${" "}
                {totalValor.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Resumo */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-primary" />
                <CardTitle className="text-base">
                  Resumo e Transporte
                </CardTitle>
              </div>
              <CardDescription>
                Dados do transporte e responsaveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResumoForm data={formData} onChange={handleFieldChange} />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="sm:w-auto"
            >
              <RotateCcw className="size-4" />
              Limpar Tudo
            </Button>
            <Button
              type="button"
              onClick={handleGeneratePDF}
              size="lg"
              className="sm:w-auto"
            >
              <FileDown className="size-4" />
              Gerar PDF
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground pb-4">
            {'*** Simples Demonstrativo - Sem Valor Fiscal ***'}
          </p>
        </div>
      </div>
    </main>
  )
}
