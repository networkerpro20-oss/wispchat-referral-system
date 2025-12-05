import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import AuthHandlerWrapper from '@/components/AuthHandlerWrapper'

export const metadata: Metadata = {
  title: 'WispChat Referidos - Programa de Comisiones',
  description: 'Sistema de referidos y comisiones de WispChat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthHandlerWrapper />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
