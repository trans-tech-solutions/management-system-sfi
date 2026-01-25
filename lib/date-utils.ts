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
  let d: Date
  if (typeof date === "string") {
    // If the string already contains time (ISO), parse directly, otherwise assume it's a YYYY-MM-DD date
    d = date.includes("T") ? new Date(date) : new Date(date + "T12:00:00")
  } else {
    d = date
  }

  if (isNaN(d.getTime())) {
    // fallback to current Brazil date
    const now = new Date()
    const brazilNow = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
    return brazilNow.toLocaleDateString("pt-BR")
  }

  return d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
}

export function formatDateTimeBrazil(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
}

export function formatTimeBrazil(datetime: string): string {
  const d = new Date(datetime)
  return d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })
}

export function getDateFromUTCTimestamp(utcTimestamp: string): string {
  const date = new Date(utcTimestamp)
  const brazilTime = new Date(date.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))

  const year = brazilTime.getFullYear()
  const month = String(brazilTime.getMonth() + 1).padStart(2, "0")
  const day = String(brazilTime.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}
