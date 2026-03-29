import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Landing() {
  const { t } = useTranslation('landing');
  return (
    <div className="relative text-[#faf4f2] antialiased overflow-x-hidden selection:bg-[#d68070]/30 selection:text-white min-h-screen flex flex-col">
      <div className="fixed inset-0 z-[-1] bg-[#1c1818]">
        <div className="absolute inset-0 bg-[url('/landing/background.webp')] bg-cover bg-center opacity-25 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,128,112,0.12)_0%,transparent_80%)]"></div>
      </div>

      <main className="flex-1">
        <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 px-6">
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white mb-8">
              {t('hero.title')}
            </h1>
            <p className="max-w-2xl text-lg md:text-2xl text-[#c9aaa4] mb-12 font-medium leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col items-center gap-4 w-full sm:w-auto">
              <Link
                to="/app"
                className="flex items-center justify-center bg-white text-[#1c1818] px-8 py-4 rounded-full font-bold text-lg transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:bg-stone-200 hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]"
              >
                {t('hero.cta')}
              </Link>
              <a
                href="https://github.com/juhanias/lukkarikone"
                target="_blank"
                rel="noreferrer"
                className="text-[#c9aaa4] hover:text-white transition-colors text-sm font-medium hover:underline underline-offset-4"
              >
                {t('hero.githubText')}
              </a>
            </div>
          </div>
        </section>

        <section className="relative pb-24 px-6 z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">{t('about.title')}</h2>
            <div className="space-y-3 text-[#c9aaa4] text-lg font-regular">
              <p>
                {t('about.p1')}
              </p>
              <p>
                {t('about.p2')}
              </p>
              <p className="font-bold">
                {t('about.p3')}
              </p>
            </div>
          </div>
        </section>

        <section className="relative pb-32 px-6 z-10">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mx-auto mb-16">
              <h2 className="text-2xl font-bold text-white mb-4">{t('gallery.title')}</h2>
              <div className="space-y-2 text-[#c9aaa4] text-lg font-regular">
                <p>
                  {t('gallery.subtitle')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {[
                { src: "/landing/showcase/settings.webp", title: t('gallery.items.settings') },
                { src: "/landing/showcase/event-hiding-context.webp", title: t('gallery.items.hiding') },
                { src: "/landing/showcase/timeline-jumping.webm", title: t('gallery.items.fast') },
                { src: "/landing/showcase/calendars.webp", title: t('gallery.items.calendars') },
                { src: "/landing/showcase/colorful.webm", title: t('gallery.items.colorful') },
                //{ src: "/landing/showcase/uptime.png", title: "saatavilla useammin kuin luulet wink wink" },
                { src: "/landing/showcase/coursedeets.webp", title: t('gallery.items.details') },
                { src: "/landing/showcase/colorconfig.webp", title: t('gallery.items.config') },
              ].map((item, i) => {
                const isVideo = item.src.endsWith(".mp4") || item.src.endsWith(".webm");
                const mediaClass = "w-full h-auto transition-transform duration-500 group-hover:scale-[1.03]";

                return (
                  <div key={i} className="flex flex-col gap-4 group cursor-pointer">
                    <div className="overflow-hidden rounded-2xl border border-white/5 shadow-lg bg-black/20">
                      {isVideo ? (
                        <video
                          src={item.src}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className={mediaClass}
                        />
                      ) : (
                        <img
                          src={item.src}
                          alt={item.title}
                          className={mediaClass}
                        />
                      )}
                    </div>
                    <p className="text-center text-[#c9aaa4] text-[15px] font-medium transition-colors group-hover:text-white">
                      {item.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>


    </div >
  );
}
