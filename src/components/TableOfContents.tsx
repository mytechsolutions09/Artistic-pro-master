'use client';
import { useEffect, useState } from 'react';

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

export default function TableOfContents({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let intersectingId = '';
        for (const entry of entries) {
          if (entry.isIntersecting) {
            intersectingId = entry.target.id;
          }
        }
        if (intersectingId) {
          setActiveId(intersectingId);
        }
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [toc]);

  if (!toc || toc.length === 0) return null;

  return (
    <aside className="w-full lg:w-64 shrink-0 hidden lg:block self-start">
      <div className="sticky top-24">
        <div className="relative">
          <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Table of Contents</h3>
          {/* Grey line container to show active state */}
          <div className="absolute left-0 top-10 bottom-0 w-[2px] bg-gray-100 rounded-full" />
          <nav className="flex flex-col space-y-3 text-[13px] text-gray-500 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full relative">
            {toc.map((item, index) => (
              <a 
                key={index} 
                href={`#${item.id}`} 
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    // smooth scroll with offset
                    window.scrollTo({
                      top: target.offsetTop - 80, // offset for sticky header
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`transition-colors block leading-relaxed relative pl-4 ${item.level === 3 ? 'ml-2' : ''} ${activeId === item.id ? 'text-gray-900 font-medium' : 'hover:text-gray-900'}`}
              >
                {activeId === item.id && (
                  <span className="absolute left-[-16px] top-0 bottom-0 w-[2px] bg-gray-900 rounded-full" />
                )}
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
