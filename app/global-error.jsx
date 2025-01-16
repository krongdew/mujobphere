'use client';
 
export default function GlobalError({ error, reset }) {
  return (
    <div className="error-page-wrapper">
      <div className="content">
        <h2>Something went wrong!</h2>
        <button
          className="theme-btn btn-style-three"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
}