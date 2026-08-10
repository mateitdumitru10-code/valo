import { ArrowLink } from '~/components/UI'
import { useI18n } from '~/lib/i18n'

export function NotFound() {
  const { t } = useI18n()
  return (
    <div className="gutter flex min-h-[70svh] flex-col justify-center pt-32">
      <p className="eyebrow opacity-40">404</p>
      <h1 className="display-lg mt-6">{t('notFound.title')}</h1>
      <p className="mt-5 max-w-sm text-sm opacity-65">{t('notFound.body')}</p>
      <div className="mt-8">
        <ArrowLink to="/colectii">{t('notFound.link')}</ArrowLink>
      </div>
    </div>
  )
}
