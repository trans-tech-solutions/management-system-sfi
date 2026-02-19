import jsPDF from "jspdf"

export interface Produto {
  nome: string
  bruto: number
  tara: number
  descKg: number
  liquido: number
  preco: number
  unidade: string
  totalRs: number
  hora: string
}

export interface FormData {
  razaoSocial: string
  boleto: string
  coleta: string
  data: string
  hora: string
  tipoPesagem: string
  nomeFornecedor: string
  endereco: string
  numero: string
  cidade: string
  uf: string
  bairro: string
  cep: string
  email: string
  fone1: string
  fone2: string
  fone3: string
  cnpjCpf: string
  ieRg: string
  produtos: Produto[]
  fretePorConta: string
  motorista: string
  placa: string
  balanceiro: string
  impressoPor: string
  classificadoPor: string
  observacao: string
}

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function generatePDF(data: FormData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 10
  const contentWidth = pageWidth - margin * 2
  let y = 12

  // Header
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text(
    "*** SIMPLES DEMOSTRATIVO - SEM VALOR FISCAL ***",
    pageWidth / 2,
    y,
    { align: "center" }
  )
  y += 6

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.text(`RAZAO SOCIAL: ${data.razaoSocial.toUpperCase()}`, pageWidth / 2, y, {
    align: "center",
  })
  y += 5

  const now = new Date()
  const dateStr = `${now.toLocaleDateString("pt-BR")}    ${now.toLocaleTimeString("pt-BR")}`
  doc.text(dateStr, pageWidth / 2, y, { align: "center" })
  y += 10

  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("FORNECEDOR", pageWidth / 2, y, { align: "center" })
  y += 4

  // Fornecedor box
  const boxStartY = y
  doc.setDrawColor(0)
  doc.setLineWidth(0.3)

  // Row 1: Boleto, Coleta, Data, Hora, Pesagem
  doc.rect(margin, y, contentWidth, 7)
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text("BOLETO:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.boleto, margin + 18, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("COLETA:", margin + 40, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.coleta, margin + 55, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("DATA:", margin + 80, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.data}    ${data.hora}`, margin + 92, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text(data.tipoPesagem.toUpperCase(), margin + 140, y + 4.5)
  y += 7

  // Row 2: Fornecedor label + nome
  doc.rect(margin, y, contentWidth, 7)
  doc.setFont("helvetica", "bold")
  doc.text("FORNECEDOR:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.nomeFornecedor.toUpperCase(), margin + 28, y + 4.5)
  y += 7

  // Row 3: Endereco, Numero, Cidade, UF
  doc.rect(margin, y, contentWidth, 7)
  doc.setFont("helvetica", "bold")
  doc.text("ENDERECO:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.endereco.toUpperCase(), margin + 22, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("NUMERO:", margin + 85, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.numero.toUpperCase(), margin + 101, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("CIDADE:", margin + 115, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.cidade.toUpperCase(), margin + 131, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("UF:", margin + 165, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.uf.toUpperCase(), margin + 173, y + 4.5)
  y += 7

  // Row 4: Bairro, CEP
  doc.rect(margin, y, contentWidth, 7)
  doc.setFont("helvetica", "bold")
  doc.text("BAIRRO:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.bairro.toUpperCase(), margin + 18, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("CEP:", margin + 85, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.cep, margin + 95, y + 4.5)
  y += 7

  // Row 5: Email
  doc.rect(margin, y, contentWidth, 7)
  doc.setFont("helvetica", "bold")
  doc.text("EMAIL:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.email.toUpperCase(), margin + 16, y + 4.5)
  y += 7

  // Row 6: Fones
  doc.rect(margin, y, contentWidth, 7)
  doc.setFont("helvetica", "bold")
  doc.text("FONE:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(
    `${data.fone1}     -  (${data.fone2})  -     -  (${data.fone3})  -`,
    margin + 15,
    y + 4.5
  )
  y += 7

  // Row 7: CNPJ, IE/RG
  doc.rect(margin, y, contentWidth, 7)
  doc.setFont("helvetica", "bold")
  doc.text("CNPJ/CPF:", margin + 2, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.cnpjCpf, margin + 22, y + 4.5)

  doc.setFont("helvetica", "bold")
  doc.text("IE/RG:", margin + 75, y + 4.5)
  doc.setFont("helvetica", "normal")
  doc.text(data.ieRg.toUpperCase(), margin + 88, y + 4.5)
  y += 10

  // Balanca Bruto/Tara header
  y += 10
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("BALANCA BRUTO/TARA", pageWidth / 2, y, { align: "center" })
  y += 4

  // Table header
  const colWidths = [38, 20, 20, 18, 20, 16, 12, 22, 18]
  const colHeaders = [
    "PRODUTO",
    "BRUTO",
    "TARA",
    "DESC KG",
    "LIQUIDO",
    "PRECO",
    "UN",
    "TOTAL R$",
    "HORA",
  ]

  doc.setFillColor(220, 220, 220)
  doc.rect(margin, y, contentWidth, 6, "F")
  doc.rect(margin, y, contentWidth, 6)
  doc.setFontSize(7)

  let colX = margin
  colHeaders.forEach((header, i) => {
    doc.text(header, colX + 2, y + 4)
    colX += colWidths[i]
  })
  y += 6

  // Product rows
  data.produtos.forEach((produto) => {
    doc.rect(margin, y, contentWidth, 7)
    doc.setFont("helvetica", "normal")
    let px = margin
    doc.text(produto.nome.toUpperCase(), px + 2, y + 4.5)
    px += colWidths[0]
    doc.text(formatNumber(produto.bruto), px + 2, y + 4.5)
    px += colWidths[1]
    doc.text(formatNumber(produto.tara), px + 2, y + 4.5)
    px += colWidths[2]
    doc.text(formatNumber(produto.descKg), px + 2, y + 4.5)
    px += colWidths[3]
    doc.setFont("helvetica", "bold")
    doc.text(formatNumber(produto.liquido), px + 2, y + 4.5)
    doc.setFont("helvetica", "normal")
    px += colWidths[4]
    doc.text(produto.preco > 0 ? formatCurrency(produto.preco) : "---", px + 2, y + 4.5)
    px += colWidths[5]
    doc.text(produto.unidade.toUpperCase(), px + 2, y + 4.5)
    px += colWidths[6]
    doc.text(formatCurrency(produto.totalRs), px + 2, y + 4.5)
    px += colWidths[7]
    doc.text(produto.hora, px + 2, y + 4.5)
    y += 7
  })

  y += 6

  // Summary box
  const summaryY = y
  doc.rect(margin, y, contentWidth, 42)

  // Row 1: Totals
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text("TOTAL DE PRODUTOS:", margin + 2, y + 5)
  doc.setFont("helvetica", "normal")
  doc.text(`${data.produtos.length}`, margin + 38, y + 5)

  doc.setFont("helvetica", "bold")
  doc.text("TOTAL LIQUIDO QTD:", margin + 55, y + 5)
  doc.setFont("helvetica", "normal")
  const totalLiquido = data.produtos.reduce((sum, p) => sum + p.liquido, 0)
  doc.text(formatNumber(totalLiquido), margin + 88, y + 5)

  doc.setFont("helvetica", "bold")
  doc.text("TOTAL DESCONTOS:", margin + 115, y + 5)
  doc.setFont("helvetica", "normal")
  const totalDesc = data.produtos.reduce((sum, p) => sum + p.descKg, 0)
  doc.text(formatNumber(totalDesc), margin + 148, y + 5)

  doc.line(margin, y + 8, margin + contentWidth, y + 8)

  // Row 2: Frete, Motorista, Placa
  doc.setFont("helvetica", "bold")
  doc.text("FRETE POR CONTA:", margin + 2, y + 13)
  doc.setFont("helvetica", "normal")
  doc.text(data.fretePorConta.toUpperCase(), margin + 38, y + 13)

  doc.setFont("helvetica", "bold")
  doc.text("MOTORISTA:", margin + 65, y + 13)
  doc.setFont("helvetica", "normal")
  doc.text(data.motorista.toUpperCase(), margin + 88, y + 13)

  doc.setFont("helvetica", "bold")
  doc.text("PLACA:", margin + 130, y + 13)
  doc.setFont("helvetica", "normal")
  doc.text(data.placa.toUpperCase(), margin + 145, y + 13)

  doc.line(margin, y + 16, margin + contentWidth, y + 16)

  // Row 3: Balanceiro, Impresso por
  doc.setFont("helvetica", "bold")
  doc.text("BALANCEIRO:", margin + 2, y + 21)
  doc.setFont("helvetica", "normal")
  doc.text(data.balanceiro.toUpperCase(), margin + 28, y + 21)

  doc.setFont("helvetica", "bold")
  doc.text("IMPRESSO POR:", margin + 65, y + 21)
  doc.setFont("helvetica", "normal")
  doc.text(data.impressoPor.toUpperCase(), margin + 95, y + 21)

  doc.line(margin, y + 24, margin + contentWidth, y + 24)

  // Row 4: Classificado por
  doc.setFont("helvetica", "bold")
  doc.text("CLASSIFICADO POR:", margin + 2, y + 29)
  doc.setFont("helvetica", "normal")
  doc.text(data.classificadoPor.toUpperCase(), margin + 38, y + 29)

  // Valor Total
  const totalValor = data.produtos.reduce((sum, p) => sum + p.totalRs, 0)
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.text("VALOR TOTAL:", margin + 110, y + 34)
  doc.text(formatCurrency(totalValor), margin + 145, y + 34)

  y += 42

  // Observation
  if (data.observacao) {
    y += 4
    doc.setFontSize(7)
    doc.rect(margin, y, contentWidth, 7)
    doc.setFont("helvetica", "normal")
    doc.text(data.observacao.toUpperCase(), margin + 2, y + 4.5)
  }

  doc.save(`demonstrativo-${data.boleto || "pesagem"}.pdf`)
}
