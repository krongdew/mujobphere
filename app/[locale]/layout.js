// app/[locale]/layout.js
import { Providers } from '../providers';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { Prompt } from 'next/font/google';

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

export default async function LocaleLayout({ children, params }) {
  const localeValue = params?.locale || "en"; // ✅ ใช้ชื่ออื่นแทน locale

  console.log("Params:", params); // ✅ Debugging เพื่อเช็คค่าที่ส่งมา

  const messages = await getMessages(localeValue);

  return (
    <html lang={localeValue}>
      <body>
        <Providers>
          <ClientLayoutWrapper locale={localeValue} messages={messages}>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}