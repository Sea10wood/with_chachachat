import { render, screen, fireEvent } from '@testing-library/react';
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

  it('パスワード表示切り替えボタンが正しく表示される', () => {
    render(<Input name="test" type="password" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('パスワード表示切り替えボタンクリック時にtogglePasswordVisibilityが呼ばれる', () => {
    const handleToggle = jest.fn();
    render(<Input name="test" type="password" togglePasswordVisibility={handleToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalled();
  });

  it('パスワード表示状態に応じて適切なアイコンが表示される', () => {
    const { rerender } = render(<Input name="test" type="password" showPassword={false} />);
    expect(screen.getByTitle('パスワードを表示')).toBeInTheDocument();

    rerender(<Input name="test" type="password" showPassword={true} />);
    expect(screen.getByTitle('パスワードを隠す')).toBeInTheDocument();
  });

  it('カスタムクラスが正しく適用される', () => {
    render(<Input name="test" className="custom-class" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-class');
  });
}); 