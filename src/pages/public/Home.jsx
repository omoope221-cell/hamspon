// Home.jsx
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen, Users, Star, ArrowRight, ShieldCheck, HeartHandshake,
  Trophy, Palette, Microscope, Target, Eye, Sparkles, Library,
  FlaskConical, Dumbbell, Laptop, Music, Utensils,
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import Reveal from "../../components/ui/Reveal";
import SafeImage from "../../components/ui/SafeImage";
import SchoolStats from "../../components/public/SchoolStats";
import defaultHeroImg from "/Pry building.jpg";

const academicLevels = [
  { title: "Early Years", description: "Play-based learning for ages 3–5, fostering curiosity and social skills.", icon: Palette },
  { title: "Primary School", description: "Grades 1–6 with a strong foundation in literacy, numeracy, and character building.", icon: BookOpen },
  { title: "Secondary School", description: "Grades 7–12 preparing students for university and beyond with rigorous academics.", icon: Microscope },
];

const whyChooseUs = [
  { title: "Qualified Teachers", description: "An experienced, dedicated faculty committed to every student's growth.", icon: ShieldCheck },
  { title: "Proven Results", description: "A consistent record of strong academic outcomes and university placements.", icon: Trophy },
  { title: "Inclusive Community", description: "A safe, welcoming environment where every child is known and supported.", icon: HeartHandshake },
  { title: "Well-Rounded Development", description: "Academics balanced with sports, arts, and character education.", icon: Users },
];

const facilities = [
  { title: "Modern Library", description: "A well-stocked resource centre for research and quiet study.", icon: Library },
  { title: "Science Laboratories", description: "Fully equipped labs for hands-on physics, chemistry, and biology.", icon: FlaskConical },
  { title: "Sports Complex", description: "Fields and courts supporting a full range of athletics.", icon: Dumbbell },
  { title: "ICT Centre", description: "Modern computer labs preparing students for a digital world.", icon: Laptop },
  { title: "Music & Arts Studio", description: "Dedicated space for creative and performing arts.", icon: Music },
  { title: "A School Hall", description: "A clean, comfortable space serving nutritious meals daily.", icon: Utensils },
];

