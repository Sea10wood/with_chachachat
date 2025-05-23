import { render, screen, cleanup, act } from '@testing-library/react';
import ChatUI from '@/components/chats/chat';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabaseのモック
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: {
            name: 'テストユーザー',
            avatar_url: '/test-avatar.jpg',
          },
        }),
      }),
    }),
  }),
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => mockSupabaseClient),
}));

describe('ChatUI', () => {
  const mockChatData = {
    id: '1',
    message: 'こんにちは',
    uid: 'test-user-id',
    is_ai_response: true,
    created_at: '2024-03-20T12:00:00Z',
    channel: 'test-channel',
    parent_message_id: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('メッセージを正しく表示する', async () => {
    await act(async () => {
      render(<ChatUI chatData={mockChatData} index={0} />);
    });
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
  });

  it('AIの応答を正しく表示する', async () => {
    await act(async () => {
      render(<ChatUI chatData={mockChatData} index={0} />);
    });
    const messageContainer = screen.getByText('こんにちは').closest('div');
    expect(messageContainer).toHaveClass('bg-ai-message', 'dark:bg-ai-message/40');
  });

  it('初期ロード時のアニメーションが適用される', async () => {
    await act(async () => {
      render(<ChatUI chatData={mockChatData} index={0} isInitialLoad={true} />);
    });

    // メッセージコンテナを取得
    const messageContainer = screen.getByText('こんにちは').closest('div');
    const outerContainer = messageContainer?.parentElement;

    // 初期ロード時のアニメーション用クラスが適用されているか確認
    expect(outerContainer).toHaveClass('opacity-0');
  });
}); 