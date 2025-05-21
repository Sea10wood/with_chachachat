import '@testing-library/jest-dom';

// Supabaseのモック
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
          },
        },
      }),
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
            },
          },
        },
      }),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-user-id',
              name: 'Test User',
              avatar_url: '/user.webp',
            },
          }),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-message-id',
              message: 'Test message',
              created_at: new Date().toISOString(),
            },
          }),
        })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn().mockReturnValue({
          data: {
            publicUrl: '/user.webp',
          },
        }),
      })),
    },
  }),
  createServerComponentClient: jest.fn(),
  createRouteHandlerClient: jest.fn(),
}));

// OpenAIのモック
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'AI response',
              },
            },
          ],
        }),
      },
    },
  })),
}));

// Next.jsのモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// グローバルなモック
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
