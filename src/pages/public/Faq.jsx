import { useEffect, useMemo, useState } from 'react';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';
import { publicApi } from '../../api/public';
import Reveal from '../../components/ui/Reveal';

export default function Faq() {
  const [faqs, setFaqs] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    publicApi.getFaqs().then((r) => setFaqs(r.data)).catch(() => setFaqs([]));
  }, []);

  const categories = useMemo(() => {
    if (!faqs) return ['All'];
    return ['All', ...new Set(faqs.map((f) => f.category || 'General'))];
  }, [faqs]);

  const filtered = (faqs || []).filter((f) => {
    const matchesCategory = activeCategory === 'All' || (f.category || 'General') === activeCategory;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-white">
      <section className="relative min-h-[55vh] flex items-center justify-center bg-blue-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center hero-in">
          <h1 className="hero-item text-3xl md:text-5xl font-extrabold text-white tracking-wide mb-6 uppercase">
            Frequently Asked Questions
          </h1>
          <div className="hero-item relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-12 pr-4 py-3.5 rounded-full border-0 shadow-lg focus:ring-2 focus:ring-pink-400 outline-none"
            />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs === null ? (
            <div className="space-y-4">{[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : faqs.length === 0 ? (
            <Reveal className="text-center py-16">
              <HelpCircle className="h-14 w-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No FAQs Published Yet</h3>
              <p className="text-gray-500">Check back soon, or reach out via our Contact page.</p>
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

              {filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No questions match "{query}".</p>
              ) : (
                <div className="space-y-4">
                  {filtered.map((faq, idx) => {
                    const isOpen = openId === faq._id;
                    return (
                      <Reveal key={faq._id} delay={idx * 40}>
                        <div className="card-hover bg-gray-50 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setOpenId(isOpen ? null : faq._id)}
                            className="w-full flex items-center justify-between gap-4 p-5 text-left"
                          >
                            <span className="font-bold text-gray-900">{faq.question}</span>
                            <ChevronDown className={`h-5 w-5 text-blue-600 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <div
                            className="grid transition-all duration-300 ease-in-out"
                            style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                          >
                            <div className="overflow-hidden">
                              <p className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
