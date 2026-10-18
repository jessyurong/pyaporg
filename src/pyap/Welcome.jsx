import React, { useState } from "react";
import { Users, Calendar, Award, Megaphone, Heart, Target, Sparkles, Mail, Phone, MapPin, X, Edit3, ChevronDown } from "lucide-react";

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

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen w-full bg-stone-50 text-stone-800 font-sans">
      {/* NAV */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="PYAP Samac" className="w-9 h-9" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-emerald-900">PYAP</div>
              <div className="text-[10px] text-stone-500 -mt-0.5">Barangay Samac</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-stone-600">
            <button onClick={() => scrollTo("about")} className="hover:text-emerald-700">About</button>
            <button onClick={() => scrollTo("mission")} className="hover:text-emerald-700">Mission</button>
            <button onClick={() => scrollTo("activities")} className="hover:text-emerald-700">Activities</button>
            <button onClick={() => scrollTo("join")} className="hover:text-emerald-700">Join Us</button>
            <button onClick={() => scrollTo("contact")} className="hover:text-emerald-700">Contact</button>
          </nav>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <button
                onClick={() => setEditing(true)}
                title="Edit Welcome Page"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 border border-emerald-700 hover:bg-emerald-700 hover:text-white px-3 py-1.5 rounded-lg transition"
              >
                <Edit3 size={13} /> Edit Page
              </button>
            )}
            <button
              onClick={onLoginClick}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded-lg transition"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.3) 0%, transparent 45%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          <img src={logo} alt="PYAP Samac Logo" className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 drop-shadow-lg" />
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-emerald-200 mb-3">{content.heroTagline}</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight max-w-3xl mx-auto">{content.heroTitle}</h1>
          <p className="mt-5 text-sm md:text-base text-emerald-50/90 max-w-2xl mx-auto leading-relaxed">
            {content.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => scrollTo("about")}
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold text-sm px-6 py-3 rounded-lg transition shadow-lg"
            >
              Learn More
            </button>
            <button
              onClick={onRequestClick}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm px-6 py-3 rounded-lg transition shadow-lg"
            >
              Request Account
            </button>
            <button
              onClick={onGuestClick}
              className="bg-emerald-950/40 hover:bg-emerald-950/60 border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-lg transition"
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
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">About PYAP Samac</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-900">{content.aboutTitle}</h2>
            <p className="mt-5 text-sm md:text-base text-stone-600 leading-relaxed whitespace-pre-line">
              {content.aboutBody}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatBox big="Youth-Led" small="By youth, for youth" />
            <StatBox big="Community-Rooted" small="Serving Barangay Samac" />
            <StatBox big="Nationwide" small="Part of PYAP Philippines" />
            <StatBox big="Volunteer-Driven" small="Powered by bayanihan" />
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section id="mission" className="bg-emerald-50/60 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-emerald-100">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">Our Mission</h3>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed whitespace-pre-line">{content.mission}</p>
          </div>
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-emerald-100">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-emerald-900">Our Vision</h3>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed whitespace-pre-line">{content.vision}</p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Core Values</span>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-900">What We Stand For</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {content.values.map((v, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md hover:border-emerald-200 transition">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Heart size={18} />
              </div>
              <h4 className="font-bold text-emerald-900">{v.title}</h4>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVITIES */}
      <section id="activities" className="bg-stone-100/70 border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Our Programs</span>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-emerald-900">What We Do</h2>
            <p className="mt-3 text-sm text-stone-600">Programs and activities that bring our youth together and uplift the barangay.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.activities.map((a, i) => {
              const Icon = iconMap[a.icon] || Sparkles;
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 hover:shadow-md hover:-translate-y-0.5 transition">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center mb-4">
                    <Icon size={19} />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-sm">{a.title}</h4>
                  <p className="mt-2 text-xs text-stone-600 leading-relaxed">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA / JOIN */}
      <section id="join" className="max-w-6xl mx-auto px-5 py-16 md:py-20">
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white rounded-3xl p-10 md:p-14 text-center shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold">{content.ctaTitle}</h2>
          <p className="mt-4 text-sm md:text-base text-emerald-50/90 max-w-2xl mx-auto leading-relaxed">{content.ctaBody}</p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <button
              onClick={onLoginClick}
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold text-sm px-6 py-3 rounded-lg transition shadow-lg"
            >
              Login to Your Account
            </button>
            <button
              onClick={() => scrollTo("contact")}
              className="border border-white/40 hover:bg-white/10 text-white font-semibold text-sm px-6 py-3 rounded-lg transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="bg-emerald-950 text-emerald-50">
        <div className="max-w-6xl mx-auto px-5 py-14 grid md:grid-cols-4 gap-8">
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
          <ContactItem icon={Mail} label="Email" value={content.contactEmail} href={`mailto:${content.contactEmail}`} />
          <ContactItem icon={Phone} label="Phone" value={content.contactPhone} href={`tel:${content.contactPhone.replace(/\s/g, "")}`} />
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

function StatBox({ big, small }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl px-4 py-5 text-center">
      <div className="text-sm font-bold text-emerald-800">{big}</div>
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
          <button onClick={() => onSave(form)} className="text-sm px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
