"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ApplyJobModalContent = ({ jobId }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Debug: Log jobId when component mounts or jobId changes
  useEffect(() => {
    console.log('ApplyJobModalContent - jobId:', jobId);
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submit clicked - jobId:', jobId);
    
    if (!session?.user) {
      setError("Please login to apply for this job");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    if (!jobId) {
      setError("Invalid job ID");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      console.log('Sending application request with data:', {
        job_post_id: jobId,
        message: message,
      });

      const response = await fetch('/api/job-applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_post_id: jobId,
          message: message,
        }),
      });

      console.log('Response status:', response.status);
      
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to apply for job');
      }

      // Close modal manually since we're using Bootstrap
      try {
        const modal = document.getElementById('applyJobModal');
        if (modal) {
          const modalInstance = bootstrap.Modal.getInstance(modal);
          if (modalInstance) {
            modalInstance.hide();
          } else {
            modal.style.display = 'none';
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
              modalBackdrop.remove();
            }
          }
        }
      } catch (modalError) {
        console.error('Error closing modal:', modalError);
      }

      // Show success message
      alert('Application submitted successfully!');
      
      // Refresh the page
      window.location.reload();

    } catch (err) {
      console.error('Error applying for job:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="text-center p-4">
        <p className="mb-4">Please login to apply for this job</p>
        <button
          type="button"
          className="btn btn-primary"
          data-bs-dismiss="modal"
          onClick={() => router.push('/login')}
        >
          Login
        </button>
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Error: Invalid job ID</p>
      </div>
    );
  }

  return (
    <form className="default-form job-apply-form" onSubmit={handleSubmit}>
      <div className="row">
        {error && (
          <div className="col-12 mb-4">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <textarea
            className="darma"
            name="message"
            placeholder="Message (Optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <div className="input-group checkboxes square">
            <input
              type="checkbox"
              name="remember-me"
              id="rememberMe"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="remember">
              <span className="custom-checkbox"></span> You accept our{" "}
              <span data-bs-dismiss="modal">
                <Link href="/terms">
                  Terms and Conditions and Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        </div>

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <button
            className="theme-btn btn-style-one w-100"
            type="submit"
            disabled={isSubmitting || !acceptTerms}
          >
            {isSubmitting ? 'Submitting...' : 'Apply Job'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ApplyJobModalContent;