type PurchaseExport = {
  material_name: string
  quantity_kg: number
  price_per_kg: number
  total_value: number
  purchase_date: string
  created_at: string
}

type InventoryExport = {
  material_name: string
  quantity_kg: number
  last_updated: string
}

export function exportPurchasesToExcel(purchases: PurchaseExport[]) {
  // Create CSV content with proper formatting
  const headers = ["Material", "Quantidade (kg)", "Preço/kg (R$)", "Valor Total (R$)", "Data", "Hora"]

  const rows = purchases.map((p) => [
    p.material_name,
    Number(p.quantity_kg).toFixed(2),
    Number(p.price_per_kg).toFixed(2),
    Number(p.total_value).toFixed(2),
    new Date(p.purchase_date).toLocaleDateString("pt-BR"),
    new Date(p.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  ])

  // Add total row
  const total = purchases.reduce((sum, p) => sum + Number(p.total_value), 0)
  rows.push(["", "", "", `TOTAL: R$ ${total.toFixed(2)}`, "", ""])

  // Create CSV string
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  // Add BOM for Excel to recognize UTF-8
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

  // Generate filename with date
  const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
  const filename = `Compras_${date}.csv`

  // Download
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportInventoryToExcel(inventory: InventoryExport[]) {
  // Create CSV content with proper formatting
  const headers = ["Material", "Quantidade em Estoque (kg)", "Última Atualização"]

  const rows = inventory.map((item) => [
    item.material_name,
    Number(item.quantity_kg).toFixed(2),
    new Date(item.last_updated).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  ])

  // Add total row
  const totalKg = inventory.reduce((sum, item) => sum + Number(item.quantity_kg), 0)
  rows.push(["TOTAL", `${totalKg.toFixed(2)} kg`, ""])

  // Create CSV string
  const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  // Add BOM for Excel to recognize UTF-8
  const BOM = "\uFEFF"
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })

  // Generate filename with date
  const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
  const filename = `Estoque_${date}.csv`

  // Download
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
