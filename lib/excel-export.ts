import ExcelJS from "exceljs"
import { formatDateBrazil, formatTimeBrazil, formatDateTimeBrazil, getTodayBrazil } from "./date-utils"

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

type CashTransactionExport = {
  transaction_type: "entrada" | "saida"
  description: string
  amount: number
  transaction_date: string
  created_at: string
  is_automatic: boolean
}

type DailyBalanceExport = {
  opening_balance: number
  closing_balance: number
}

// Cores da marca Sucatão
const COLORS = {
  red: "F54337",
  yellow: "FCBE1D",
  blue: "157EC2",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  black: "222222",
}

function createPurchasesWorksheet(workbook: ExcelJS.Workbook, purchases: PurchaseExport[], sheetName = "Compras do Dia") {
  const worksheet = workbook.addWorksheet(sheetName, { properties: { defaultColWidth: 20 } })
  const today = new Date()

  worksheet.mergeCells("A1:F1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "SUCATÃO FORTE ITAGUAÍ - RELATÓRIO DE COMPRAS"
  titleCell.font = { bold: true, size: 16, color: { argb: "FF" + COLORS.white } }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.red } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  worksheet.getRow(1).height = 30

  worksheet.mergeCells("A2:F2")
  const dateCell = worksheet.getCell("A2")
  dateCell.value = `Relatório gerado em: ${formatDateBrazil(today.toISOString())} às ${formatTimeBrazil(today.toISOString())}`
  dateCell.font = { size: 11, color: { argb: "FF" + COLORS.black } }
  dateCell.alignment = { horizontal: "center" }
  worksheet.getRow(2).height = 20

  worksheet.getRow(3).height = 10

  const headers = ["Material", "Quantidade (kg)", "Preço/kg", "Valor Total", "Data", "Hora"]
  const headerRow = worksheet.getRow(4)
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = header
    cell.font = { bold: true, size: 12, color: { argb: "FF" + COLORS.white } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.blue } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
  })
  headerRow.height = 25

  purchases.forEach((purchase, index) => {
    const rowIndex = 5 + index
    const row = worksheet.getRow(rowIndex)
    const isEven = index % 2 === 0

    const materialCell = row.getCell(1)
    materialCell.value = purchase.material_name
    materialCell.alignment = { horizontal: "left", vertical: "middle" }

    const quantityCell = row.getCell(2)
    quantityCell.value = Number(purchase.quantity_kg)
    quantityCell.numFmt = "#,##0.00"
    quantityCell.alignment = { horizontal: "right", vertical: "middle" }

    const priceCell = row.getCell(3)
    priceCell.value = Number(purchase.price_per_kg)
    priceCell.numFmt = "R$ #,##0.00"
    priceCell.alignment = { horizontal: "right", vertical: "middle" }

    const totalCell = row.getCell(4)
    totalCell.value = Number(purchase.total_value)
    totalCell.numFmt = "R$ #,##0.00"
    totalCell.alignment = { horizontal: "right", vertical: "middle" }

    const dateC = row.getCell(5)
    dateC.value = formatDateBrazil(purchase.purchase_date)
    dateC.alignment = { horizontal: "center", vertical: "middle" }

    const timeCell = row.getCell(6)
    timeCell.value = formatTimeBrazil(purchase.created_at)
    timeCell.alignment = { horizontal: "center", vertical: "middle" }

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 6) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (isEven ? COLORS.white : COLORS.lightGray) } }
        cell.border = { top: { style: "thin", color: { argb: "FFD0D0D0" } }, left: { style: "thin", color: { argb: "FFD0D0D0" } }, bottom: { style: "thin", color: { argb: "FFD0D0D0" } }, right: { style: "thin", color: { argb: "FFD0D0D0" } } }
        cell.font = { size: 11, color: { argb: "FF" + COLORS.black } }
      }
    })
    row.height = 20
  })

  const emptyRowIndex = 5 + purchases.length
  worksheet.getRow(emptyRowIndex).height = 10

  const totalRowIndex = emptyRowIndex + 1
  const totalRow = worksheet.getRow(totalRowIndex)

  const totalLabel = totalRow.getCell(1)
  totalLabel.value = "TOTAL GERAL"
  totalLabel.font = { bold: true, size: 13, color: { argb: "FF" + COLORS.black } }
  totalLabel.alignment = { horizontal: "center", vertical: "middle" }

  const totalKg = purchases.reduce((sum, p) => sum + Number(p.quantity_kg), 0)
  const totalKgCell = totalRow.getCell(2)
  totalKgCell.value = totalKg
  totalKgCell.numFmt = "#,##0.00"
  totalKgCell.font = { bold: true, size: 13, color: { argb: "FF" + COLORS.black } }
  totalKgCell.alignment = { horizontal: "right", vertical: "middle" }

  totalRow.getCell(3).value = ""

  const totalValue = purchases.reduce((sum, p) => sum + Number(p.total_value), 0)
  const totalValueCell = totalRow.getCell(4)
  totalValueCell.value = totalValue
  totalValueCell.numFmt = "R$ #,##0.00"
  totalValueCell.font = { bold: true, size: 13, color: { argb: "FF" + COLORS.black } }
  totalValueCell.alignment = { horizontal: "right", vertical: "middle" }

  totalRow.getCell(5).value = ""
  totalRow.getCell(6).value = ""

  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= 6) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.yellow } }
      cell.border = { top: { style: "medium", color: { argb: "FF" + COLORS.black } }, left: { style: "medium", color: { argb: "FF" + COLORS.black } }, bottom: { style: "medium", color: { argb: "FF" + COLORS.black } }, right: { style: "medium", color: { argb: "FF" + COLORS.black } } }
    }
  })
  totalRow.height = 25

  worksheet.getColumn(1).width = 30
  worksheet.getColumn(2).width = 20
  worksheet.getColumn(3).width = 18
  worksheet.getColumn(4).width = 20
  worksheet.getColumn(5).width = 15
  worksheet.getColumn(6).width = 12
}

