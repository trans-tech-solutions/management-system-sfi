"use client"

import React, { useState, useEffect } from "react"
import { Button } from "./button"
import { Input } from "./input"

type Props = {
  open: boolean
  itemName?: string
  maxQuantity?: number
  initialValue?: string
  onConfirm: (quantity: number) => void
  onCancel: () => void
}

export function RemoveQuantityModal({ open, itemName, maxQuantity, initialValue = "", onConfirm, onCancel }: Props) {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValue(initialValue)
    setError(null)
  }, [open, initialValue])

  if (!open) return null

  const handleConfirm = () => {
    const num = Number.parseFloat(value)
    if (isNaN(num) || num <= 0) {
      setError("Digite uma quantidade válida")
      return
    }
    if (typeof maxQuantity === "number" && num > maxQuantity) {
      setError("Quantidade maior que o disponível")
      return
    }
    onConfirm(num)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Remover quantidade</h3>
        {itemName && <p className="mt-2 text-sm text-muted-foreground">Material: {itemName}</p>}

        <div className="mt-4">
          <label className="text-sm text-muted-foreground">Quantidade (kg)</label>
          <Input
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2 w-full"
          />
          {maxQuantity !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">Disponível: {maxQuantity.toFixed(2)} kg</p>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm}>Remover</Button>
        </div>
      </div>
    </div>
  )
}

export default RemoveQuantityModal
