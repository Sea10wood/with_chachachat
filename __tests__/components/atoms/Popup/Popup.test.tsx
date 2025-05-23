import { render, screen, fireEvent } from '@testing-library/react';
import Popup from '@/components/atoms/Popup';

describe('Popup', () => {
  it('スナップショットテスト', () => {
    const { container } = render(
      <Popup isOpen={true} onClose={() => {}}>
        テストコンテンツ
      </Popup>
    );
    expect(container).toMatchSnapshot();
  });

  it('isOpenがfalseの場合は何も表示されない', () => {
    render(
      <Popup isOpen={false} onClose={() => {}}>
        テストコンテンツ
      </Popup>
    );
    expect(screen.queryByText('テストコンテンツ')).not.toBeInTheDocument();
  });

  it('isOpenがtrueの場合はコンテンツが表示される', () => {
    render(
      <Popup isOpen={true} onClose={() => {}}>
        テストコンテンツ
      </Popup>
    );
    expect(screen.getByText('テストコンテンツ')).toBeInTheDocument();
  });

  it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    const handleClose = jest.fn();
    render(
      <Popup isOpen={true} onClose={handleClose}>
        テストコンテンツ
      </Popup>
    );
    const closeButton = screen.getByTitle('閉じる').closest('button');
    if (!closeButton) {
      throw new Error('閉じるボタンが見つかりません');
    }
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  it('背景をクリックするとonCloseが呼ばれる', () => {
    const handleClose = jest.fn();
    render(
      <Popup isOpen={true} onClose={handleClose}>
        テストコンテンツ
      </Popup>
    );
    const backdrop = screen.getByTestId('popup-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalled();
  });

  it('typeに応じて適切なスタイルが適用される', () => {
    const { rerender } = render(
      <Popup isOpen={true} onClose={() => {}}>
        テストコンテンツ
      </Popup>
    );

    const contentContainer = screen.getByText('テストコンテンツ').closest('div');
    expect(contentContainer).toHaveClass('bg-chat-bg', 'text-gray-700');

    rerender(
      <Popup isOpen={true} onClose={() => {}} type="warning">
        テストコンテンツ
      </Popup>
    );
    expect(contentContainer).toHaveClass('bg-yellow-50', 'text-yellow-700');

    rerender(
      <Popup isOpen={true} onClose={() => {}} type="error">
        テストコンテンツ
      </Popup>
    );
    expect(contentContainer).toHaveClass('bg-red-50', 'text-red-700');
  });
}); 