'use client';

import Image from "next/image";
import Link from "next/link";

export default function NotFoundContent() {
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
        <Link className="theme-btn btn-style-three" href="/">
          BACK TO HOME
        </Link>
      </div>
    </div>
  );
}