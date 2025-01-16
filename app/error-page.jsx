'use client';

export default function ErrorPage({ error, reset }) {
  return (
    <div className="error-page-wrapper">
      <div className="content">
        <h2>Something went wrong!</h2>
        <button 
          onClick={() => reset()}
          className="theme-btn btn-style-three"
        >
          Try again
        </button>
      </div>
    </div>
  );
}