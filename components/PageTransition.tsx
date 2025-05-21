'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // コンテンツの読み込みを待つ
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const ctx = gsap.context(() => {
      // 初期状態を設定
      gsap.set(containerRef.current, {
        opacity: 0,
        y: 30,
      });

      // アニメーション
      gsap.to(containerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        onComplete: () => {
          // アニメーション完了後の処理
          gsap.set(containerRef.current, { clearProps: 'all' });
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isReady]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen"
      style={{
        opacity: 0,
        transform: 'translateY(30px)',
      }}
    >
      {children}
    </div>
  );
}
