import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const requestUrl = new URL(request.url)
    const formData = await request.formData()
    const email = String(formData.get('email'))
    const password = String(formData.get('password'))
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/?error=${encodeURIComponent(error.message)}`)
    }

    // プロフィールデータの作成
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                name: '新しいユーザー',
                avatar_url: '/user.webp',
                updated_at: new Date().toISOString()
            })
        
        if (profileError) {
            console.error('プロフィール作成エラー:', profileError)
        }
    }

    return NextResponse.redirect(`${requestUrl.origin}/profile`, {
        status: 301,
    })
}