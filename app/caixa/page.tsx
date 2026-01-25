"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Download, TrendingUp } from "lucide-react"
import { exportCashFlowToExcel } from "@/lib/excel-export";
import { getTodayBrazil, formatTimeBrazil } from "@/lib/date-utils";
import ConfirmDialog from "@/components/ui/confirm-dialog"
import { useToast } from "@/hooks/use-toast"

type CashTransaction = {
  id: string
  transaction_type: "entrada" | "saida"
  description: string
  amount: number
  transaction_date: string
  created_at: string
  is_automatic: boolean
}

type DailyBalance = {
  opening_balance: number
  closing_balance: number
}

export default function CaixaPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [balance, setBalance] = useState<DailyBalance>({ opening_balance: 0, closing_balance: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [transactionType, setTransactionType] = useState<"entrada" | "saida">("entrada")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")

  const supabase = createClient()
  const { toast } = useToast()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    const today = getTodayBrazil()

    console.log("[v0] Loading cash data for date:", today)

    const { data: transactionsData, error: transactionsError } = await supabase
      .from("cash_transactions")
      .select("*")
      .gte("created_at", `${today}T00:00:00-03:00`)
      .lt("created_at", `${today}T23:59:59-03:00`)
      .order("created_at", { ascending: false })

    if (transactionsError) {
      console.error("[v0] Error loading transactions:", transactionsError)
    } else {
      console.log("[v0] Loaded", transactionsData?.length, "transactions for", today)
      setTransactions(transactionsData || [])
    }

    // Load daily balance
    const { data: balanceData, error: balanceError } = await supabase
      .from("daily_balance")
      .select("*")
      .eq("balance_date", today)
      .single()

    if (balanceError && balanceError.code !== "PGRST116") {
      console.error("[v0] Error loading balance:", balanceError)
    } else if (balanceData) {
      setBalance({
        opening_balance: Number(balanceData.opening_balance),
        closing_balance: Number(balanceData.closing_balance),
      })
    } else {
      // If no balance for today, get previous day's closing
      const { data: previousBalance } = await supabase
        .from("daily_balance")
        .select("closing_balance")
        .lt("balance_date", today)
        .order("balance_date", { ascending: false })
        .limit(1)
        .single()

      const opening = previousBalance ? Number(previousBalance.closing_balance) : 0
      console.log("[v0] Opening balance from previous day:", opening)
      setBalance({ opening_balance: opening, closing_balance: opening })
    }

    setIsLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || !amount || Number(amount) <= 0) return

    setIsSubmitting(true)

    const { error } = await supabase.from("cash_transactions").insert({
      transaction_type: transactionType,
      description: description.trim(),
      amount: Number(amount),
      transaction_date: getTodayBrazil(),
      is_automatic: false,
    })

    if (error) {
      console.error("Error adding transaction:", error)
      alert("Erro ao adicionar transação")
    } else {
      setDescription("")
      setAmount("")
      loadData()
    }

    setIsSubmitting(false)
  }

  async function handleDelete(id: string) {
    // open confirmation modal
    setPendingDeleteId(id)
    setShowDeleteConfirm(true)
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setShowDeleteConfirm(false)
    setPendingDeleteId(null)

    const { error } = await supabase.from("cash_transactions").delete().eq("id", id)

    if (error) {
      console.error("Error deleting transaction:", error)
      alert("Erro ao excluir transação")
    } else {
      loadData()
    }
  }

  function calculateTotals() {
    const totalIn = transactions
      .filter((t) => t.transaction_type === "entrada")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalOut = transactions
      .filter((t) => t.transaction_type === "saida")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return { totalIn, totalOut, currentBalance: balance.opening_balance + totalIn - totalOut }
  }

  const { totalIn, totalOut, currentBalance } = calculateTotals()

  async function handleExport() {
    await exportCashFlowToExcel(transactions, balance)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-7xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle de Caixa</h1>
            <p className="text-muted-foreground">Gerencie as entradas e saídas do dia</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exportar Resumo do Dia
            </Button>
            <Button
              variant="outline"
              className="gap-2 hover:bg-destructive/50 transition-colors"
              onClick={() => setShowCleanupConfirm(true)}
            >
              Limpar Antigos
            </Button>
            <ConfirmDialog
              open={showCleanupConfirm}
              title="Apagar registros antigos do caixa"
              description="Deseja apagar transações e saldos antigos? Essa ação é irreversível."
              confirmLabel="Apagar"
              cancelLabel="Cancelar"
              onCancel={() => setShowCleanupConfirm(false)}
              onConfirm={async () => {
                setShowCleanupConfirm(false)
                const resp = await fetch('/api/cleanup/caixa', { method: 'POST' })
                const json = await resp.json()
                if (resp.ok && json.success) {
                  toast({ title: 'Sucesso', description: 'Registros antigos de caixa apagados!' })
                  loadData()
                } else {
                  toast({ title: 'Erro', description: json?.error || 'Falha ao apagar registros.', variant: 'destructive' })
                }
              }}
            />
            <ConfirmDialog
              open={showDeleteConfirm}
              title="Excluir transação"
              description="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
              confirmLabel="Excluir"
              cancelLabel="Cancelar"
              onCancel={() => setShowDeleteConfirm(false)}
              onConfirm={confirmDelete}
            />
          </div>
        </div>

        {/* Resumo do Caixa */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:scale-102 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Inicial</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {balance.opening_balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-102 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIn.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-102 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalOut.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:scale-102 transition-transform">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                {currentBalance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário */}
          <Card className="lg:col-span-1 max-h-94">
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
              <CardDescription>Adicione uma entrada ou saída manual</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={transactionType} onValueChange={(value) => setTransactionType(value as any)}>
                    <SelectTrigger id="type" className="hover:cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-green-600" />
                          Entrada
                        </div>
                      </SelectItem>
                      <SelectItem value="saida">
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-red-600" />
                          Saída
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    placeholder="Ex: Venda de material, Pagamento fornecedor..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adicionando..." : "Adicionar Transação"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de transações */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transações do Dia</CardTitle>
              <CardDescription>
                {transactions.length} {transactions.length === 1 ? "transação" : "transações"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Nenhuma transação registrada hoje</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        {transaction.transaction_type === "entrada" ? (
                          <ArrowUpCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatTimeBrazil(transaction.created_at)}</span>
                            {transaction.is_automatic && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">Automático</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg font-bold ${transaction.transaction_type === "entrada" ? "text-green-600" : "text-red-600"}`}
                        >
                          {transaction.transaction_type === "entrada" ? "+" : "-"}
                          {Number(transaction.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        {!transaction.is_automatic && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