function createInventoryWorksheet(workbook: ExcelJS.Workbook, inventory: InventoryExport[], sheetName = "Estoque") {
  const worksheet = workbook.addWorksheet(sheetName, { properties: { defaultColWidth: 25 } })
  const today = new Date()

  worksheet.mergeCells("A1:C1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "SUCATÃO FORTE ITAGUAÍ - CONTROLE DE ESTOQUE"
  titleCell.font = { bold: true, size: 16, color: { argb: "FF" + COLORS.white } }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.red } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  worksheet.getRow(1).height = 30

  worksheet.mergeCells("A2:C2")
  const dateCell = worksheet.getCell("A2")
  dateCell.value = `Relatório gerado em: ${formatDateBrazil(today.toISOString())} às ${formatTimeBrazil(today.toISOString())}`
  dateCell.font = { size: 11, color: { argb: "FF" + COLORS.black } }
  dateCell.alignment = { horizontal: "center" }
  worksheet.getRow(2).height = 20

  worksheet.getRow(3).height = 10

  const headers = ["Material", "Quantidade em Estoque (kg)", "Última Atualização"]
  const headerRow = worksheet.getRow(4)
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = header
    cell.font = { bold: true, size: 12, color: { argb: "FF" + COLORS.white } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.blue } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
  })
  headerRow.height = 25

  inventory.forEach((item, index) => {
    const rowIndex = 5 + index
    const row = worksheet.getRow(rowIndex)
    const isEven = index % 2 === 0

    const materialCell = row.getCell(1)
    materialCell.value = item.material_name
    materialCell.alignment = { horizontal: "left", vertical: "middle" }

    const quantityCell = row.getCell(2)
    quantityCell.value = Number(item.quantity_kg)
    quantityCell.numFmt = "#,##0.00"
    quantityCell.alignment = { horizontal: "right", vertical: "middle" }

    const updatedCell = row.getCell(3)
    updatedCell.value = formatDateTimeBrazil(item.last_updated)
    updatedCell.alignment = { horizontal: "center", vertical: "middle" }

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 3) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (isEven ? COLORS.white : COLORS.lightGray) } }
        cell.border = { top: { style: "thin", color: { argb: "FFD0D0D0" } }, left: { style: "thin", color: { argb: "FFD0D0D0" } }, bottom: { style: "thin", color: { argb: "FFD0D0D0" } }, right: { style: "thin", color: { argb: "FFD0D0D0" } } }
        cell.font = { size: 11, color: { argb: "FF" + COLORS.black } }
      }
    })

    row.height = 20
  })

  const emptyRowIndex = 5 + inventory.length
  worksheet.getRow(emptyRowIndex).height = 10

  const totalRowIndex = emptyRowIndex + 1
  const totalRow = worksheet.getRow(totalRowIndex)

  const totalLabel = totalRow.getCell(1)
  totalLabel.value = "TOTAL GERAL EM ESTOQUE"
  totalLabel.font = { bold: true, size: 13, color: { argb: "FF" + COLORS.black } }
  totalLabel.alignment = { horizontal: "center", vertical: "middle" }

  const totalKg = inventory.reduce((sum, item) => sum + Number(item.quantity_kg), 0)
  const totalKgCell = totalRow.getCell(2)
  totalKgCell.value = totalKg
  totalKgCell.numFmt = "#,##0.00"
  totalKgCell.font = { bold: true, size: 13, color: { argb: "FF" + COLORS.black } }
  totalKgCell.alignment = { horizontal: "right", vertical: "middle" }

  totalRow.getCell(3).value = ""

  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= 3) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.yellow } }
      cell.border = { top: { style: "medium", color: { argb: "FF" + COLORS.black } }, left: { style: "medium", color: { argb: "FF" + COLORS.black } }, bottom: { style: "medium", color: { argb: "FF" + COLORS.black } }, right: { style: "medium", color: { argb: "FF" + COLORS.black } } }
    }
  })
  totalRow.height = 25

  worksheet.getColumn(1).width = 35
  worksheet.getColumn(2).width = 30
  worksheet.getColumn(3).width = 25
}

