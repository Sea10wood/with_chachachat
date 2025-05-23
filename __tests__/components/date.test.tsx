import { render, screen } from '@testing-library/react';
import DateFormatter from '@/components/date';

describe('DateFormatter', () => {
  it('日付が正しくフォーマットされて表示される', () => {
    render(<DateFormatter dateString="2024-03-20T12:00:00Z" />);
    
    // 日本語の日付形式で表示されることを確認
    expect(screen.getByText('2024/3/20 21:00:00')).toBeInTheDocument();
  });

  it('無効な日付の場合は空文字を表示', () => {
    render(<DateFormatter dateString="invalid-date" />);
    expect(screen.getByText('')).toBeInTheDocument();
  });

  it('日付が指定されていない場合は空文字を表示', () => {
    render(<DateFormatter dateString="" />);
    expect(screen.getByText('')).toBeInTheDocument();
  });
}); 