import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import useDocumentTitle from '../hooks/useDocumentTitle'

// Blue theme colors as inline styles
const blueTheme = {
  backgroundDark: "rgb(8, 12, 21)",
  background: "rgb(15, 23, 42)",
  text: "rgb(248, 250, 252)",
  textSecondary: "rgb(148, 163, 184)",
  accent: "rgb(59, 130, 246)",
};

// Shared motion variants keep the landing page reveal cohesive.
const easeOutExpo = [0.16, 1, 0.3, 1] as const;
const easeInOut = [0.42, 0, 0.58, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

// Comparison data
const comparisonFeatures = [
  { feature: "extremelyFast", lukkari: true, official: false },
  { feature: "darkTheme", lukkari: true, official: false },
  { feature: "customColors", lukkari: true, official: false },
  { feature: "openSource", lukkari: true, official: false },
  { feature: "hideLectures", lukkari: true, official: false },
  { feature: "lectureDetails", lukkari: true, official: true },
  { feature: "courseDetails", lukkari: true, official: true },
  { feature: "calendarExport", lukkari: false , official: true },
  { feature: "freeHourSearch", lukkari: false, official: true },
  { feature: "officialService", lukkari: false, official: true },
  { feature: "languageSupport", lukkari: "finEng", official: "finEng" },
  { feature: "dataUpdateFrequency", lukkari: "hourly", official: "immediate" },
];

// Helper function to render comparison value
const renderComparisonValue = (value: boolean | string, t: (key: string) => string) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check size={24} style={{ color: 'rgb(34, 197, 94)', margin: '0 auto' }} />
    ) : (
      <X size={24} style={{ color: 'rgb(239, 68, 68)', margin: '0 auto' }} />
    );
  }
  // If it's a translation key
  return <span style={{ color: blueTheme.textSecondary }}>{t(`comparison.values.${value}`)}</span>;
};

