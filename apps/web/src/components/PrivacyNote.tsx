import { Link } from 'react-router-dom'
import { useI18n } from '~/lib/i18n'

/**
 * Under each quote form: what happens to what was typed. A quote request is
 * answered on the GDPR's pre-contract basis, not on consent, so this informs
 * rather than asks — there is no box to tick.
 */
export function PrivacyNote() {
  const { t } = useI18n()
  return (
    <p className="max-w-md text-xs leading-relaxed opacity-50 sm:col-span-2">
      {t('form.privacy')}{' '}
      <Link to="/confidentialitate" className="underline underline-offset-4 hover:opacity-100">
        {t('form.privacyLink')}
      </Link>
      .
    </p>
  )
}
