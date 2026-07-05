import React from 'react';

interface PageSkeletonProps {
  title?: boolean;
  description?: boolean;
  content?: 'table' | 'form' | 'cards';
}

export default function PageSkeleton({ title = true, description = true, content = 'table' }: PageSkeletonProps) {
  return (
    <div className="space-y-6 p-6">
      {title && <div className="h-8 w-48 bg-surface rounded animate-pulse" />}
      {description && <div className="h-4 w-72 bg-surface rounded animate-pulse" />}
      
      <div className="mt-6">
        {content === 'table' && (
          <div className="space-y-3">
            <div className="h-10 bg-surface rounded animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-surface rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        )}
        
        {content === 'form' && (
          <div className="space-y-4 max-w-2xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-surface rounded animate-pulse" />
                <div className="h-10 w-full bg-surface rounded animate-pulse" />
              </div>
            ))}
            <div className="h-10 w-32 bg-primary/50 rounded animate-pulse mt-4" />
          </div>
        )}
        
        {content === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface rounded animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
