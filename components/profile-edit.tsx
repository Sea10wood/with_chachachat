"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function ProfileEdit() {
  const supabase = createClientComponentClient()
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user == null) {
          setIsLoading(false)
          return
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq("id", user.id)
          .single()

        if (error) {
          console.error(error)
          setIsLoading(false)
          return
        }

        if (profile) {
          setName(profile.name)
          setAvatarUrl(profile.avatar_url)
        }
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        setIsLoading(false)
      }
    }

    getData()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user == null) {
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id)

      if (error) {
        console.error(error)
        return
      }

      alert('プロフィールを更新しました')
    } catch (error) {
      console.error(error)
    }
  }

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user == null) {
        return
      }

      const file = e.target.files?.[0]
      if (!file) {
        return
      }

      // ファイルサイズをチェック（1MB以下）
      if (file.size > 1024 * 1024) {
        alert('ファイルサイズは1MB以下にしてください');
        return;
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${Math.random()}.${fileExt}`

      // 古いアバター画像を削除
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error(uploadError)
        alert('画像のアップロードに失敗しました')
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error(updateError)
        return
      }

      setAvatarUrl(publicUrl)
      alert('プロフィール画像を更新しました')
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">プロフィール編集</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">プロフィール画像</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="w-16 h-16 relative">
              <Image
                src={avatarUrl || '/user.png'}
                alt="Profile"
                fill
                className="rounded-full object-cover"
                sizes="64px"
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">1MB以下の画像を選択してください</p>
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          更新
        </button>
      </form>
    </div>
  )
} 