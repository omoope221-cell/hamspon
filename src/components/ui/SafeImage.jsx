import { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Same props as <img>, plus optional `fallbackClassName` for the
// placeholder box. Renders a neutral "no image" placeholder instead of
// the browser's broken-image icon when `src` is empty or fails to load —
// covers both "image never uploaded" and "image URL 404s" cases.
export default function SafeImage({ src, alt = '', className = '', fallbackClassName = '', ...rest }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className} ${fallbackClassName}`}>
        <ImageOff size={Math.min(28, 9999)} className="opacity-60" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
