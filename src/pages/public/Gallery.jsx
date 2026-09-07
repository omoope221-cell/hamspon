import { useEffect, useState, useMemo } from 'react';
import { ImageOff, X, Film } from 'lucide-react';
import { publicApi } from '../../api/public';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import Reveal from '../../components/ui/Reveal';
import SafeImage from '../../components/ui/SafeImage';

function TourVideo({ url }) {
  if (!url) return null;
  return (
    <Reveal className="max-w-4xl mx-auto mb-16">
      <div className="flex items-center gap-2 justify-center mb-5">
        <Film className="h-5 w-5 text-pink-500" />
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Take a Virtual Tour</h2>
      </div>
      <div className="img-frame card-hover rounded-2xl overflow-hidden shadow-lg" style={{ aspectRatio: '16 / 9' }}>
        <video src={url} controls className="w-full h-full object-cover" />
      </div>
    </Reveal>
  );
}

export default function Gallery() {
  const { settings } = useSiteSettings();
  const [images, setImages] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    publicApi.getGallery().then((r) => setImages(r.data)).catch(() => setImages([]));
  }, []);

  const categories = useMemo(() => {
    if (!images) return ['All'];
    return ['All', ...new Set(images.map((i) => i.category || 'General'))];
  }, [images]);

  const filtered = images?.filter((i) => activeCategory === 'All' || (i.category || 'General') === activeCategory) || [];

  return (
    <div className="bg-white">
      <section className="relative min-h-[60vh] flex items-center justify-center bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-in">
          <h1 className="hero-item text-3xl md:text-5xl font-extrabold text-white tracking-wide mb-4 uppercase">
            Gallery
          </h1>
          <p className="hero-item text-blue-100 text-lg max-w-2xl mx-auto">
            Moments from campus life — events, facilities, and everyday learning.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TourVideo url={settings.tourVideoUrl} />

          {images === null ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : images.length === 0 ? (
            <Reveal className="text-center py-16">
              <ImageOff className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Photos Available Yet</h3>
              <p className="text-gray-500">Check back soon for photos from school life and events.</p>
            </Reveal>
          ) : (
            <>
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`btn-animated px-4 py-1.5 rounded-full text-sm font-medium border ${
                        activeCategory === cat
                          ? 'bg-blue-600 text-white border-transparent'
                          : 'border-gray-200 text-gray-600 hover:border-pink-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((img, idx) => (
                  <Reveal key={img._id} delay={(idx % 8) * 50}>
                    <button
                      onClick={() => setLightbox(img)}
                      className="img-frame card-hover block w-full h-48 rounded-xl relative"
                    >
                      <SafeImage
                        src={img.image}
                        alt={img.caption || ''}
                        loading="lazy"
                        className="img-zoom img-fade-in h-full w-full object-cover"
                      />
                      {img.caption && (
                        <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 text-left">
                          {img.caption}
                        </span>
                      )}
                    </button>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-6 right-6 text-white/80 hover:text-white" aria-label="Close">
            <X size={28} />
          </button>
          <SafeImage src={lightbox.image} alt={lightbox.caption || ''} className="max-h-[85vh] max-w-full rounded-lg img-fade-in" />
          {lightbox.caption && <p className="absolute bottom-8 text-white text-sm">{lightbox.caption}</p>}
        </div>
      )}
    </div>
  );
}
