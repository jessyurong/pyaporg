import React, { useEffect, useRef, useState } from "react";
import { Users, Calendar, Award, Megaphone, Heart, Target, Sparkles, Mail, Phone, MapPin, X, Edit3, ChevronDown } from "lucide-react";
import { useSubmitLock, submittingCls } from "./hooks/useSubmitLock.jsx";

export const DEFAULT_WELCOME = {
  heroTitle: "PYAP – Barangay Samac",
  heroTagline: "Pag-asa Youth Association of the Philippines",
  heroSubtitle: "Empowering the youth of Barangay Samac through leadership, service, and community engagement.",
  aboutTitle: "Who We Are",
  aboutBody:
    "The Pag-asa Youth Association of the Philippines (PYAP) – Barangay Samac Chapter is a community-based youth organization committed to nurturing responsible, capable, and compassionate young leaders. Rooted in the values of bayanihan and public service, we bring together the youth of our barangay to work hand-in-hand for the progress of our community.",
  mission:
    "To uplift the lives of the youth in Barangay Samac by providing meaningful programs, opportunities for growth, and a strong voice in community development.",
  vision:
    "A united, empowered, and value-driven youth of Barangay Samac — leading positive change today and shaping a brighter tomorrow for every Filipino family.",
  values: [
    { title: "Pagkakaisa", desc: "United as one youth, working together for the good of every family in our barangay." },
    { title: "Paglilingkod", desc: "Service before self — we lead by helping, listening, and showing up for our community." },
    { title: "Pag-asa", desc: "We are the hope of the nation — carrying with pride the future of our people." },
  ],
  activities: [
    { icon: "users", title: "Youth Development", desc: "Leadership training, mentorship, and skill-building workshops for members." },
    { icon: "calendar", title: "Community Events", desc: "Clean-up drives, sportsfests, and outreach programs across the barangay." },
    { icon: "award", title: "Recognition & Awards", desc: "Honoring outstanding youth leaders and volunteers who inspire others." },
    { icon: "megaphone", title: "Advocacy Campaigns", desc: "Anti-drug, mental health, education, and environmental awareness drives." },
  ],
  ctaTitle: "Join the Movement",
  ctaBody: "Are you a young resident of Barangay Samac? Be part of a growing family of youth leaders making real change in our community.",
  contactEmail: "pyap.samac@gmail.com",
  contactPhone: "+63 900 000 0000",
  contactFB: "facebook.com/pyapsamac",
  contactAddress: "Barangay Samac, Philippines",
};

const iconMap = { users: Users, calendar: Calendar, award: Award, megaphone: Megaphone };

