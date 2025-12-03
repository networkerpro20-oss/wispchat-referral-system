import './globals.css'
import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
