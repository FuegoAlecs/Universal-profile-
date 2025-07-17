"use client"

import { ProfileCard } from "@/components/ProfileCard"
import { useParams } from "next/navigation"

export default function ProfilePage() {
  const params = useParams()
  const address = params.address as string

  if (!address) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <p className="text-lg text-red-500">Invalid address provided in URL.</p>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <ProfileCard address={address} />
    </main>
  )
}
