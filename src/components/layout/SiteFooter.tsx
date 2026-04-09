import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";

const topCards = [
  {
    title: "Learner News",
    description: "Stay updated with the latest from the ZATI learning community.",
    highlighted: false,
  },
  {
    title: "Learning Calendar",
    description: "Upcoming cohort launches, live sessions, and deadlines.",
    highlighted: false,
  },
  {
    title: "Events & Webinars",
    description: "Free workshops, masterclasses, and networking sessions.",
    highlighted: false,
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <section className="border-y border-[#d9dbe3] bg-[#f6f7fb]">
        <div className="grid w-full grid-cols-1 md:grid-cols-3">
          {topCards.map((card) => (
            <article
              key={card.title}
              className="group border-r border-[#d9dbe3] bg-[#f6f7fb] px-6 py-8 text-[#0c1730] transition-colors duration-300 hover:bg-[#FF6B00] hover:text-white"
            >
              <h3 className="text-[15px] font-black leading-none">{card.title}</h3>
              <p className="mt-2.5 text-[12px] leading-[1.45] text-[#7a87a8] transition-colors duration-300 group-hover:text-white/92">
                {card.description}
              </p>
              <button className="mt-5 inline-flex items-center text-[#FF6B00] transition-colors duration-300 group-hover:text-white">
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#03061a] text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src="/zentrix.avif" alt="Zentrix Africa" className="h-14 w-14 object-contain" />
                <div>
                  <p className="text-base font-black uppercase tracking-[0.07em]">Zentrix Africa</p>
                  <p className="text-xs text-[#7f8aac]">Technology Institute</p>
                </div>
              </div>

              <p className="mt-6 max-w-md text-[14px] leading-[1.7] text-[#7f8aac]">
                ZATI is Africa's leading continuous learning platform empowering professionals and learners to grow their
                skills, advance their careers, and thrive in the digital economy.
              </p>

              <div className="mt-8 flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <button
                    key={i}
                    className="flex h-11 w-11 items-center justify-center border border-white/15 text-[#c7d2f1] transition-colors hover:border-[#FF6B00] hover:bg-[#FF6B00] hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[18px] font-black uppercase tracking-[0.2em]">Quick Links</h4>
              <ul className="mt-5 space-y-3 text-[14px] text-[#7f8aac]">
                {["Home", "About", "All Courses", "Enroll", "Community"].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <span className="text-[#4f5b80]">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[18px] font-black uppercase tracking-[0.2em]">Resources</h4>
              <ul className="mt-5 space-y-3 text-[14px] text-[#7f8aac]">
                {["News", "Events", "Careers", "Learning Calendar", "Contact Us"].map((item) => (
                  <li key={item} className="flex items-center gap-4">
                    <span className="text-[#4f5b80]">-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[18px] font-black uppercase tracking-[0.2em]">Contact Info</h4>
              <div className="mt-5 space-y-4 text-[14px] leading-[1.5] text-[#7f8aac]">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-[#FF6B00]" />
                  <p>
                    RDC, Republique Democratique du Congo
                    <br />
                    Online Campus - Africa Wide
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="h-5 w-5 text-[#FF6B00]" />
                  <p>+243 99371251</p>
                </div>
                <div className="flex items-center gap-4">
                  <Mail className="h-5 w-5 text-[#FF6B00]" />
                  <p>info@zati.africa</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <div className="flex flex-col gap-3 text-[13px] text-[#617098] sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 Zentrix Africa Technology Institute (ZATI). All Rights Reserved.</p>
              <div className="flex items-center gap-8">
                <button className="transition-colors hover:text-[#FF6B00]">Privacy Policy</button>
                <button className="transition-colors hover:text-[#FF6B00]">Terms of Service</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
}
