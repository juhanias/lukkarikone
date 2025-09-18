import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
]

export default function LanguageSelector() {
  const { i18n, t } = useTranslation('common')
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {t('labels.language')}:
      </span>
      <div className="flex gap-1">
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage.code === language.code ? "default" : "ghost"}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            className="text-xs px-2 py-1 h-auto"
          >
            {language.code.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  )
}