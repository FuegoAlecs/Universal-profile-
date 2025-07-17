import type React from "react"
import { Inter } from "next/font/google"
import "@rainbow-me/rainbowkit/styles.css"
import "./globals.css"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ViewTransitions } from "next-view-transitions"

const inter = Inter({ subsets: ["latin"] })

const config = getDefaultConfig({
  appName: "Universal Profile",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID", // Replace with your WalletConnect Project ID
  chains: [mainnet, sepolia],
  ssr: true,
})

const queryClient = new QueryClient()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <WagmiProvider config={config}>
              <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                  {children}
                  <Toaster />
                </RainbowKitProvider>
              </QueryClientProvider>
            </WagmiProvider>
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