export default function Landing() {
  const { t } = useTranslation('landing');
  useDocumentTitle(t('title'))
  return (
    <div 
      className="w-full min-h-screen flex flex-col"
      style={{ 
        background: `linear-gradient(to bottom, ${blueTheme.backgroundDark}, ${blueTheme.background})`,
        color: blueTheme.text,
        fontFamily: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}
    >
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="p-4 flex justify-between items-center flex-shrink-0 absolute top-0 left-0 right-0 z-10"
        style={{
          backgroundColor: 'transparent',
        }}
      >
        <div className='w-full max-w-7xl mx-auto flex gap-4 justify-between items-center'>
          <Link 
            to="/?landing"
            className='text-xl font-medium transition-opacity hover:opacity-80'
            style={{ color: blueTheme.accent }}
          >
            {t('header.title')}
          </Link>
          
          <nav className='flex gap-6 items-center'>
            <Link 
              to="/app"
              className='text-sm font-medium transition-colors hover:opacity-80'
              style={{ color: blueTheme.textSecondary }}
            >
              {t('header.nav.app')}
            </Link>
            <a 
              href="https://github.com/juhanias/lukkarikone"
              target="_blank"
              rel="noopener noreferrer"
              className='text-sm font-medium transition-colors hover:opacity-80'
              style={{ color: blueTheme.textSecondary }}
            >
              {t('header.nav.github')}
            </a>
            <a 
              href="https://github.com/juhanias/lukkarikone/releases"
              target="_blank"
              rel="noopener noreferrer"
              className='text-sm font-medium transition-colors hover:opacity-80'
              style={{ color: blueTheme.textSecondary }}
            >
              {t('header.nav.updates')}
            </a>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.main
        className="flex-1 flex flex-col items-center justify-center px-4 pt-32"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="max-w-6xl mx-auto text-center space-y-8"
          variants={staggerContainer}
        >
          {/* Showcase Image Gallery */}
          <motion.div className="w-full mx-auto" variants={fadeIn}>
            {/* Desktop Layout */}
            <div className="hidden lg:flex items-center justify-center gap-4">
              <motion.div
                className="w-1/4 opacity-40 hover:opacity-60 transition-opacity"
                variants={fadeInUp}
                whileHover={{ opacity: 0.7 }}
              >
                <img 
                  src="/landing/showcase-2.webp" 
                  alt="Lukkari app feature" 
                  className="w-full h-auto rounded-lg shadow-lg"
                  loading="lazy"
                  srcSet="/landing/showcase-2-400.webp 400w, /landing/showcase-2-800.webp 800w, /landing/showcase-2.webp 1600w"
                  sizes="(max-width: 1024px) 0px, 400px"
                  style={{
                    boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.2)`
                  }}
                />
              </motion.div>
              
              <motion.div
                className="w-1/2"
                variants={fadeInUp}
              >
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 8, ease: easeInOut, repeat: Infinity, repeatType: 'mirror' }}
                >
                  <motion.img 
                    src="/landing/showcase.webp" 
                    alt="Lukkari app showcase" 
                    className="w-full h-auto rounded-lg shadow-2xl"
                    srcSet="/landing/showcase-800.webp 800w, /landing/showcase-1200.webp 1200w, /landing/showcase.webp 2803w"
                    sizes="(max-width: 1024px) 0px, 800px"
                    style={{
                      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.3)`
                    }}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                  />
                </motion.div>
              </motion.div>
              
              <motion.div
                className="w-1/4 opacity-40 hover:opacity-60 transition-opacity"
                variants={fadeInUp}
                whileHover={{ opacity: 0.7 }}
              >
                <img 
                  src="/landing/showcase-3.webp" 
                  alt="Lukkari app feature" 
                  className="w-full h-auto rounded-lg shadow-lg"
                  loading="lazy"
                  srcSet="/landing/showcase-3-400.webp 400w, /landing/showcase-3-800.webp 800w, /landing/showcase-3.webp 1600w"
                  sizes="(max-width: 1024px) 0px, 400px"
                  style={{
                    boxShadow: `0 10px 25px -5px rgba(0, 0, 0, 0.2)`
                  }}
                />
              </motion.div>
            </div>
            
            <motion.div
              className="lg:hidden w-full md:w-3/4 mx-auto"
              variants={fadeInUp}
            >
              <motion.img 
                src="/landing/showcase.webp" 
                alt="Lukkari app showcase" 
                className="w-full h-auto rounded-lg shadow-2xl"
                srcSet="/landing/showcase-800.webp 800w, /landing/showcase-1200.webp 1200w, /landing/showcase.webp 2803w"
                sizes="(max-width: 768px) 100vw, 75vw"
                style={{
                  boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.3)`
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: easeOutExpo }}
              />
            </motion.div>
          </motion.div>

          {/* Hero Text */}
          <motion.div className="space-y-4" variants={fadeInUp}>
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
              style={{ 
                color: blueTheme.text,
                fontFamily: "'Delius', cursive"
              }}
            >
              <span style={{ color: blueTheme.accent }}>
                {t('hero.title')}
              </span>
              {t('hero.titleSite')}
            </h1>
            <p 
              className="text-xl md:text-2xl max-w-2xl mx-auto"
              style={{ color: blueTheme.textSecondary }}
            >
              {t('hero.subtitle')}
            </p>
            <p 
              className="text-sm"
              style={{ color: `rgba(148, 163, 184, 0.7)` }}
              dangerouslySetInnerHTML={{ __html: t('hero.disclaimer') }}
            />
          </motion.div>

          {/* cta */}
          <motion.div className="flex gap-4 justify-center pt-4" variants={fadeInUp}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            >
              <Button 
                asChild
                size="default"
                className="text-base px-6 py-3 h-auto rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${blueTheme.accent} 0%, rgb(37, 99, 235) 100%)`,
                  color: 'white',
                  boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                }}
              >
                <Link to="/app">
                  {t('hero.cta')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Features Section */}
      <motion.section
        className="w-full py-20 px-4"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div className="grid md:grid-cols-2 gap-12 items-center mb-32" variants={staggerContainer}>
            <motion.div className="order-2 md:order-1" variants={fadeInUp}>
              <motion.div
                className="w-full rounded-lg overflow-hidden shadow-xl"
                style={{ boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.25)` }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 230, damping: 20 }}
              >
                <img 
                  src="/landing/showcase-colorful.webp" 
                  alt="Värikäs teema" 
                  className="w-full h-auto"
                  loading="lazy"
                  srcSet="/landing/showcase-colorful-800.webp 800w, /landing/showcase-colorful-1200.webp 1200w, /landing/showcase-colorful.webp 3200w"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                />
              </motion.div>
            </motion.div>
            <motion.div className="order-1 md:order-2 space-y-4" variants={fadeInUp}>
              <h2 
                className="text-3xl md:text-4xl font-bold"
                style={{ 
                  color: blueTheme.text,
                  fontFamily: "'Delius', cursive"
                }}
              >
                {t('features.colorful.title')}
              </h2>
              <p style={{ color: blueTheme.textSecondary }} className="text-lg leading-relaxed">
                {t('features.colorful.description')}
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-12 items-center mb-32" variants={staggerContainer}>
            <motion.div className="space-y-4" variants={fadeInUp}>
              <h2 
                className="text-3xl md:text-4xl font-bold"
                style={{ 
                  color: blueTheme.text,
                  fontFamily: "'Delius', cursive"
                }}
              >
                {t('features.fast.title')}
              </h2>
              <p style={{ color: blueTheme.textSecondary }} className="text-lg leading-relaxed">
                {t('features.fast.description')}
              </p>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <motion.div
                className="w-full rounded-lg overflow-hidden shadow-xl"
                style={{ boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.25)` }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 230, damping: 20 }}
              >
                <video 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                  poster="/landing/showcase-speed-poster.webp"
                >
                  <source src="/landing/showcase-speed.webm" type="video/webm" />
                  <source src="/landing/showcase-speed.mp4" type="video/mp4" />
                </video>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="grid md:grid-cols-2 gap-12 items-center mb-32" variants={staggerContainer}>
            <motion.div className="order-2 md:order-1" variants={fadeInUp}>
              <motion.div
                className="w-full rounded-lg overflow-hidden shadow-xl"
                style={{ boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.25)` }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 230, damping: 20 }}
              >
                <video 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                  poster="/landing/showcase-hide-poster.webp"
                >
                  <source src="/landing/showcase-hide.webm" type="video/webm" />
                  <source src="/landing/showcase-hide.mp4" type="video/mp4" />
                </video>
              </motion.div>
            </motion.div>
            <motion.div className="order-1 md:order-2 space-y-4" variants={fadeInUp}>
              <h2 
                className="text-3xl md:text-4xl font-bold"
                style={{ 
                  color: blueTheme.text,
                  fontFamily: "'Delius', cursive"
                }}
              >
                {t('features.manageable.title')}
              </h2>
              <p style={{ color: blueTheme.textSecondary }} className="text-lg leading-relaxed">
                {t('features.manageable.description')}
              </p>
            </motion.div>
          </motion.div>

          <motion.div className="mb-20" variants={staggerContainer}>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-center mb-12"
              style={{ 
                color: blueTheme.text,
                fontFamily: "'Delius', cursive"
              }}
              variants={fadeInUp}
            >
              {t('comparison.title')}
            </motion.h2>
            <motion.p 
              className="text-lg text-center max-w-3xl mx-auto mb-12 leading-relaxed"
              style={{ color: blueTheme.textSecondary }}
              variants={fadeInUp}
            >
              {t('comparison.subtitle')}
            </motion.p>
            <motion.div className="overflow-x-auto" variants={fadeIn}>
              <motion.table className="w-full" variants={staggerContainer}>
                <thead>
                  <tr style={{ borderBottomColor: `rgba(148, 163, 184, 0.3)`, borderBottomWidth: '2px' }}>
                    <th className="text-left py-4 px-4">{t('comparison.headers.feature')}</th>
                    <th className="text-center py-4 px-4">
                      <span style={{ color: blueTheme.accent }} className="font-bold">{t('comparison.headers.lukkari')}</span>
                    </th>
                    <th className="text-center py-4 px-4">
                      <span style={{ color: blueTheme.textSecondary }}>{t('comparison.headers.official')}</span>
                    </th>
                  </tr>
                </thead>
                <motion.tbody variants={staggerContainer}>
                  {comparisonFeatures.map((item, index) => (
                    <motion.tr 
                      key={index}
                      variants={fadeInUp}
                      style={{ 
                        borderBottomColor: `rgba(148, 163, 184, 0.15)`, 
                        borderBottomWidth: '1px'
                      }}
                      transition={{ duration: 0.4, ease: easeOutExpo }}
                    >
                      <td 
                        className="py-4 px-4 font-medium"
                        style={{ color: blueTheme.text }}
                      >
                        {t(`comparison.features.${item.feature}`)}
                      </td>
                      <td className="text-center py-4 px-4">
                        {renderComparisonValue(item.lukkari, t)}
                      </td>
                      <td className="text-center py-4 px-4">
                        {renderComparisonValue(item.official, t)}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </motion.table>
            </motion.div>

          </motion.div>

          <motion.div className="max-w-4xl mx-auto mb-20" variants={fadeInUp}>
            <motion.div 
              className="rounded-lg p-8 md:p-12 shadow-2xl"
              style={{ 
                backgroundColor: blueTheme.background,
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.3)`
              }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
            >
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-6"
                style={{ 
                  color: blueTheme.text,
                  fontFamily: "'Delius', cursive"
                }}
              >
                {t('development.title')}
              </h2>
              <p 
                className="text-lg text-center leading-relaxed mb-6"
                style={{ color: blueTheme.textSecondary }}
              >
                {t('development.description')}
              </p>
              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                >
                  <Button 
                    asChild
                    variant="outline"
                    size="lg"
                  >
                    <Link to="https://github.com/juhanias/lukkarikone">{t('development.cta')}</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        className="w-full py-8 px-4 border-t"
        style={{ borderColor: `rgba(148, 163, 184, 0.2)` }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: blueTheme.textSecondary }} className="text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
