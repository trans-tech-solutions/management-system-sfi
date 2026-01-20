export function getTodayBrazil(): string {
  // Get current date/time in Brazil timezone
  const now = new Date()
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  const year = brazilTime.getFullYear()
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0")
  const day = String(brazilTime.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function getYesterdayBrazil(): string {
  const now = new Date()
  const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  // Subtract one day
  brazilTime.setDate(brazilTime.getDate() - 1)

  const year = brazilTime.getFullYear()
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0")
  const day = String(brazilTime.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function formatDateBrazil(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : date
  return d.toLocaleDateString("pt-BR")
}

export function formatDateTimeBrazil(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
}

export function getDateFromUTCTimestamp(utcTimestamp: string): string {
  const date = new Date(utcTimestamp)
  const brazilTime = new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  const year = brazilTime.getFullYear()
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0")
  const day = String(brazilTime.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
