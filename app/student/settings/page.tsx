"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Shield, Brain, Upload, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function SettingsPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [bio, setBio] = useState("")
  const [dob, setDob] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [showCurrentPwd, setShowCurrentPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" })
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weeklyProgress: true,
    courseUpdates: true,
    aiTutorReminders: false
  })
  const [learning, setLearning] = useState({
    aiPersonality: "friendly" as "friendly" | "professional" | "casual",
    difficultyPreference: "adaptive" as "adaptive" | "challenging" | "comfortable",
    studyReminders: true,
    dailyGoal: 60
  })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setFullName(profile?.full_name || user.user_metadata?.full_name || "")
      setEmail(user.email || "")
      setAvatar(profile?.avatar_url || "")
      setBio(profile?.bio || "")
      setDob(profile?.date_of_birth || "")
    }
    load()
  }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setAvatar(localUrl)
    setIsUploadingPhoto(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatar(publicUrl)
      toast.success("Profile photo updated!")
    } catch (err: any) {
      toast.error("Upload failed — make sure 'avatars' bucket is created in Supabase Storage with public access.")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('profiles').update({
        full_name: fullName,
        bio,
        date_of_birth: dob || null
      }).eq('id', user.id)
      if (error) throw error
      toast.success("Profile updated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.current) {
      toast.error("Please enter your current password")
      return
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords don't match")
      return
    }
    if (passwordData.new.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: passwordData.current
      })
      if (signInError) {
        toast.error("Current password is incorrect")
        return
      }
      const { error } = await supabase.auth.updateUser({ password: passwordData.new })
      if (error) throw error
      toast.success("Password updated successfully!")
      setPasswordData({ current: "", new: "", confirm: "" })
    } catch (err: any) {
      toast.error(err.message || "Failed to update password")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and learning preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-accent/20">
                    <AvatarImage src={avatar || undefined} key={avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl">
                      {fullName.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    id="photo-upload"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent/10 text-sm font-medium transition-colors mb-2">
                      <Upload className="w-4 h-4" />
                      {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </div>
                  </label>
                  <p className="text-sm text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled className="bg-muted" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" placeholder="Tell us about yourself..." value={bio} onChange={e => setBio(e.target.value)} />
                </div>
              </div>

              <Button onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPwd ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordData.current}
                    onChange={e => setPasswordData(p => ({ ...p, current: e.target.value }))}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowCurrentPwd(!showCurrentPwd)}>
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPwd ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordData.new}
                    onChange={e => setPasswordData(p => ({ ...p, new: e.target.value }))}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowNewPwd(!showNewPwd)}>
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPwd ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordData.confirm}
                    onChange={e => setPasswordData(p => ({ ...p, confirm: e.target.value }))}
                  />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                    {showConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={handlePasswordChange} disabled={isSaving || !passwordData.current || !passwordData.new}>
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'weeklyProgress', label: 'Weekly Progress', desc: 'Weekly progress summary emails' },
                { key: 'courseUpdates', label: 'Course Updates', desc: 'Updates about your enrolled courses' },
                { key: 'aiTutorReminders', label: 'AI Tutor Reminders', desc: 'Reminders to continue learning' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={checked => setNotifications(p => ({ ...p, [key]: checked }))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Your profile is currently private</p>
                </div>
                <Badge variant="secondary">Private</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the platform with usage analytics</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Tab */}
        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5" />Learning Preferences</CardTitle>
              <CardDescription>Customize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>AI Tutor Personality</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['friendly', 'professional', 'casual'] as const).map(p => (
                    <Button key={p} variant={learning.aiPersonality === p ? 'default' : 'outline'} size="sm"
                      onClick={() => setLearning(prev => ({ ...prev, aiPersonality: p }))}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Difficulty Preference</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['adaptive', 'challenging', 'comfortable'] as const).map(d => (
                    <Button key={d} variant={learning.difficultyPreference === d ? 'default' : 'outline'} size="sm"
                      onClick={() => setLearning(prev => ({ ...prev, difficultyPreference: d }))}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Study Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to study daily</p>
                </div>
                <Switch checked={learning.studyReminders} onCheckedChange={checked => setLearning(p => ({ ...p, studyReminders: checked }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyGoal">Daily Study Goal (minutes)</Label>
                <Input id="dailyGoal" type="number" value={learning.dailyGoal}
                  onChange={e => setLearning(p => ({ ...p, dailyGoal: parseInt(e.target.value) || 0 }))} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
