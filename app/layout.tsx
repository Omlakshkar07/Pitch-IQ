import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "PitchIQ - From Pitch Deck to Term Sheet",
  description:
    "AI-powered deal intelligence platform helping founders perfect their pitch, understand their valuation, and connect with the right investors.",
}

export const viewport: Viewport = {
  themeColor: "#E85D04",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