function createCashFlowWorksheet(workbook: ExcelJS.Workbook, transactions: CashTransactionExport[], balance: DailyBalanceExport, sheetName = "Fluxo de Caixa") {
  const worksheet = workbook.addWorksheet(sheetName, { properties: { defaultColWidth: 20 } })
  const today = new Date()

  worksheet.mergeCells("A1:E1")
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "SUCATÃO FORTE ITAGUAÍ - CONTROLE DE CAIXA"
  titleCell.font = { bold: true, size: 16, color: { argb: "FF" + COLORS.white } }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.red } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  worksheet.getRow(1).height = 30

  worksheet.mergeCells("A2:E2")
  const dateCell = worksheet.getCell("A2")
  dateCell.value = `Relatório gerado em: ${formatDateBrazil(today.toISOString())} às ${formatTimeBrazil(today.toISOString())}`
  dateCell.font = { size: 11, color: { argb: "FF" + COLORS.black } }
  dateCell.alignment = { horizontal: "center" }
  worksheet.getRow(2).height = 20

  worksheet.getRow(3).height = 10

  const summaryData = [
    { label: "Saldo Inicial:", value: balance.opening_balance, color: COLORS.blue },
    { label: "Entradas:", value: transactions.filter((t) => t.transaction_type === "entrada").reduce((sum, t) => sum + Number(t.amount), 0), color: "00A65A" },
    { label: "Saídas:", value: transactions.filter((t) => t.transaction_type === "saida").reduce((sum, t) => sum + Number(t.amount), 0), color: "DD4B39" },
  ]

  summaryData.forEach((item, index) => {
    const rowIndex = 4 + index
    const row = worksheet.getRow(rowIndex)

    const labelCell = row.getCell(1)
    labelCell.value = item.label
    labelCell.font = { bold: true, size: 12, color: { argb: "FF" + COLORS.black } }
    labelCell.alignment = { horizontal: "right", vertical: "middle" }

    const valueCell = row.getCell(2)
    valueCell.value = item.value
    valueCell.numFmt = "R$ #,##0.00"
    valueCell.font = { bold: true, size: 12, color: { argb: "FF" + item.color } }
    valueCell.alignment = { horizontal: "left", vertical: "middle" }

    row.height = 22
  })

  const currentBalanceRow = worksheet.getRow(7)
  const balanceLabel = currentBalanceRow.getCell(1)
  balanceLabel.value = "SALDO ATUAL:"
  balanceLabel.font = { bold: true, size: 12, color: { argb: "FF" + COLORS.black } }
  balanceLabel.alignment = { horizontal: "right", vertical: "middle" }
  balanceLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.yellow } }

  const currentBalance = balance.opening_balance + summaryData[1].value - summaryData[2].value
  const balanceValue = currentBalanceRow.getCell(2)
  balanceValue.value = currentBalance
  balanceValue.numFmt = "R$ #,##0.00"
  balanceValue.font = { bold: true, size: 14, color: { argb: "FF" + COLORS.black } }
  balanceValue.alignment = { horizontal: "left", vertical: "middle" }
  balanceValue.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.yellow } }
  currentBalanceRow.height = 25

  worksheet.getRow(8).height = 10

  const headers = ["Tipo", "Descrição", "Valor", "Hora", "Origem"]
  const headerRow = worksheet.getRow(9)
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = header
    cell.font = { bold: true, size: 12, color: { argb: "FF" + COLORS.white } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + COLORS.blue } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }
  })
  headerRow.height = 25

  transactions.forEach((transaction, index) => {
    const rowIndex = 10 + index
    const row = worksheet.getRow(rowIndex)
    const isEven = index % 2 === 0

    const typeCell = row.getCell(1)
    typeCell.value = transaction.transaction_type === "entrada" ? "ENTRADA" : "SAÍDA"
    typeCell.font = { bold: true, size: 11, color: { argb: "FF" + (transaction.transaction_type === "entrada" ? "00A65A" : "DD4B39") } }
    typeCell.alignment = { horizontal: "center", vertical: "middle" }

    const descCell = row.getCell(2)
    descCell.value = transaction.description
    descCell.alignment = { horizontal: "left", vertical: "middle" }

    const amountCell = row.getCell(3)
    amountCell.value = Number(transaction.amount)
    amountCell.numFmt = "R$ #,##0.00"
    amountCell.font = { size: 11, color: { argb: "FF" + (transaction.transaction_type === "entrada" ? "00A65A" : "DD4B39") } }
    amountCell.alignment = { horizontal: "right", vertical: "middle" }

    const timeCell = row.getCell(4)
    timeCell.value = formatTimeBrazil(transaction.created_at)
    timeCell.alignment = { horizontal: "center", vertical: "middle" }

    const originCell = row.getCell(5)
    originCell.value = transaction.is_automatic ? "Automático" : "Manual"
    originCell.alignment = { horizontal: "center", vertical: "middle" }

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 5) {
        if (!cell.fill || !(cell.fill as any).fgColor) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF" + (isEven ? COLORS.white : COLORS.lightGray) } }
        }
        cell.border = { top: { style: "thin", color: { argb: "FFD0D0D0" } }, left: { style: "thin", color: { argb: "FFD0D0D0" } }, bottom: { style: "thin", color: { argb: "FFD0D0D0" } }, right: { style: "thin", color: { argb: "FFD0D0D0" } } }
        if (!cell.font || !cell.font.color) {
          cell.font = { ...cell.font, size: 11, color: { argb: "FF" + COLORS.black } }
        }
      }
    })

    row.height = 20
  })

  worksheet.getColumn(1).width = 15
  worksheet.getColumn(2).width = 45
  worksheet.getColumn(3).width = 18
  worksheet.getColumn(4).width = 12
  worksheet.getColumn(5).width = 15
}

