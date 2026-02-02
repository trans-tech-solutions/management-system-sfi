"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { ShoppingCart, Package, DollarSign, LayoutDashboard, LogOut, Wallet, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/compras", label: "Compras", icon: ShoppingCart },
    { href: "/precos", label: "Tabela de Preços", icon: DollarSign },
    { href: "/estoque", label: "Estoque", icon: Package },
    { href: "/caixa", label: "Caixa", icon: Wallet },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Sucatão Forte Itaguaí" width={120} height={40} className="h-10 w-auto" />
            </Link>
            <div className="hidden md:flex md:items-center md:gap-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-white" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  setIsExporting(true)
                  const supabase = createClient()
                  const { exportAllReportsToExcel } = await import("@/lib/excel-export")
                  await exportAllReportsToExcel(supabase)
                  toast({ title: "Sucesso", description: "Relatórios exportados em um arquivo." })
                } catch (err: any) {
                  toast({ title: "Erro", description: err?.message || "Falha ao exportar relatórios.", variant: "destructive" })
                } finally {
                  setIsExporting(false)
                }
              }}
              disabled={isExporting}
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar Todos"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? "Saindo..." : "Sair"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
