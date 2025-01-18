import { Prompt } from 'next/font/google';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-prompt',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif']
});

export const metadata = {
  title: "MUJobSphere",
  description: "Job Board Application",
};

export default function RootLayout({ children, params }) {
  const locale = params?.locale || 'th'; // ใช้ locale จาก params ถ้ามี
  return (
    <html lang={locale}>
      <body className={prompt.className}>{children}</body>
    </html>
  );
}
