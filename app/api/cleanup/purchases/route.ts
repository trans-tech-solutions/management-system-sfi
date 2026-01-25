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

    // delete purchases where purchase_date <= cutoffStr
    const { data, error } = await supabase.from("purchases").delete().lte("purchase_date", cutoffStr)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const deleted = Array.isArray(data) ? (data as any).length : 0
    return NextResponse.json({ success: true, deleted })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: String(err?.message || err) }, { status: 500 })
  }
}
