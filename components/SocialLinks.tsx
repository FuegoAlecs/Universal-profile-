"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { AlchemyProfile } from "@/types/alchemy"
import { Github, Twitter } from "lucide-react"
import { motion } from "framer-motion"

interface SocialLinksProps {
  profile: AlchemyProfile | null
}

export default function SocialLinks({ profile }: SocialLinksProps) {
  const isLoading = !profile

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-cyan-400">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  const socialLinks = profile?.socialLinks || {}
  const hasSocialLinks = Object.values(socialLinks).some((link) => link)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-cyan-400">Social Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {hasSocialLinks ? (
            <>
              {socialLinks.twitter && (
                <Button
                  asChild
                  variant="outline"
                  className="bg-slate-700/50 text-slate-200 border-slate-600/50 hover:bg-slate-600/50 hover:border-cyan-500"
                >
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="mr-2 h-4 w-4" /> Twitter
                  </a>
                </Button>
              )}
              {socialLinks.github && (
                <Button
                  asChild
                  variant="outline"
                  className="bg-slate-700/50 text-slate-200 border-slate-600/50 hover:bg-slate-600/50 hover:border-cyan-500"
                >
                  <a href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </a>
                </Button>
              )}
              {/* Add more social links here as needed */}
            </>
          ) : (
            <p className="text-slate-400">No social links available.</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
