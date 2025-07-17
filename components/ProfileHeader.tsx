import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { shortenAddress } from "@/lib/utils"

interface ProfileHeaderProps {
  address: string
  ensName?: string | null
  ensAvatar?: string | null
  contractProfileName?: string
  contractProfileImageUri?: string
}

export function ProfileHeader({
  address,
  ensName,
  ensAvatar,
  contractProfileName,
  contractProfileImageUri,
}: ProfileHeaderProps) {
  const displayName = contractProfileName || ensName || shortenAddress(address)
  const displayAvatar = contractProfileImageUri || ensAvatar || "/placeholder-user.jpg"

  return (
    <div className="flex flex-col items-center text-center">
      <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
        <AvatarImage src={displayAvatar || "/placeholder.svg"} alt={`${displayName}'s avatar`} />
        <AvatarFallback>{displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold">{displayName}</h1>
      {ensName && ensName !== displayName && (
        <p className="text-lg text-muted-foreground">({shortenAddress(address)})</p>
      )}
    </div>
  )
}
