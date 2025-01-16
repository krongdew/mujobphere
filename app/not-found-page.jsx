'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="error-page-wrapper">
      <div className="content">
        <div className="logo">
          <Link href="/">
            <Image
              width={154}
              height={50}
              src="/images/logo.svg"
              alt="brand"
              priority
            />
          </Link>
        </div>
        <h1>404!</h1>
        <p>The page you are looking for could not be found.</p>
        <button 
          onClick={() => router.push('/')}
          className="theme-btn btn-style-three"
        >
          BACK TO HOME
        </button>
      </div>
    </div>
  );
}