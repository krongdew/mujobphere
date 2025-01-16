// app/[locale]/ClientLayoutWrapper.jsx
'use client';

import { NextIntlClientProvider } from 'next-intl';
import ClientLayout from './ClientLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function ClientLayoutWrapper({ children, locale, messages }) {
    
    console.log("Locale in ClientLayoutWrapper:", locale);
    console.log("Messages in ClientLayoutWrapper:", messages);
    
  return (
    <ErrorBoundary>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ClientLayout>{children}</ClientLayout>
      </NextIntlClientProvider>
    </ErrorBoundary>
  );
}