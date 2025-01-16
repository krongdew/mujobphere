import dynamic from 'next/dynamic';

const NotFoundContent = dynamic(
  () => import('../components/error/NotFoundContent'),
  { ssr: false }
);

export default function NotFound() {
  return <NotFoundContent />;
}