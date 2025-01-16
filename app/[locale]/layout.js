// import { NextIntlClientProvider } from 'next-intl';
// import ClientLayout from './ClientLayout';
// import { Providers } from '../providers';
// import ErrorBoundary from '@/components/ErrorBoundary';


// async function getMessages(locale) {
//   try {
//     return (await import(`../../messages/${locale}.json`)).default;
//   } catch (error) {
//     console.error('Failed to load messages:', error);
//     return {};
//   }
// }



// export default async function LocaleLayout({ children, params: { locale } }) {
//   const messages = await getMessages(locale);

//   return (
//     <html lang={locale}>
//       <head>
//         <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" />
//         <meta httpEquiv="x-ua-compatible" content="ie=edge" />
//         <meta name="keywords" content="candidates, career, employment..." />
//         <meta name="description" content="Superio - Job Board React NextJS Template" />
//         <meta name="ibthemes" content="ATFN" />
//         <link rel="icon" href="/favicon.ico" />
//       </head>
//       <body>
//         <Providers>
//         <ErrorBoundary>
//           <NextIntlClientProvider locale={locale} messages={messages}>
//             <ClientLayout>{children}</ClientLayout>
//           </NextIntlClientProvider>
//           </ErrorBoundary>
//         </Providers>
//       </body>
//     </html>
//   );
// }
import { NextIntlClientProvider } from 'next-intl';
import ClientLayout from './ClientLayout';
import { Providers } from '../providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-prompt',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
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
  authors: { name: 'ibthemes', url: 'ATFN' },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale} >
      <head>
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={prompt.className}>
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