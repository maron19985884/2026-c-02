'use client';

import Image from 'next/image';
import { useState } from 'react';

interface BookCoverImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fill?: boolean;
}

export default function BookCoverImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
}: BookCoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${fill ? 'absolute inset-0' : ''} ${className ?? ''}`}
        style={fill ? undefined : { width, height }}
      >
        <div className="text-center p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mx-auto mb-1 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-xs">No Image</span>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover ${className ?? ''}`}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
