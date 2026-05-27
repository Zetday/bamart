'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
  const [prevPath, setPrevPath] = useState(currentPath);

  if (currentPath !== prevPath) {
    setPrevPath(currentPath);
    setIsNavigating(false);
  }

  useEffect(() => {
    // 1. Intercept all internal anchor clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor) {
        const href = anchor.getAttribute('href');
        const targetAttr = anchor.getAttribute('target');

        // Check if it's a valid local client-side navigation
        if (
          href &&
          !href.startsWith('http') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          !href.startsWith('#') &&
          targetAttr !== '_blank' &&
          !e.defaultPrevented &&
          e.button === 0 && // Left click only
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          const currentUrl = window.location.pathname + window.location.search;
          const targetUrl = new URL(href, window.location.origin);
          const targetPath = targetUrl.pathname + targetUrl.search;

          // Only trigger if navigation is to a different route/query
          if (currentUrl !== targetPath) {
            setIsNavigating(true);
          }
        }
      }
    };

    // 2. Listen to custom page-navigation-start event
    const handleCustomStart = () => {
      setIsNavigating(true);
    };

    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('page-navigation-start', handleCustomStart);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('page-navigation-start', handleCustomStart);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-99999 pointer-events-none">
      <div className="h-[3px] bg-linear-to-r from-purple-500 via-fuchsia-500 to-[#7D1972] shadow-[0_1px_10px_rgba(125,25,114,0.5)] animate-progress-bar" />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progress-bar-loading {
            0% { width: 0%; }
            20% { width: 40%; }
            50% { width: 70%; }
            80% { width: 90%; }
            99% { width: 98%; }
            100% { width: 100%; }
          }
          .animate-progress-bar {
            animation: progress-bar-loading 10s cubic-bezier(0.1, 0.8, 0.1, 1) forwards;
          }
        `
      }} />
    </div>
  );
}
