"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AlchemyProfile } from "@/types/alchemy"
import { Globe, Twitter, Link, Users } from "lucide-react"
import { motion } from "framer-motion"

interface SocialLinksProps {
  profile: AlchemyProfile | null
}

export default function SocialLinks({ profile }: SocialLinksProps) {
  const socialPlatforms = [
    {
      name: "Twitter",
      icon: Twitter,
      handle: profile?.twitterHandle,
      followers: profile?.twitterFollowers,
      url: profile?.twitterHandle ? `https://twitter.com/${profile.twitterHandle}` : "#",
    },
    {
      name: "Lens",
      icon: Globe, // Using Globe as a placeholder for Lens icon
      handle: profile?.lensFollowers ? `Lens Profile` : null, // Placeholder for Lens handle
      followers: profile?.lensFollowers,
      url: "#", // Placeholder URL
    },
    {
      name: "Farcaster",
      icon: Link, // Using Link as a placeholder for Farcaster icon
      handle: profile?.farcasterFollowers ? `Farcaster Profile` : null, // Placeholder for Farcaster handle
      followers: profile?.farcasterFollowers,
      url: "#", // Placeholder URL
    },
    // Add more social platforms as needed
    // { name: "GitHub", icon: Github, handle: "your_github", url: "https://github.com/your_github" },
    // { name: "Instagram", icon: Instagram, handle: "your_instagram", url: "https://instagram.com/your_instagram" },
    // { name: "Facebook", icon: Facebook, handle: "your_facebook", url: "https://facebook.com/your_facebook" },
    // { name: "LinkedIn", icon: Linkedin, handle: "your_linkedin", url: "https://linkedin.com/in/your_linkedin" },
  ].filter((platform) => platform.handle) // Filter out platforms without a handle

  return (
    <div className="p-6 border-t border-slate-700/50">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
          Social Links
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-0">
        {socialPlatforms.length > 0 ? (
          socialPlatforms.map((platform, index) => (
            <motion.a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:bg-slate-700/50 transition-colors duration-300 group"
            >
              <platform.icon className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div>
                <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                  {platform.name}
                </div>
                <div className="text-sm text-slate-400">@{platform.handle}</div>
                {platform.followers !== null && (
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" /> {platform.followers.toLocaleString()} Followers
                  </div>
                )}
              </div>
            </motion.a>
          ))
        ) : (
          <p className="text-slate-500 text-sm">No social links found.</p>
        )}
      </CardContent>
    </div>
  )
}
