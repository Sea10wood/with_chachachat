import { useEffect } from 'react';
import { sendMessage } from '../types/message';

export const useIframeHeight = () => {
  useEffect(() => {
    const updateHeight = () => {
      const height = document.body.scrollHeight;
      sendMessage({
        type: 'UPDATE_HEIGHT',
        height
      });
    };

    // 初期高さの通知
    updateHeight();

    // リサイズイベントの監視
    window.addEventListener('resize', updateHeight);

    // コンテンツの変更を監視
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('resize', updateHeight);
      observer.disconnect();
    };
  }, []);
}; 