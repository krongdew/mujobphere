'use client';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');

  return (
    <>
      <li>
        <Link href="/th">{t('thai')}</Link>
      </li>
      <li>
        <Link href="/en">{t('english')}</Link>
      </li>
    </>
  );
}