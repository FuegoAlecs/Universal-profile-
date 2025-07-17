"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Sun, Moon, Wallet, Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

interface ConnectWalletProps {
  setAddress: (address: string | null) => void
  setIsConnected: (connected: boolean) => void
  isConnected: boolean
  address: string | null
}

export default function ConnectWallet({ setAddress, setIsConnected, isConnected, address }: ConnectWalletProps) {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      setIsConnecting(true)
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          toast({
            title: "Wallet Connected!",
            description: `Connected with address: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
          })
        }
      } catch (error: any) {
        console.error("Error connecting to wallet:", error)
        toast({
          title: "Connection Failed",
          description: error.message || "Could not connect to wallet.",
          variant: "destructive",
        })
      } finally {
        setIsConnecting(false)
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      })
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setIsConnected(false)
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    })
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="text-slate-300 hover:text-white border-slate-700 hover:border-cyan-500 transition-colors duration-300 bg-transparent"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isConnected ? (
        <Button
          onClick={disconnectWallet}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
        >
          <Wallet className="mr-2 h-4 w-4" /> Disconnect Wallet
        </Button>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </>
          )}
        </Button>
      )}
    </div>
  )
}
