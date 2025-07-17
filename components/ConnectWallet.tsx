"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface ConnectWalletProps {
  setAddress: (address: string | null) => void
  setIsConnected: (isConnected: boolean) => void
}

export default function ConnectWallet({ setAddress, setIsConnected }: ConnectWalletProps) {
  const handleConnect = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          toast({ title: "Wallet connected successfully!" })
        }
      } catch (error: any) {
        console.error("Error connecting wallet:", error)
        toast({ title: "Failed to connect wallet", description: error.message, variant: "destructive" })
      }
    } else {
      toast({ title: "MetaMask or compatible wallet not detected", description: "Please install MetaMask to connect." })
    }
  }

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
        <CardContent className="flex justify-center">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleConnect}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
            >
              Connect Wallet
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