export async function exportPurchasesToExcel(purchases: PurchaseExport[]) {
  const workbook = new ExcelJS.Workbook()
  createPurchasesWorksheet(workbook, purchases)
  const today = new Date()
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Compras_${formatDateBrazil(today.toISOString()).replace(/\//g, "-")}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function exportInventoryToExcel(inventory: InventoryExport[]) {
  const workbook = new ExcelJS.Workbook()
  createInventoryWorksheet(workbook, inventory)
  const today = new Date()
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Estoque_${formatDateBrazil(today.toISOString()).replace(/\//g, "-")}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function exportCashFlowToExcel(transactions: CashTransactionExport[], balance: DailyBalanceExport) {
  const workbook = new ExcelJS.Workbook()
  createCashFlowWorksheet(workbook, transactions, balance)
  const today = new Date()
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Caixa_${formatDateBrazil(today.toISOString()).replace(/\//g, "-")}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}

export async function exportAllReportsToExcel(supabase: any) {
  const workbook = new ExcelJS.Workbook()
  const today = getTodayBrazil()

  // Fetch purchases for today
  const { data: purchasesData, error: purchasesError } = await supabase
    .from("purchases")
    .select("*")
    .eq("purchase_date", today)
    .order("created_at", { ascending: false })

  if (purchasesError) throw purchasesError

  // Fetch inventory
  const { data: inventoryData, error: inventoryError } = await supabase.from("inventory").select("*").order("material_name")
  if (inventoryError) throw inventoryError

  // Fetch cash transactions for today
  const { data: transactionsData, error: transactionsError } = await supabase
    .from("cash_transactions")
    .select("*")
    .gte("created_at", `${today}T00:00:00-03:00`)
    .lt("created_at", `${today}T23:59:59-03:00`)
    .order("created_at", { ascending: false })

  if (transactionsError) throw transactionsError

  // Fetch daily balance
  const { data: balanceData } = await supabase.from("daily_balance").select("*").eq("balance_date", today).maybeSingle()

  // Build sheets using the same helpers used by single-export functions
  const purchases = purchasesData || []
  createPurchasesWorksheet(workbook, purchases)

  const inventory = inventoryData || []
  createInventoryWorksheet(workbook, inventory)

  const transactions = transactionsData || []
  const balance = balanceData || { opening_balance: 0, closing_balance: 0 }
  createCashFlowWorksheet(workbook, transactions, balance)

  // Generate and download workbook
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `Relatorios_Todos_${formatDateBrazil(new Date().toISOString()).replace(/\//g, "-")}.xlsx`
  link.click()
  window.URL.revokeObjectURL(url)
}
