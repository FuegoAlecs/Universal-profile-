"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { Twitter, Github, Globe } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { profileService } from "@/lib/profile-service" // Assuming a profile service for social links

interface SocialLinksProps {
  address: string
}

interface SocialLink {
  platform: string
  handle: string
  icon: React.ElementType
  urlPrefix: string
}

const socialPlatforms: SocialLink[] = [
  { platform: "twitter", handle: "web3user", icon: Twitter, urlPrefix: "https://twitter.com/" },
  { platform: "github", handle: "web3dev", icon: Github, urlPrefix: "https://github.com/" },
  { platform: "website", handle: "myprofile.com", icon: Globe, urlPrefix: "https://" },
]

export default function SocialLinks({ address }: SocialLinksProps) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(socialPlatforms)
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null)
  const [newHandle, setNewHandle] = useState<string>("")
  const { toast } = useToast()

  // In a real app, you'd fetch actual social links from your backend/contract
  useEffect(() => {
    // Example: Fetch social links from profileService
    // profileService.getSocialLinks(address).then(links => {
    //   const updatedLinks = socialPlatforms.map(platform => {
    //     const found = links.find(l => l.platform === platform.platform);
    //     return found ? { ...platform, handle: found.handle } : platform;
    //   });
    //   setSocialLinks(updatedLinks);
    // });
  }, [address])

  const handleEditClick = (platform: string, currentHandle: string) => {
    setEditingPlatform(platform)
    setNewHandle(currentHandle)
  }

  const handleSave = async () => {
    if (!editingPlatform) return

    try {
      // Simulate API call to update social link
      const success = await profileService.updateProfileSocialLink(address, editingPlatform, newHandle)

      if (success) {
        setSocialLinks((prevLinks) =>
          prevLinks.map((link) => (link.platform === editingPlatform ? { ...link, handle: newHandle } : link)),
        )
        toast({
          title: "Social Link Updated",
          description: `${editingPlatform} handle saved successfully.`,
        })
      } else {
        toast({
          title: "Update Failed",
          description: `Could not update ${editingPlatform} handle.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving social link:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      })
    } finally {
      setEditingPlatform(null)
      setNewHandle("")
    }
  }

  return (
    <div className="bg-slate-900/50 border-slate-700/50 p-4">
      <div className="text-xl text-cyan-400 mb-4">Social Links</div>
      <div className="space-y-4">
        {socialLinks.map((link) => (
          <div key={link.platform} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <link.icon className="h-5 w-5 text-slate-400" />
              <span className="text-slate-300 capitalize">{link.platform}:</span>
              {link.handle ? (
                <a
                  href={`${link.urlPrefix}${link.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {link.handle}
                </a>
              ) : (
                <span className="text-slate-500 italic">Not linked</span>
              )}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-300 hover:text-white border-slate-700 hover:border-cyan-500 transition-colors duration-300 bg-transparent"
                  onClick={() => handleEditClick(link.platform, link.handle)}
                >
                  {link.handle ? "Edit" : "Add"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white">
                <DialogHeader>
                  <DialogTitle className="text-cyan-400">
                    {editingPlatform ? `Edit ${editingPlatform} Handle` : "Add Social Link"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Update your social media handle for {editingPlatform}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="handle" className="text-right text-slate-300">
                      Handle
                    </Label>
                    <Input
                      id="handle"
                      value={newHandle}
                      onChange={(e) => setNewHandle(e.target.value)}
                      className="col-span-3 bg-slate-800/50 border-slate-700 text-slate-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white"
                  >
                    Save changes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
      <div className="flex space-x-4 mt-4">
        <Button variant="outline" size="icon" aria-label="Twitter">
          <Twitter className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" aria-label="GitHub">
          <Github className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Website">
          <Globe className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
