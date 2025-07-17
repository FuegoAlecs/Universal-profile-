"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { shortenAddress } from "@/lib/utils"
import { useAlchemyProfile } from "@/hooks/useAlchemyProfile"
import { useAlchemyNftApi } from "@/hooks/useAlchemyNftApi"
import { useAlchemyTokenBalances } from "@/hooks/useAlchemyTokenBalances"
import { useAlchemyActivity } from "@/hooks/useAlchemyActivity"
import { NFTGallery } from "./NFTGallery"
import { WalletPortfolio } from "./WalletPortfolio"
import { ActivityFeed } from "./ActivityFeed"
import { ProfileHeader } from "./ProfileHeader"
import { SocialLinks } from "./SocialLinks"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShareProfileCard } from "./ShareProfileCard"
import { useAccount } from "wagmi"
import { fetchProfileData } from "@/lib/profile-service"

interface ProfileCardProps {
  address: string
}

export function ProfileCard({ address }: ProfileCardProps) {
  const { address: connectedAddress } = useAccount()
  const { profile, loading: profileLoading, error: profileError } = useAlchemyProfile(address)
  const { nfts, loading: nftsLoading, error: nftsError } = useAlchemyNftApi(address)
  const { balances, loading: balancesLoading, error: balancesError } = useAlchemyTokenBalances(address)
  const { activity, loading: activityLoading, error: activityError } = useAlchemyActivity(address)

  const [contractProfile, setContractProfile] = useState<{
    name: string
    bio: string
    profileImageUri: string
    exists: boolean
  } | null>(null)
  const [contractProfileLoading, setContractProfileLoading] = useState(true)
  const [contractProfileError, setContractProfileError] = useState<string | null>(null)

  useEffect(() => {
    const getContractProfile = async () => {
      setContractProfileLoading(true)
      try {
        const data = await fetchProfileData(address)
        setContractProfile(data)
      } catch (err: any) {
        setContractProfileError(err.message || "Failed to fetch contract profile")
      } finally {
        setContractProfileLoading(false)
      }
    }
    getContractProfile()
  }, [address])

  const profileCardRef = useRef<HTMLDivElement>(null)

  const isLoading = profileLoading || nftsLoading || balancesLoading || activityLoading || contractProfileLoading
  const hasError = profileError || nftsError || balancesError || activityError || contractProfileError

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8 p-6 animate-pulse">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4 bg-gray-200 rounded-full" />
          <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-full" />
          <div className="h-48 bg-gray-200 rounded w-full" />
          <div className="h-48 bg-gray-200 rounded w-full" />
        </CardContent>
      </Card>
    )
  }

  if (hasError) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8 p-6 text-center text-red-500">
        <CardTitle>Error Loading Profile</CardTitle>
        <CardContent>
          <p>There was an error fetching profile data:</p>
          <p>{profileError || nftsError || balancesError || activityError || contractProfileError}</p>
          <p>Please ensure your Alchemy API key is correct and the address is valid.</p>
        </CardContent>
      </Card>
    )
  }

  const displayName = contractProfile?.exists ? contractProfile.name : profile?.ensName || shortenAddress(address)
  const displayBio = contractProfile?.exists ? contractProfile.bio : "No bio available."
  const displayProfileImage = contractProfile?.exists
    ? contractProfile.profileImageUri
    : profile?.ensAvatar || "/placeholder-user.jpg"

  return (
    <div className="w-full max-w-4xl mx-auto my-8 p-6">
      <Card ref={profileCardRef} className="relative overflow-hidden">
        <CardHeader className="flex flex-col items-center text-center p-6">
          <ProfileHeader
            address={address}
            ensName={profile?.ensName}
            ensAvatar={profile?.ensAvatar}
            contractProfileName={contractProfile?.name}
            contractProfileImageUri={contractProfile?.profileImageUri}
          />
          <p className="text-muted-foreground mt-2">{displayBio}</p>
          <SocialLinks />
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <Tabs defaultValue="nfts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nfts">NFTs</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="nfts" className="mt-4">
              <NFTGallery nfts={nfts} />
            </TabsContent>
            <TabsContent value="tokens" className="mt-4">
              <WalletPortfolio balances={balances} />
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <ActivityFeed activity={activity} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {connectedAddress === address && (
        <div className="mt-6 flex justify-center">
          <ShareProfileCard profileCardRef={profileCardRef} address={address} />
        </div>
      )}
    </div>
  )
}
