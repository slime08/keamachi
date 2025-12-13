// client/src/components/common/FacilityImage.tsx
import React from 'react';

type Props = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

export default function FacilityImage({ imageUrl, alt, className }: Props) {
  const hasUrl = typeof imageUrl === 'string' && imageUrl.trim().length > 0;
  const src = hasUrl ? imageUrl! : '/no-image.svg';

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={(e) => {
        const img = e.currentTarget;
        // 無限ループ防止：すでにfallback済みなら何もしない
        if (img.getAttribute('data-fallback') === '1') return;
        img.setAttribute('data-fallback', '1');
        img.src = '/no-image.svg';
      }}
    />
  );
}
