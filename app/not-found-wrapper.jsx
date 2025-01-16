'use client';

import Link from "next/link";

export default function NotFoundWrapper() {
  return (
    <div className="error-page-wrapper">
      <div className="content">
        <h1>404!</h1>
        <p>The page you are looking for could not be found.</p>
        <Link href="/" className="theme-btn btn-style-three">
          Back to Home
        </Link>
      </div>
    </div>
  );
}