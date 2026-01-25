"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    let didNavigate = false

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      await router.push("/")
      didNavigate = true
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao fazer login")
    } finally {
      if (!didNavigate) setIsLoading(false)
    }
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center p-6"
      style={{ backgroundColor: "var(--sucatao-white)" }}
    >
      <div className="w-full max-w-sm">
        <Card className="border-2" style={{ borderColor: "var(--sucatao-blue)" }}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Image src="/logo.svg" alt="Sucatão Forte Itaguaí" width={180} height={60} />
            </div>
            <CardTitle className="text-2xl" style={{ color: "var(--sucatao-black)" }}>
              Acesso ao Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <p
                    className="text-sm p-3 rounded-md"
                    style={{
                      backgroundColor: "#fee",
                      color: "var(--sucatao-red)",
                    }}
                  >
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full text-white hover:scale-105 hover:opacity-90 transition-all"
                  style={{ backgroundColor: "var(--sucatao-blue)" }}
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
