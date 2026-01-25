import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getTodayBrazil } from "@/lib/date-utils"

export async function POST() {
  try {
    const supabase = await createClient()

    const today = getTodayBrazil()

    // calculate cutoff = two days before today
    const cutoffDate = new Date(today + "T12:00:00")
    cutoffDate.setDate(cutoffDate.getDate() - 2)
    const cutoffStr = cutoffDate.toISOString().slice(0, 10) // YYYY-MM-DD

    // delete cash transactions where transaction_date <= cutoffStr
    const { error: txError } = await supabase.from("cash_transactions").delete().lte("transaction_date", cutoffStr)
    if (txError) {
      return NextResponse.json({ success: false, error: txError.message }, { status: 500 })
    }

    // delete daily balances where balance_date <= cutoffStr
    const { data: dbData, error: dbError } = await supabase.from("daily_balance").delete().lte("balance_date", cutoffStr)
    if (dbError) {
      return NextResponse.json({ success: false, error: dbError.message }, { status: 500 })
    }

    const deletedBalances = Array.isArray(dbData) ? (dbData as any[]).length : 0

    return NextResponse.json({ success: true, deletedTransactions: "ok", deletedBalances })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 })
  }
}
