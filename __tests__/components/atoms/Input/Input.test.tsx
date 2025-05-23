import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/atoms/Input/Input';

describe('Input', () => {
  it('入力フィールドが正しく表示される', () => {
    render(<Input name="test" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('ラベルが正しく表示される', () => {
    render(<Input name="test" label="テスト" />);
    expect(screen.getByText('テスト')).toBeInTheDocument();
  });

  it('エラーメッセージが正しく表示される', () => {
    render(<Input name="test" error="エラーメッセージ" />);
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
  });

  it('ヘルプテキストが正しく表示される', () => {
    render(<Input name="test" helperText="ヘルプテキスト" />);
    expect(screen.getByText('ヘルプテキスト')).toBeInTheDocument();
  });

  describe('パスワード入力フィールド', () => {
    it('パスワード表示切り替えボタンが表示される', () => {
      render(<Input name="test" type="password" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('パスワード表示切り替えボタンクリック時にパスワード表示が切り替わる', async () => {
      const user = userEvent.setup();
      render(<Input name="test" type="password" />);
      
      const input = screen.getByTestId('password-input');
      const button = screen.getByRole('button');
      
      expect(input).toHaveAttribute('type', 'password');
      
      await user.click(button);
      expect(input).toHaveAttribute('type', 'text');
      
      await user.click(button);
      expect(input).toHaveAttribute('type', 'password');
    });

    it('パスワード表示状態に応じて適切なアイコンが表示される', async () => {
      const user = userEvent.setup();
      render(<Input name="test" type="password" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'パスワードを表示');
      
      await user.click(button);
      expect(button).toHaveAttribute('aria-label', 'パスワードを隠す');
    });

    it('パスワード入力フィールドのスタイルが正しく適用される', () => {
      render(<Input name="test" type="password" />);
      const input = screen.getByTestId('password-input');
      expect(input).toHaveClass('pr-10');
    });
  });

  it('カスタムクラスが正しく適用される', () => {
    render(<Input name="test" className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });
}); 