import { useEffect, useState } from 'react';
import { Newspaper, CalendarDays, MapPin, Clock } from 'lucide-react';
import { publicApi } from '../../api/public';
import Reveal from '../../components/ui/Reveal';
import SafeImage from '../../components/ui/SafeImage';

const COPY = {
  news: {
    icon: Newspaper,
    heroTitle: 'School News',
    heroSubtitle: 'Announcements, achievements, and updates from around the school.',
    emptyTitle: 'No News Published Yet',
    emptyBody: 'Check back soon for the latest updates.',
  },
  event: {
    icon: CalendarDays,
    heroTitle: 'School Events',
    heroSubtitle: 'Upcoming activities, ceremonies, and dates to remember.',
    emptyTitle: 'No Events Published Yet',
    emptyBody: 'Check back soon for upcoming events.',
  },
};

function fmtDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsEventsList({ type }) {
  const [items, setItems] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const copy = COPY[type];
  const Icon = copy.icon;

  useEffect(() => {
    setItems(null);
    publicApi.getNewsEvents(type).then((r) => setItems(r.data)).catch(() => setItems([]));
  }, [type]);

  return (
    <div className="bg-white">
      <section className="relative min-h-[45vh] flex items-center justify-center bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-in">
          <div className="hero-item flex items-center justify-center gap-2 mb-3">
            <Icon className="h-6 w-6 text-pink-300" />
          </div>
          <h1 className="hero-item text-3xl md:text-5xl font-extrabold text-white tracking-wide mb-4 uppercase">
            {copy.heroTitle}
          </h1>
          <p className="hero-item text-blue-100 text-base md:text-lg">{copy.heroSubtitle}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {items === null ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <Reveal className="text-center py-16">
              <Icon className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{copy.emptyTitle}</h3>
              <p className="text-gray-500">{copy.emptyBody}</p>
            </Reveal>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const isOpen = expandedId === item._id;
                return (
                  <Reveal key={item._id}>
                    <article className="card-hover rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-white">
                      <div className="md:flex">
                        {item.image && (
                          <div className="md:w-64 shrink-0 img-frame" style={{ aspectRatio: '4 / 3' }}>
                            <SafeImage src={item.image} alt={item.title} className="w-full h-full object-cover img-zoom" />
                          </div>
                        )}
                        <div className="p-6 flex-1">
                          {item.featured && (
                            <span className="inline-block mb-2 text-[11px] font-bold uppercase tracking-wider text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                          )}
                          <h2 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h2>

                          {type === 'event' && (
                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mb-3">
                              {item.eventDate && (
                                <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {fmtDate(item.eventDate)}</span>
                              )}
                              {item.eventTime && (
                                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {item.eventTime}</span>
                              )}
                              {item.location && (
                                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {item.location}</span>
                              )}
                            </div>
                          )}
                          {type === 'news' && item.publishedAt && (
                            <p className="text-xs text-gray-400 mb-3">{fmtDate(item.publishedAt)}</p>
                          )}

                          <p className="text-gray-600 leading-relaxed">
                            {isOpen || !item.summary ? item.content : item.summary}
                          </p>

                          {(item.summary || item.content.length > 200) && (
                            <button
                              onClick={() => setExpandedId(isOpen ? null : item._id)}
                              className="btn-animated mt-3 text-sm font-semibold text-blue-600 hover:text-pink-500"
                            >
                              {isOpen ? 'Show less' : 'Read more →'}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
