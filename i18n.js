export const locales = ['en', 'th'];
export const defaultLocale = 'th';

export default function getRequestConfig({ locale }) {
  return {
    messages: {
      ...require(`./messages/${locale}.json`)
    },
    timeZone: 'Asia/Bangkok',
    defaultLocale,
    locales,
    locale // เพิ่มบรรทัดนี้
  }
}