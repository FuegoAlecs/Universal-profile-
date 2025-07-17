"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Zap, Sun, Moon } from "lucide-react" // Import Sun and Moon icons
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch" // Import Switch component
import { useTheme } from "next-themes" // Import useTheme hook

interface ConnectWalletProps {
  setAddress: (address: string | null) => void
  setIsConnected: (isConnected: boolean) => void
  isConnected: boolean
  address: string | null
}

export default function ConnectWallet({ setAddress, setIsConnected, isConnected, address }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { theme, setTheme } = useTheme() // Use the useTheme hook

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          toast({
            title: "Wallet connected",
            description: `Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        }
      } else {
        toast({
          title: "No Ethereum provider found",
          description: "Please install MetaMask or another Web3 wallet.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection failed",
        description: "Could not connect to wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    toast({ title: "Wallet disconnected" })
  }

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null)
          setIsConnected(false)
          toast({ title: "Wallet disconnected", description: "Accounts changed or disconnected." })
        } else {
          setAddress(accounts[0])
          setIsConnected(true)
          toast({
            title: "Wallet reconnected",
            description: `Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          })
        }
      }
      ;(window as any).ethereum.on("accountsChanged", handleAccountsChanged)

      // Initial check for connected accounts
      ;(window as any).ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0 && !isConnected) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      })

      return () => {
        ;(window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [setAddress, setIsConnected, isConnected])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
      <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500">
        <CardHeader className="text-center">
          <CardTitle className="text-cyan-400 flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Zap className="h-5 w-5" />
            </motion.div>
            Initialize Neural Link
          </CardTitle>
          <CardDescription className="text-slate-300">Connect your wallet to access the metaverse</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {!isConnected ? (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-600/50 shadow-xl">
              <span className="text-sm text-slate-300">
                Connected: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "N/A"}
              </span>
              <Button
                onClick={disconnectWallet}
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-full"
              >
                Disconnect
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-4">
            {theme === "light" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-blue-400" />
            )}
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
