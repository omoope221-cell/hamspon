// Leadership.jsx
import { useEffect, useState } from "react";
import { Crown, Quote } from "lucide-react";
import { publicApi } from "../../api/public";
import SafeImage from "../../components/ui/SafeImage";
import Reveal from "../../components/ui/Reveal";

export default function Leadership() {
  const [leaders, setLeaders] = useState(null);

  useEffect(() => {
    publicApi.getLeadership().then((r) => setLeaders(r.data)).catch(() => setLeaders([]));
  }, []);

  const proprietor = leaders?.find((l) => l.category === "proprietor");
  const principal = leaders?.find((l) => l.category === "principal");
  const management = leaders?.filter((l) => l.category === "management") || [];

  return (
    <div className="bg-white">
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Crown className="h-10 w-10 text-pink-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">Our Leadership</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The people guiding our school's mission, vision, and daily excellence.
          </p>
        </div>
      </section>

      {leaders === null ? (
        <div className="py-24 text-center text-gray-400">Loading leadership profiles…</div>
      ) : (
        <>
          {[proprietor, principal].filter(Boolean).map((leader) => (
            <section key={leader._id} className="py-16 md:py-20 border-b border-gray-100">
              <Reveal className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-10 items-start">
                <div className="md:col-span-1">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-md">
                    {leader.photo ? (
                      <SafeImage src={leader.photo} alt={leader.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-blue-600">
                        {leader.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{leader.fullName}</h3>
                  <p className="text-pink-500 font-medium">{leader.position}</p>
                </div>
                <div className="md:col-span-2">
                  <Quote className="h-8 w-8 text-blue-600 mb-3" />
                  <p className="text-gray-600 leading-relaxed italic text-lg">
                    {leader.message || leader.biography}
                  </p>
                </div>
              </Reveal>
            </section>
          ))}

          {management.length > 0 && (
            <section className="py-16 md:py-24 bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Reveal className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Management Team</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Meet the team leading our academic and administrative excellence.</p>
                </Reveal>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {management.map((leader, idx) => (
                    <Reveal key={leader._id} delay={idx * 80}>
                      <div className="card-hover bg-white rounded-2xl p-6 shadow-md h-full text-center">
                        <div className="h-24 w-24 mx-auto rounded-full overflow-hidden bg-gray-100 mb-4">
                          {leader.photo ? (
                            <SafeImage src={leader.photo} alt={leader.fullName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-blue-600">
                              {leader.fullName?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900">{leader.fullName}</h3>
                        <p className="text-pink-500 text-sm font-medium mb-2">{leader.position}</p>
                        {leader.biography && <p className="text-gray-600 text-sm">{leader.biography}</p>}
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {!proprietor && !principal && management.length === 0 && (
            <div className="py-24 text-center text-gray-400">Leadership profiles coming soon.</div>
          )}
        </>
      )}
    </div>
  );
}
