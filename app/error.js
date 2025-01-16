"use client"

import dynamic from 'next/dynamic';

const ErrorContent = dynamic(
  () => import('../components/error/ErrorContent'),
  { ssr: false }
);

export default function Error({ error, reset }) {
  return <ErrorContent reset={reset} />;
}