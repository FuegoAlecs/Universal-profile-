"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileHeader from "./ProfileHeader"
import SocialLinks from "./SocialLinks"
import NFTGallery from "./NFTGallery"
import ActivityFeed from "./ActivityFeed"
import { useAlchemyProfile } from "@/hooks/useAlchemyProfile"
import { useAlchemyNftApi } from "@/hooks/useAlchemyNftApi"
import { useAlchemyActivity } from "@/hooks/useAlchemyActivity"
import { motion } from "framer-motion"

interface ProfileCardProps {
  address: string
}

export default function ProfileCard({ address }: ProfileCardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const { data: profile, isLoading: profileLoading } = useAlchemyProfile(address)
  const { data: nfts, isLoading: nftsLoading } = useAlchemyNftApi(address)
  const { data: activities, isLoading: activitiesLoading } = useAlchemyActivity(address)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="w-full max-w-6xl mx-auto overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl">
        <ProfileHeader address={address} profile={profile} isLoading={profileLoading} />

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              {["overview", "nfts", "activity", "social"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-cyan-400 text-slate-400 hover:text-slate-200 transition-all duration-300 capitalize"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <h3 className="text-lg font-semibold mb-4 text-cyan-400">Recent NFTs</h3>
                  <NFTGallery nfts={nfts?.slice(0, 6) || []} isLoading={nftsLoading} compact={true} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <h3 className="text-lg font-semibold mb-4 text-purple-400">Recent Activity</h3>
                  <ActivityFeed
                    activities={activities?.slice(0, 5) || []}
                    isLoading={activitiesLoading}
                    compact={true}
                  />
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="nfts" className="mt-6">
              <NFTGallery nfts={nfts || []} isLoading={nftsLoading} />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <ActivityFeed activities={activities || []} isLoading={activitiesLoading} />
            </TabsContent>

            <TabsContent value="social" className="mt-6">
              <SocialLinks address={address} profile={profile} isLoading={profileLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </motion.div>
  )
}
