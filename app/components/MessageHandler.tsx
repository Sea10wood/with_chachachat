import { useEffect, useCallback } from 'react';

interface MessageHandlerProps {
  onHeightUpdate?: (height: number) => void;
}

const ALLOWED_ORIGIN = 'http://localhost:3000';

export function MessageHandler({ onHeightUpdate }: MessageHandlerProps) {
  const sendMessage = useCallback((type: string, data: any) => {
    if (window.parent !== window) {
      console.log('送信するメッセージ:', { type, ...data });
      console.log('送信先オリジン:', ALLOWED_ORIGIN);
      window.parent.postMessage(
        { type, ...data },
        ALLOWED_ORIGIN
      );
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    // オリジンの検証
    if (event.origin !== ALLOWED_ORIGIN) {
      console.warn('許可されていないオリジンからのメッセージ:', event.origin);
      return;
    }

    const { type, ...data } = event.data;
    console.log('受信したメッセージ:', { origin: event.origin, data });

    switch (type) {
      case 'INIT':
        console.log('初期化メッセージを受信:', data);
        // 初期化処理
        break;

      case 'UPDATE_HEIGHT':
        if (onHeightUpdate) {
          onHeightUpdate(data.height);
        }
        break;

      default:
        console.warn('未知のメッセージタイプ:', type);
    }
  }, [onHeightUpdate]);

  useEffect(() => {
    // メッセージリスナーの登録
    window.addEventListener('message', handleMessage);

    // 初期化メッセージの送信
    if (window.parent !== window) {
      sendMessage('INIT', {
        parentOrigin: window.location.origin,
      });
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage, sendMessage]);

  return null;
} 