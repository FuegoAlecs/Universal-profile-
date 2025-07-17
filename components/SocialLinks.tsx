"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Twitter, MessageCircle, Users, Wifi, WifiOff } from "lucide-react"
import type { AlchemyProfile } from "@/types/alchemy"
import { motion } from "framer-motion"

interface SocialLinksProps {
  address: string
  profile?: AlchemyProfile
  isLoading: boolean
}

export default function SocialLinks({ address, profile, isLoading }: SocialLinksProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-slate-800/50" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2 bg-slate-800/50" />
                <Skeleton className="h-4 w-2/3 bg-slate-800/50" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  const socialPlatforms = [
    {
      name: "ENS",
      handle: profile?.ens,
      url: profile?.ens ? `https://app.ens.domains/name/${profile.ens}` : null,
      icon: <Users className="h-5 w-5" />,
      description: "Ethereum Name Service",
      color: "from-blue-500 to-cyan-500",
      strength: profile?.ens ? 95 : 0,
    },
    {
      name: "Lens Protocol",
      handle: profile?.lens,
      url: profile?.lens ? `https://lenster.xyz/u/${profile.lens}` : null,
      icon: <MessageCircle className="h-5 w-5" />,
      description: "Decentralized social graph",
      color: "from-green-500 to-emerald-500",
      strength: profile?.lens ? 87 : 0,
    },
    {
      name: "Farcaster",
      handle: profile?.farcaster,
      url: profile?.farcaster ? `https://warpcast.com/${profile.farcaster}` : null,
      icon: <Twitter className="h-5 w-5" />,
      description: "Decentralized social network",
      color: "from-purple-500 to-pink-500",
      strength: profile?.farcaster ? 72 : 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-6 text-cyan-400">Neural Network Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialPlatforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 },
              }}
            >
              <Card
                className={`relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border transition-all duration-500 ${
                  platform.handle ? "border-green-500/30 shadow-lg shadow-green-500/10" : "border-slate-700/50"
                }`}
              >
                {/* Connection strength indicator */}
                {platform.handle && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`p-3 rounded-xl bg-gradient-to-r ${platform.color} text-white shadow-lg`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {platform.icon}
                    </motion.div>
                    <div className="flex-1">
                      <CardTitle className="text-sm text-white">{platform.name}</CardTitle>
                      <p className="text-xs text-slate-400">{platform.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {platform.handle ? (
                        <Wifi className="h-4 w-4 text-green-400" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {platform.handle ? (
                    <div className="space-y-4">
                      <div>
                        <Badge className="mb-3 bg-green-500/20 text-green-400 border border-green-500/30">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            className="w-2 h-2 bg-green-400 rounded-full mr-2"
                          />
                          Connected
                        </Badge>
                        <p className="font-medium text-sm text-white mb-2">@{platform.handle}</p>

                        {/* Connection strength bar */}
                        <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${platform.strength}%` }}
                            transition={{ duration: 1, delay: index * 0.2 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${platform.color}`}
                          />
                        </div>
                        <p className="text-xs text-slate-400">Signal Strength: {platform.strength}%</p>
                      </div>

                      {platform.url && (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="w-full bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-300"
                          >
                            <a
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              Access Neural Link
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500 mb-3">Neural link offline</p>
                      <Badge variant="outline" className="border-slate-600 text-slate-400">
                        No signal detected
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-400">Identity Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <motion.div
                className="flex items-center justify-between p-4 bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700/30"
                whileHover={{ scale: 1.02 }}
              >
                <div>
                  <p className="font-medium text-sm text-white">Primary Address</p>
                  <code className="text-xs text-slate-400 font-mono">{address}</code>
                </div>
                <Badge className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Primary Node</Badge>
              </motion.div>

              {profile?.ens && (
                <motion.div
                  className="flex items-center justify-between p-4 bg-blue-500/10 backdrop-blur-sm rounded-lg border border-blue-500/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div>
                    <p className="font-medium text-sm text-white">ENS Identity</p>
                    <p className="text-sm text-blue-400">{profile.ens}</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">ENS</Badge>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