export default function Home() {
  const { settings } = useSiteSettings();
  const [heroIndex, setHeroIndex] = useState(0);

  const heroImages = settings.hero.backgroundImages?.length ? settings.hero.backgroundImages : [defaultHeroImg];

  useEffect(() => {
    if (heroImages.length < 2) return undefined;
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 6000);
    return () => clearInterval(id);
  }, [heroImages.length]);

  return (
    <div className="bg-white">
      {/* ===== Hero — full width, full height (100vh), rotating background, premium entrance ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {heroImages.map((img, i) => (
          <div
            key={img + i}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === heroIndex ? 'opacity-100 hero-zoom' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40 text-center w-full hero-in">
          <img src={settings.logo} alt={`${settings.schoolName} logo`} className="hero-item mx-auto h-20 md:h-24 w-auto mb-6 drop-shadow-lg" />
          <h1 className="hero-item text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-wider drop-shadow-lg uppercase">
            {settings.hero.title || settings.schoolName}
          </h1>
          <p className="hero-item text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow-md">
            {settings.hero.subtitle}
          </p>
          <div className="hero-item flex flex-wrap justify-center gap-4">
            <NavLink
              to={settings.hero.buttonLink || '/admissions/apply'}
              className="btn-animated inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-full shadow-lg hover:bg-gray-100"
            >
              {settings.hero.buttonText || 'Apply Now'} <ArrowRight className="ml-2 h-5 w-5" />
            </NavLink>
            <NavLink
              to="/about"
              className="btn-animated inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600"
            >
              Learn More
            </NavLink>
          </div>
        </div>
      </section>

      {/* ===== Statistics strip ===== */}
      <SchoolStats />

      {/* ===== About ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="inline-flex items-center px-4 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-semibold mb-4">
                <Star className="h-4 w-4 mr-1" /> About Our School
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{settings.schoolName}</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">{settings.about}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2"><ShieldCheck className="h-6 w-6 text-blue-600" /><span className="text-gray-700 font-medium">Safe & Nurturing</span></div>
                <div className="flex items-center space-x-2"><Trophy className="h-6 w-6 text-pink-500" /><span className="text-gray-700 font-medium">Award-Winning</span></div>
                <div className="flex items-center space-x-2"><HeartHandshake className="h-6 w-6 text-blue-600" /><span className="text-gray-700 font-medium">Inclusive Community</span></div>
                <div className="flex items-center space-x-2"><Users className="h-6 w-6 text-pink-500" /><span className="text-gray-700 font-medium">{settings.motto}</span></div>
              </div>
              <NavLink to="/about" className="btn-animated mt-8 inline-flex items-center text-blue-600 font-semibold hover:text-pink-500">
                Read More About Us <ArrowRight className="ml-2 h-5 w-5" />
              </NavLink>
            </Reveal>
            <Reveal delay={150}>
              <div className="img-frame aspect-video bg-blue-100 rounded-2xl shadow-xl">
                {heroImages[0] ? (
                  <SafeImage src={heroImages[0]} alt={settings.schoolName} className="img-zoom h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Users className="h-20 w-20 opacity-50" /></div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== Principal's Message ===== */}
      {settings.principalMessage && (
        <section className="py-16 md:py-24 bg-gray-50">
          <Reveal className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Sparkles className="h-10 w-10 text-pink-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">A Message from the Principal</h2>
            <p className="text-gray-600 leading-relaxed italic">&ldquo;{settings.principalMessage}&rdquo;</p>
          </Reveal>
        </section>
      )}

      {/* ===== Mission, Vision & Core Values ===== */}
      {(settings.mission || settings.vision || settings.coreValues?.length > 0) && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
            {settings.mission && (
              <Reveal>
                <div className="card-hover bg-gray-50 rounded-2xl p-8 h-full">
                  <Target className="h-9 w-9 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{settings.mission}</p>
                </div>
              </Reveal>
            )}
            {settings.vision && (
              <Reveal delay={100}>
                <div className="card-hover bg-gray-50 rounded-2xl p-8 h-full">
                  <Eye className="h-9 w-9 text-pink-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{settings.vision}</p>
                </div>
              </Reveal>
            )}
            {settings.coreValues?.length > 0 && (
              <Reveal delay={200}>
                <div className="card-hover bg-gray-50 rounded-2xl p-8 h-full">
                  <Star className="h-9 w-9 text-blue-600 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Core Values</h3>
                  <div className="flex flex-wrap gap-2">
                    {settings.coreValues.map((v) => (
                      <span key={v} className="bg-white text-blue-600 text-xs px-3 py-1 rounded-full shadow-sm font-medium">{v}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ===== Academic Programs ===== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Academic Programs</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">From early childhood to pre-university, we offer a seamless educational journey designed to unlock every student's potential.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {academicLevels.map((level, idx) => {
              const Icon = level.icon;
              return (
                <Reveal key={level.title} delay={idx * 100}>
                  <div className="card-hover bg-white rounded-2xl p-8 shadow-md h-full">
                    <div className="inline-flex p-4 rounded-xl bg-blue-600 text-white mb-4"><Icon className="h-8 w-8" /></div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{level.title}</h3>
                    <p className="text-gray-600">{level.description}</p>
                                      </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Why Choose Us ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose {settings.schoolName}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The reasons families trust us with their children's education.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={idx * 80}>
                  <div className="card-hover bg-gray-50 rounded-2xl p-6 h-full">
                    <div className="inline-flex p-3 rounded-xl bg-blue-600 text-white mb-4"><Icon className="h-6 w-6" /></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== School Facilities ===== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Facilities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Purpose-built spaces that support learning, creativity, and wellbeing.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={idx * 60}>
                  <div className="card-hover flex items-start space-x-4 p-6 bg-white rounded-xl shadow-sm h-full">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-pink-500 text-white"><Icon className="h-5 w-5" /></div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Testimonials ===== */}
      {settings.testimonials?.length > 0 && (
        <section className="py-16 md:py-24 bg-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal><h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">What Our Community Says</h2></Reveal>
            <div className="grid md:grid-cols-3 gap-8">
              {settings.testimonials.map((t, index) => (
                <Reveal key={index} delay={index * 100}>
                  <div className="card-hover bg-white p-8 rounded-2xl shadow-md h-full">
                    <div className="flex mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-pink-500 fill-current" />)}</div>
                    <p className="text-gray-600 italic mb-6">&ldquo;{t.quote}&rdquo;</p>
                    <div className="flex items-center">
                      <div className="img-frame w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                        {t.photo ? <SafeImage src={t.photo} alt={t.name} className="h-full w-full object-cover" /> : t.name?.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Partners ===== */}
      {settings.partners?.length > 0 && (
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm uppercase tracking-widest text-gray-400 mb-8">Our Partners</p>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {settings.partners.map((p, i) => (
                <Reveal key={i} delay={i * 60}>
                  <a href={p.url || '#'} target="_blank" rel="noreferrer" className="btn-animated opacity-70 hover:opacity-100 grayscale hover:grayscale-0 transition">
                    {p.logo ? <img src={p.logo} alt={p.name} className="h-10 object-contain" /> : <span className="text-gray-500 font-medium">{p.name}</span>}
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== Call to Action ===== */}
      <section className="py-16 md:py-20 bg-pink-500">
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{settings.cta.title}</h2>
          <p className="text-blue-100 text-lg mb-8">{settings.cta.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <NavLink to={settings.cta.buttonLink || '/admissions/apply'} className="btn-animated inline-flex items-center px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100">
              {settings.cta.buttonText || 'Apply Now'} <ArrowRight className="ml-2 h-5 w-5" />
            </NavLink>
            <NavLink to="/contact" className="btn-animated inline-flex items-center px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600">
              Contact Us
            </NavLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
