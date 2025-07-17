"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/button"

export default function ConnectWallet() {
  return (
    <Card className="w-full max-w-md mx-auto text-center">
      <CardHeader>
        <CardTitle>Welcome to Universal Profile</CardTitle>
        <CardDescription>Connect your wallet to view your decentralized identity.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ConnectButton.Custom>
          {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
            const ready = mounted && authenticationStatus !== "loading"
            const connected =
              ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated")

            return (
              <div
                {...(!ready && {
                  "aria-hidden": true,
                  style: {
                    opacity: 0,
                    pointerEvents: "none",
                    userSelect: "none",
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button
                        onClick={openConnectModal}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Connect Wallet
                      </Button>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <Button
                        onClick={openChainModal}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Wrong network
                      </Button>
                    )
                  }

                  return (
                    <div className="flex gap-3">
                      <Button
                        onClick={openChainModal}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                      >
                        {chain.has && (
                          <div
                            style={{
                              background: chain.iconBackground,
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              overflow: "hidden",
                              marginRight: 4,
                            }}
                          >
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? "Chain icon"}
                                src={chain.iconUrl || "/placeholder.png"}
                                style={{ width: 12, height: 12 }}
                              />
                            )}
                          </div>
                        )}
                        {chain.name}
                      </Button>

                      <Button
                        onClick={openAccountModal}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                      >
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ""}
                      </Button>
                    </div>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </CardContent>
    </Card>
  )
}
