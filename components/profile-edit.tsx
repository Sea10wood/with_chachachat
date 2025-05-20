"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabasetype"
import { useEffect, useState } from "react"
import Image from "next/image"
import ErrorModal from "./modal/errorModal";
import { useRouter } from "next/navigation";

export default function ProfileEdit() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [name, setName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // プロフィールが存在しない場合は作成
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: '新しいユーザー',
              avatar_url: '/user.webp',
              updated_at: new Date().toISOString()
            })
          
          if (createError) throw createError
          
          setName('新しいユーザー')
          setAvatarUrl('/user.webp')
        } else {
          throw error
        }
      } else if (profile) {
        setName(profile.name || '')
        setAvatarUrl(profile.avatar_url)
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
      setError("プロフィールの取得に失敗しました")
      setShowErrorModal(true)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ユーザーが見つかりません")

      const { error } = await supabase
        .from('profiles')
        .update({ 
          name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error
      setSuccessMessage("プロフィールを更新しました")
      setError(null)
      setShowErrorModal(true)
      router.push('/chats')
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      setError("プロフィールの更新に失敗しました")
      setSuccessMessage(null)
      setShowErrorModal(true)
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

      if (fileSize > 1) {
        throw new Error('ファイルサイズは1MB以下にしてください')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("ユーザーが見つかりません")

      // 古いアバターを削除
      if (avatarUrl && avatarUrl.startsWith('http')) {
        const oldPath = avatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      const filePath = `${user.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setSuccessMessage("アバターを更新しました")
      setError(null)
      setShowErrorModal(true)
      router.push('/chats')
    } catch (error) {
      console.error('アバターアップロードエラー:', error)
      setError("アバターの更新に失敗しました")
      setSuccessMessage(null)
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4 text-black">プロフィール編集</h1>
      <div className="bg-chat-bg rounded-lg shadow p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-48 mb-4">
            <Image
              src={avatarUrl || '/user.webp'}
              alt="プロフィール画像"
              fill
              className="rounded-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
              unoptimized
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/user.webp';
              }}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <label className="cursor-pointer bg-send-button text-black px-4 py-2 rounded-lg hover:bg-loading-color transition-colors">
              <span>画像を選択</span>
              <input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={isLoading}
                className="hidden"
              />
            </label>
            {isLoading && <p className="text-sm text-black/70">アップロード中...</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black mb-1">
              ユーザー名
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-input-bg border border-send-button text-black rounded-md focus:outline-none focus:ring-2 focus:ring-send-button"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-send-button text-black py-2 px-4 rounded-lg hover:bg-loading-color transition-colors"
          >
            更新
          </button>
        </form>
      </div>
      {showErrorModal && (
        <ErrorModal
          message={error || successMessage || ""}
          showModal={setShowErrorModal}
          isError={!!error}
        />
      )}
    </div>
  );
} 