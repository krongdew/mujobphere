import { NextIntlClientProvider } from 'next-intl';
import ClientLayout from './ClientLayout';
import { Providers } from '../providers';

async function getMessages(locale) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error('Failed to load messages:', error);
    return {};
  }
}



export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="keywords" content="candidates, career, employment..." />
        <meta name="description" content="Superio - Job Board React NextJS Template" />
        <meta name="ibthemes" content="ATFN" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ClientLayout>{children}</ClientLayout>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}