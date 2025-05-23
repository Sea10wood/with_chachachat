import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/atoms/Button/Button';

describe('Button', () => {
  it('クリック時にonClickが呼ばれる', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>テストボタン</Button>);
    fireEvent.click(screen.getByText('テストボタン'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('disabled時はクリックできない', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        テストボタン
      </Button>
    );
    fireEvent.click(screen.getByText('テストボタン'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('loading時はボタンが無効化される', () => {
    render(<Button isLoading>テストボタン</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('loading時はローディングアイコンとテキストが表示される', () => {
    render(<Button isLoading>テストボタン</Button>);
    const button = screen.getByRole('button');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(button).toHaveTextContent('処理中...');
  });

  it('variantに応じて適切なクラスが適用される', () => {
    const { rerender } = render(<Button variant="primary">テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toHaveClass('bg-send-button');

    rerender(<Button variant="secondary">テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toHaveClass('bg-transparent');

    rerender(<Button variant="danger">テストボタン</Button>);
    expect(screen.getByText('テストボタン')).toHaveClass('bg-red-500');
  });
}); 