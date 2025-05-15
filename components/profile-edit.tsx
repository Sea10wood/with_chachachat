"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ProfileEdit() {
  const supabase = createClientComponentClient()
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ユーザーが見つかりません")

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (profile) {
        setName(profile.name || '')
        setAvatarUrl(profile.avatar_url)
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ユーザーが見つかりません")

      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)

      if (error) throw error
      alert('プロフィールを更新しました')
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      alert('プロフィールの更新に失敗しました')
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setIsLoading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('画像を選択してください')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileSize = file.size / 1024 / 1024 // MBに変換

      if (fileSize > 2) {
        throw new Error('ファイルサイズは1MB以下にしてください')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ユーザーが見つかりません")

      // 古いアバターを削除
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      alert('アバターを更新しました')
    } catch (error) {
      console.error('アバターアップロードエラー:', error)
      alert('アバターの更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">プロフィール編集</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-48 mb-4">
            <Image
              src={avatarUrl || '/user.png'}
              alt="プロフィール画像"
              fill
              className="rounded-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <label className="cursor-pointer bg-send-button text-gray-700 px-4 py-2 rounded-lg hover:bg-send-button/80 transition-colors">
              <span>画像を選択</span>
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={isLoading}
                className="hidden"
              />
            </label>
            {isLoading && <p className="text-sm text-gray-500">アップロード中...</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              ユーザー名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-send-button text-gray-700 rounded-lg hover:bg-send-button/80 transition-colors"
          >
            保存
          </button>
        </form>
      </div>
    </div>
  )
} 