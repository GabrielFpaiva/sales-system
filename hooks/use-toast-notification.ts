"use client"

import { useToast } from "@/components/ui/use-toast"

// Criando uma versão estável do hook para evitar loops de renderização
let showSuccessStatic: (message: string) => void
let showErrorStatic: (message: string) => void

export function useToastNotification() {
  const { toast } = useToast()

  const showSuccess = (message: string) => {
    toast({
      title: "Sucesso",
      description: message,
      variant: "default",
    })
  }

  const showError = (message: string) => {
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    })
  }

  // Atualizar as funções estáticas
  showSuccessStatic = showSuccess
  showErrorStatic = showError

  return { showSuccess, showError }
}

// Exportar funções estáticas para uso fora de componentes React
export const toastNotification = {
  showSuccess: (message: string) => {
    if (showSuccessStatic) {
      showSuccessStatic(message)
    }
  },
  showError: (message: string) => {
    if (showErrorStatic) {
      showErrorStatic(message)
    }
  },
}
