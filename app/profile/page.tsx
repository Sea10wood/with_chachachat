"use client"
import ProfileEdit from "@/components/profile-edit"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8 text-center">プロフィール設定</h1>
      <ProfileEdit />
    </div>
  )
}