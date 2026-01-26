import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getTodayBrazil } from "@/lib/date-utils"
import { ShoppingCart, Package, DollarSign } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  // Get today's purchases (Brazil timezone)
  const today = getTodayBrazil()
  const { data: todayPurchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("*")
    .eq("purchase_date", today)

  // Get total inventory value (simplified - just quantity)
  const { data: inventory, error: inventoryError } = await supabase.from("inventory").select("*")

  // Get materials count
  const { data: materials, error: materialsError } = await supabase.from("materials_prices").select("*")

  const todayTotal = todayPurchases?.reduce((sum, p) => sum + Number(p.total_value), 0) || 0
  const totalInventoryKg = inventory?.reduce((sum, i) => sum + Number(i.quantity_kg), 0) || 0
  const materialsCount = materials?.length || 0
  const todayPurchasesCount = todayPurchases?.length || 0

  const stats = [
    {
      title: "Compras Hoje",
      value: todayPurchasesCount,
      subtitle: `R$ ${todayTotal.toFixed(2)}`,
      icon: ShoppingCart,
      color: "text-[var(--color-primary)]",
    },
    {
      title: "Total em Estoque",
      value: `${totalInventoryKg.toFixed(2)} kg`,
      subtitle: `${inventory?.length || 0} materiais`,
      icon: Package,
      color: "text-[var(--color-secondary)]",
    },
    {
      title: "Materiais Cadastrados",
      value: materialsCount,
      subtitle: "tipos de materiais",
      icon: DollarSign,
      color: "text-[var(--color-accent)]",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance">Dashboard</h1>
          <p className="text-muted-foreground">Bem-vinda ao sistema de gestão do Sucatão</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="hover:scale-102 transition-transform">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2 ">
          <Card className="max-h-[55vh] overflow-auto">
            <CardHeader>
              <CardTitle>Compras Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {todayPurchases && todayPurchases.length > 0 ? (
                <div className="space-y-3">
                  {todayPurchases.slice(0, 5).map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                    >
                      <div>
                        <p className="font-medium">{purchase.material_name}</p>
                        <p className="text-sm text-muted-foreground">{purchase.quantity_kg} kg</p>
                      </div>
                      <p className="font-semibold text-primary">
                        R$ {Number(purchase.total_value).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma compra realizada hoje</p>
              )}
            </CardContent>
          </Card>

          <Card className="max-h-[55vh] overflow-auto">
            <CardHeader>
              <CardTitle>Estoque por Material</CardTitle>
            </CardHeader>
            <CardContent>
              {inventory && inventory.length > 0 ? (
                <div className="space-y-3">
                  {inventory
                    .sort((a, b) => Number(b.quantity_kg) - Number(a.quantity_kg))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                      >
                        <p className="font-medium">{item.material_name}</p>
                        <p className="font-semibold text-primary">
                          {Number(item.quantity_kg).toFixed(2)} kg
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhum material em estoque</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
