// About.jsx
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Users,
  Target,
  Heart,
  Award,
  ArrowRight,
  Globe,
  ShieldCheck,
  Star,
} from "lucide-react";
import aboutHeroImg from "/about-hero.jpg"; 
import { useSiteSettings } from "../../context/SiteSettingsContext";

const stats = [
  { icon: Users, value: "2,500+", label: "Students" },
  { icon: Award, value: "13+", label: "Years of Excellence" },
  { icon: BookOpen, value: "98%", label: "University Acceptance" },
  { icon: Globe, value: "30+", label: "Nationalities" },
];

const values = [
  {
    title: "Integrity",
    description: "We uphold honesty, transparency, and moral principles in all we do.",
    icon: ShieldCheck,
  },
  {
    title: "Excellence",
    description: "We strive for the highest standards in academics, arts, and sports.",
    icon: Star,
  },
  {
    title: "Compassion",
    description: "We nurture empathy, kindness, and service to others.",
    icon: Heart,
  },
  {
    title: "Innovation",
    description: "We embrace creativity and forward-thinking to prepare students for the future.",
    icon: Target,
  },
];

export default function About() {
  const { settings } = useSiteSettings();
  return (
    <div className="bg-white">
      {/* ===== Full-Screen Hero Banner ===== */}
      <section
        className="relative bg-cover bg-center bg-no-repeat min-h-screen flex items-center justify-center"
        style={{ backgroundImage: `url(${aboutHeroImg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <img
            src={settings.logo || "/logo-removebg-preview.png"}
            alt={settings.schoolName}
            className="mx-auto h-20 md:h-24 w-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-wide mb-4 uppercase">
            ABOUT US
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-md">
            Discover our story, mission, and the values that drive us to nurture tomorrow's leaders.
          </p>
        </div>
      </section>

      {/* ===== Our Story Section ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                <BookOpen className="h-4 w-4 mr-1" /> Our History
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A Legacy of Educational Excellence
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Founded in 2013, {settings.schoolName} began as a small
                primary school with a big vision: to provide a holistic education
                that blends rigorous academics with character formation. Over the
                years, we have grown into a leading K-12 institution
                serving over 2,500 students from more than 30 nationalities.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our alumni are now leaders in business, medicine, technology, and
                the arts—proof that a nurturing environment paired with high
                expectations produces outstanding results.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-video bg-blue-100 rounded-2xl overflow-hidden shadow-xl flex items-center justify-center">
                <Users className="h-20 w-20 text-white opacity-40" />
                {/* Replace with an actual school image */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Counter ===== */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-white">
                  <Icon className="h-10 w-10 mx-auto mb-3 opacity-90" />
                  <div className="text-3xl md:text-4xl font-extrabold">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-blue-100 font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Mission & Vision ===== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="card-hover bg-white p-8 rounded-2xl shadow-md">
              <Target className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To empower every student with the knowledge, skills, and character
                necessary to excel in a dynamic world. We foster a love for
                learning, a spirit of inquiry, and a commitment to making a
                positive impact on society.
              </p>
            </div>
            <div className="card-hover bg-white p-8 rounded-2xl shadow-md">
              <Star className="h-10 w-10 text-pink-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To be a beacon of transformative education, recognized globally
                for cultivating innovative, compassionate, and ethical leaders
                who shape a better future for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Core Values ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Our Core Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="card-hover bg-gray-50 rounded-xl p-6 hover:bg-blue-50 group"
                >
                  <Icon className="h-10 w-10 text-blue-600 mx-auto mb-4 group-hover:text-pink-500 transition" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {val.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{val.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Leadership / Team placeholder ===== */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Leadership
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-12">
            Dedicated educators and administrators committed to guiding students
            toward success.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-hover bg-white p-6 rounded-2xl shadow-md">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                M
              </div>
              <h4 className="text-xl font-bold text-gray-900">Dr. Michael Adeyemi</h4>
              <p className="text-pink-500 font-medium">Principal</p>
              <p className="text-gray-500 text-sm mt-2">
                PhD in Educational Leadership, 20+ years of experience.
              </p>
            </div>
            <div className="card-hover bg-white p-6 rounded-2xl shadow-md">
              <div className="w-24 h-24 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                A
              </div>
              <h4 className="text-xl font-bold text-gray-900">Mrs. Amina Okafor</h4>
              <p className="text-pink-500 font-medium">Vice Principal</p>
              <p className="text-gray-500 text-sm mt-2">
                Expert in curriculum development and student welfare.
              </p>
            </div>
            <div className="card-hover bg-white p-6 rounded-2xl shadow-md">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                J
              </div>
              <h4 className="text-xl font-bold text-gray-900">Mr. John Kamau</h4>
              <p className="text-pink-500 font-medium">Head of Secondary</p>
              <p className="text-gray-500 text-sm mt-2">
                Passionate about STEM and student mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Call to Action ===== */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Experience the Hampsons Difference
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Come visit our campus, meet our teachers, and see how we inspire greatness every day.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <NavLink
              to="/admissions"
              className="btn-animated inline-flex items-center px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100"
            >
              Apply Now <ArrowRight className="ml-2 h-5 w-5" />
            </NavLink>
            <NavLink
              to="/contact"
              className="btn-animated inline-flex items-center px-8 py-3 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600"
            >
              Contact Us
            </NavLink>
          </div>
        </div>
      </section>
    </div>
  );
}