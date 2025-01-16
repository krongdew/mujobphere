import { NextIntlClientProvider } from 'next-intl';
import ClientLayout from './ClientLayout';
import { Providers } from '../providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Prompt } from 'next/font/google';

// กำหนด font configuration
const prompt = Prompt({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'thai'],
  display: 'swap',
});

async function getMessages(locale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error('Failed to load messages:', error);
    return {};
  }
}

export const metadata = {
  title: 'MUJobSphere - ค้นหางานและเส้นทางอาชีพ',
  description: 'Superio - Job Board React NextJS Template',
  keywords: 'candidates, career, employment...',
};

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale} className={prompt.className}>
      <body>
        <Providers>
          <ErrorBoundary>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ClientLayout>{children}</ClientLayout>
            </NextIntlClientProvider>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}