export default function Welcome({ content, logo, isSuperAdmin, onLoginClick, onGuestClick, onRequestClick, onSave }) {
  const [editing, setEditing] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroGlow = useRef(null);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      if (!reduce && heroGlow.current) {
        heroGlow.current.style.transform = `translate3d(0, ${Math.min(window.scrollY, 480) * 0.22}px, 0)`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full app-shell text-stone-800 font-sans">
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px] pointer-events-none" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-emerald-700 via-emerald-500 to-amber-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
      <header className="sticky top-0 z-30 bg-white/75 backdrop-blur-xl border-b border-emerald-900/8">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="PYAP Samac" className="w-9 h-9 rounded-xl" />
            <div className="leading-tight">
              <div className="text-sm font-semibold text-emerald-950 tracking-tight">PYAP</div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-stone-500 -mt-0.5">Barangay Samac</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-stone-600">
            <button onClick={() => scrollTo("about")} className="hover:text-emerald-800 transition-colors">About</button>
            <button onClick={() => scrollTo("mission")} className="hover:text-emerald-800 transition-colors">Mission</button>
            <button onClick={() => scrollTo("activities")} className="hover:text-emerald-800 transition-colors">Activities</button>
            <button onClick={() => scrollTo("join")} className="hover:text-emerald-800 transition-colors">Join Us</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-emerald-800 transition-colors">Contact</button>
          </nav>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                onClick={() => setEditing(true)}
                title="Edit Welcome Page"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 border border-emerald-800/30 hover:bg-emerald-800 hover:text-white px-3 py-1.5 rounded-full transition"
              >
                <Edit3 size={13} /> Edit Page
              </button>
            )}
            <button
              onClick={onLoginClick}
              className="text-xs font-semibold bg-emerald-800 hover:bg-emerald-950 text-white px-4 py-2 rounded-full transition shadow-[0_8px_18px_rgba(6,95,70,0.18)]"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% -8%, #1f6b4e 0%, #0d4a38 38%, #07352a 68%, #041f1a 100%)",
          }}
        />
        <div ref={heroGlow} className="pointer-events-none absolute inset-0 will-change-transform">
          <div className="absolute -top-32 left-1/2 h-[38rem] w-[46rem] -translate-x-1/2 rounded-full bg-amber-200/40 blur-[120px]" />
          <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-emerald-300/30 blur-[90px]" />
          <div className="absolute -right-20 bottom-[-4rem] h-96 w-96 rounded-full bg-teal-200/22 blur-[120px]" />
          <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-white/16 blur-[80px]" />
        </div>
        <HeroMotion />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 42%, rgba(2, 18, 14, 0.45) 100%)",
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <img src={logo} alt="PYAP Samac Logo" className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 rounded-3xl bg-white/10 p-2 ring-1 ring-white/20 shadow-2xl" />
          <p className="text-xs md:text-sm uppercase tracking-[0.28em] text-amber-200/90 mb-3">{content.heroTagline}</p>
          <h1 className="font-serif text-4xl md:text-6xl font-medium leading-[1.08] max-w-3xl mx-auto">{content.heroTitle}</h1>
          <p className="mt-6 text-sm md:text-base text-emerald-50/90 max-w-2xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => scrollTo("about")}
              className="bg-white text-emerald-950 hover:bg-amber-50 font-semibold text-sm px-6 py-3 rounded-full transition shadow-lg"
            >
              Learn More
            </button>
            <button
              onClick={onRequestClick}
              className="bg-amber-300 hover:bg-amber-200 text-emerald-950 font-semibold text-sm px-6 py-3 rounded-full transition shadow-lg"
            >
              Request Account
            </button>
            <button
              onClick={onGuestClick}
              className="bg-white/8 hover:bg-white/14 border border-white/25 text-white font-semibold text-sm px-6 py-3 rounded-full transition"
            >
              Continue as Guest
            </button>
          </div>
          <button
            onClick={() => scrollTo("about")}
            className="mt-14 mx-auto flex items-center justify-center text-emerald-100/80 hover:text-white transition animate-bounce"
            aria-label="Scroll"
          >
            <ChevronDown size={26} />
          </button>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <Reveal from="left">
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">About PYAP Samac</span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl font-medium text-emerald-950 tracking-tight">{content.aboutTitle}</h2>
            <p className="mt-5 text-sm md:text-base text-stone-600 leading-relaxed whitespace-pre-line">
              {content.aboutBody}
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Youth-Led", "By youth, for youth"],
              ["Community-Rooted", "Serving Barangay Samac"],
              ["Nationwide", "Part of PYAP Philippines"],
              ["Volunteer-Driven", "Powered by bayanihan"],
            ].map(([big, small], i) => (
              <Reveal key={big} from="right" delay={i * 90}>
                <StatBox big={big} small={small} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section id="mission" className="bg-emerald-50/60 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20 grid md:grid-cols-2 gap-6">
          <Reveal from="left">
            <div className="surface rounded-3xl p-8">
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mb-4">
                <Target size={20} />
              </div>
              <h3 className="font-serif text-2xl font-medium text-emerald-950">Our Mission</h3>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed whitespace-pre-line">{content.mission}</p>
            </div>
          </Reveal>
          <Reveal from="right" delay={120}>
            <div className="surface rounded-3xl p-8">
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="font-serif text-2xl font-medium text-emerald-950">Our Vision</h3>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed whitespace-pre-line">{content.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Core Values</span>
          <h2 className="mt-2 font-serif text-3xl md:text-4xl font-medium text-emerald-950 tracking-tight">What We Stand For</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {content.values.map((v, i) => (
            <Reveal key={i} delay={i * 100}>
            <div className="surface rounded-3xl p-6 hover:-translate-y-0.5 transition duration-200 h-full">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Heart size={18} />
              </div>
              <h4 className="font-serif text-xl font-medium text-emerald-950">{v.title}</h4>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{v.desc}</p>
            </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <Reveal className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-700 font-semibold">Our Programs</span>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl font-medium text-emerald-950 tracking-tight">What We Do</h2>
            <p className="mt-3 text-sm text-stone-600">Programs and activities that bring our youth together and uplift the barangay.</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.activities.map((a, i) => {
              const Icon = iconMap[a.icon] || Sparkles;
              return (
                <Reveal key={i} delay={i * 80}>
                <div className="surface rounded-3xl p-6 hover:-translate-y-0.5 transition duration-200 h-full">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white flex items-center justify-center mb-4">
                    <Icon size={19} />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-sm">{a.title}</h4>
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed">{a.desc}</p>
                </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA / JOIN */}
      <section id="join" className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <Reveal from="scale">
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-[2rem] p-10 md:p-14 text-center shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.35), transparent 40%)" }} />
          <h2 className="relative font-serif text-3xl md:text-4xl font-medium">{content.ctaTitle}</h2>
          <p className="relative mt-4 text-sm md:text-base text-emerald-50/90 max-w-2xl mx-auto leading-relaxed">{content.ctaBody}</p>
          <div className="relative mt-7 flex flex-wrap gap-3 justify-center">
            <button
              onClick={onLoginClick}
              className="bg-white text-emerald-950 hover:bg-amber-50 font-semibold text-sm px-6 py-3 rounded-full transition shadow-lg"
            >
              Login to Your Account
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="border border-white/40 hover:bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-full transition"
            >
              Contact Us
            </button>
          </div>
        </div>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-emerald-950 text-emerald-50">
        <div className="max-w-6xl mx-auto px-5 py-14 grid md:grid-cols-4 gap-8">
          <Reveal from="up">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="PYAP" className="w-10 h-10" />
              <div>
                <div className="font-bold">PYAP Samac</div>
                <div className="text-[11px] text-emerald-200/70">Pag-asa Youth Association</div>
              </div>
            </div>
            <p className="text-xs text-emerald-100/70 mt-4 leading-relaxed">
              Empowering the youth of Barangay Samac to lead, serve, and inspire.
            </p>
          </div>
          </Reveal>
          <Reveal from="up" delay={80}>
            <ContactItem icon={Mail} label="Email" value={content.contactEmail} href={`mailto:${content.contactEmail}`} />
          </Reveal>
          <Reveal from="up" delay={160}>
            <ContactItem icon={Phone} label="Phone" value={content.contactPhone} href={`tel:${content.contactPhone.replace(/\s/g, "")}`} />
          </Reveal>
          <Reveal from="up" delay={240}>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 mb-2">Find Us</div>
            <div className="flex items-start gap-2 text-sm text-emerald-50">
              <MapPin size={15} className="mt-0.5 text-emerald-300" />
              <span>{content.contactAddress}</span>
            </div>
            {content.contactFB && (
              <a
                href={`https://${content.contactFB.replace(/^https?:\/\//, "")}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-100 hover:text-white"
              >
                <span className="w-4 h-4 rounded-sm bg-emerald-300 text-emerald-900 text-[10px] font-bold flex items-center justify-center">f</span> {content.contactFB}
              </a>
            )}
          </div>
          </Reveal>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-5 py-4 text-[11px] text-emerald-200/70 flex flex-wrap justify-between gap-2">
            <span>© {new Date().getFullYear()} PYAP – Barangay Samac. All rights reserved.</span>
            <span>Developed by Jessie</span>
          </div>
        </div>
      </section>

      {editing && (
        <EditWelcomeModal
          content={content}
          onClose={() => setEditing(false)}
          onSave={(next) => {
            onSave(next);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

function Reveal({ children, className = "", from = "up", delay = 0 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShown(entry.isIntersecting),
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-from={from}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function HeroMotion() {
  const motes = [
    { left: "12%", bottom: "18%", delay: "0s", duration: "9s" },
    { left: "22%", bottom: "10%", delay: "1.4s", duration: "11s" },
    { left: "78%", bottom: "16%", delay: "0.6s", duration: "10s" },
    { left: "88%", bottom: "28%", delay: "2.2s", duration: "12s" },
    { left: "8%", bottom: "42%", delay: "3s", duration: "13s" },
    { left: "70%", bottom: "8%", delay: "1.8s", duration: "9.5s" },
    { left: "40%", bottom: "6%", delay: "2.8s", duration: "14s" },
    { left: "58%", bottom: "12%", delay: "0.3s", duration: "11.5s" },
  ];

  return (
    <div className="hero-motion pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-50" viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <g fill="none" stroke="rgba(253, 230, 138, 0.28)" strokeWidth="1">
          <path d="M160 180 C 280 140, 340 240, 430 210" strokeDasharray="6 10" style={{ animation: "hero-dash 18s linear infinite" }} />
          <path d="M430 210 C 520 180, 610 250, 740 190" strokeDasharray="6 10" style={{ animation: "hero-dash 22s linear infinite" }} />
          <path d="M740 190 C 860 150, 940 230, 1040 200" strokeDasharray="6 10" style={{ animation: "hero-dash 16s linear infinite reverse" }} />
          <path d="M180 480 C 300 430, 390 520, 510 470" strokeDasharray="7 12" style={{ animation: "hero-dash 20s linear infinite" }} />
          <path d="M510 470 C 640 430, 760 530, 900 460" strokeDasharray="7 12" style={{ animation: "hero-dash 24s linear infinite reverse" }} />
          <path d="M220 300 C 280 360, 250 430, 180 480" strokeDasharray="5 11" style={{ animation: "hero-dash 19s linear infinite" }} />
          <path d="M980 250 C 1020 330, 990 410, 900 460" strokeDasharray="5 11" style={{ animation: "hero-dash 21s linear infinite" }} />
        </g>
        {[
          [160, 180], [430, 210], [740, 190], [1040, 200],
          [180, 480], [510, 470], [900, 460], [250, 330], [980, 250],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="11" fill="rgba(16, 185, 129, 0.18)" stroke="rgba(253,230,138,0.35)" />
            <circle cx={cx} cy={cy} r="3.5" fill="rgba(254, 243, 199, 0.9)" style={{ animation: `hero-pulse ${3.2 + (i % 3)}s ease-in-out infinite`, animationDelay: `${i * 0.35}s` }} />
          </g>
        ))}
      </svg>

      {motes.map((m, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-amber-100/70"
          style={{ left: m.left, bottom: m.bottom, animation: `hero-rise ${m.duration} ease-in-out infinite`, animationDelay: m.delay }}
        />
      ))}
    </div>
  );
}

function StatBox({ big, small }) {
  return (
    <div className="surface rounded-2xl px-4 py-5 text-center">
      <div className="font-serif text-base font-medium text-emerald-950">{big}</div>
      <div className="text-[11px] text-stone-500 mt-1">{small}</div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value, href }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-emerald-300 mb-2">{label}</div>
      <a href={href} className="flex items-start gap-2 text-sm text-emerald-50 hover:text-white break-all">
        <Icon size={15} className="mt-0.5 text-emerald-300 flex-shrink-0" />
        <span>{value}</span>
      </a>
    </div>
  );
}

function EditWelcomeModal({ content, onClose, onSave }) {
  const [form, setForm] = useState(JSON.parse(JSON.stringify(content)));
  const { run, isBusy } = useSubmitLock();
  const busy = isBusy();
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setValue = (idx, k, v) =>
    setForm((f) => ({ ...f, values: f.values.map((x, i) => (i === idx ? { ...x, [k]: v } : x)) }));
  const setActivity = (idx, k, v) =>
    setForm((f) => ({ ...f, activities: f.activities.map((x, i) => (i === idx ? { ...x, [k]: v } : x)) }));

  const Field = ({ label, children }) => (
    <label className="block">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">{label}</span>
      {children}
    </label>
  );

  const inputCls = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-auto max-h-[90dvh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-emerald-900">Edit Welcome Page</h3>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Hero</h4>
            <Field label="Title"><input className={inputCls} value={form.heroTitle} onChange={(e) => setField("heroTitle", e.target.value)} /></Field>
            <Field label="Tagline"><input className={inputCls} value={form.heroTagline} onChange={(e) => setField("heroTagline", e.target.value)} /></Field>
            <Field label="Subtitle"><textarea rows={3} className={inputCls} value={form.heroSubtitle} onChange={(e) => setField("heroSubtitle", e.target.value)} /></Field>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">About</h4>
            <Field label="Section Title"><input className={inputCls} value={form.aboutTitle} onChange={(e) => setField("aboutTitle", e.target.value)} /></Field>
            <Field label="Body"><textarea rows={5} className={inputCls} value={form.aboutBody} onChange={(e) => setField("aboutBody", e.target.value)} /></Field>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Mission & Vision</h4>
            <Field label="Mission"><textarea rows={3} className={inputCls} value={form.mission} onChange={(e) => setField("mission", e.target.value)} /></Field>
            <Field label="Vision"><textarea rows={3} className={inputCls} value={form.vision} onChange={(e) => setField("vision", e.target.value)} /></Field>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Core Values</h4>
            {form.values.map((v, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input className={inputCls} placeholder="Title" value={v.title} onChange={(e) => setValue(i, "title", e.target.value)} />
                <input className={inputCls + " sm:col-span-2"} placeholder="Description" value={v.desc} onChange={(e) => setValue(i, "desc", e.target.value)} />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Activities / Programs</h4>
            {form.activities.map((a, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select className={inputCls} value={a.icon} onChange={(e) => setActivity(i, "icon", e.target.value)}>
                  <option value="users">Users</option>
                  <option value="calendar">Calendar</option>
                  <option value="award">Award</option>
                  <option value="megaphone">Megaphone</option>
                </select>
                <input className={inputCls} placeholder="Title" value={a.title} onChange={(e) => setActivity(i, "title", e.target.value)} />
                <input className={inputCls + " sm:col-span-2"} placeholder="Description" value={a.desc} onChange={(e) => setActivity(i, "desc", e.target.value)} />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Call to Action</h4>
            <Field label="Title"><input className={inputCls} value={form.ctaTitle} onChange={(e) => setField("ctaTitle", e.target.value)} /></Field>
            <Field label="Body"><textarea rows={3} className={inputCls} value={form.ctaBody} onChange={(e) => setField("ctaBody", e.target.value)} /></Field>
          </section>

          <section className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700">Contact</h4>
            <Field label="Email"><input className={inputCls} value={form.contactEmail} onChange={(e) => setField("contactEmail", e.target.value)} /></Field>
            <Field label="Phone"><input className={inputCls} value={form.contactPhone} onChange={(e) => setField("contactPhone", e.target.value)} /></Field>
            <Field label="Facebook"><input className={inputCls} value={form.contactFB} onChange={(e) => setField("contactFB", e.target.value)} /></Field>
            <Field label="Address"><input className={inputCls} value={form.contactAddress} onChange={(e) => setField("contactAddress", e.target.value)} /></Field>
          </section>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-stone-200 hover:bg-stone-50">Cancel</button>
          <button
            disabled={busy}
            onClick={() => run(null, () => onSave(form))}
            className={`text-sm px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold ${submittingCls}`}
          >
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
