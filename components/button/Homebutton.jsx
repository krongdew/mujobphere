import React from 'react';
import Link from 'next/link';
import "./style.css"
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

const UserTypeButtons = () => {
  const t = useTranslations("Hero");
  const { data: session, status } = useSession(); // Add status check
  
  const isAuthenticated = status === 'authenticated' && session?.user;

  return (
    <div className="container my-4">
      <div className="row g-4">
        <div className="col-12 col-md-6">
          {isAuthenticated ? (
            <Link href="/employers-dashboard/post-jobs" style={{ textDecoration: 'none' }}>
              <div className="user-type-btn d-flex flex-column align-items-center justify-content-center">
                <div className="subtitle mb-2">{t('For')}</div>
                <div className="title">{t('Hiring')}</div>
              </div>
            </Link>
          ) : (
            <a 
              href="#"
              data-bs-toggle="modal"
              data-bs-target="#loginPopupModal"
              onClick={(e) => e.preventDefault()}
            >
              <div className="user-type-btn d-flex flex-column align-items-center justify-content-center">
                <div className="subtitle mb-2">{t('For')}</div>
                <div className="title">{t('Hiring')}</div>
              </div>
            </a>
          )}
        </div>

        <div className="col-12 col-md-6">
          <Link href="/job-list-v2" style={{ textDecoration: 'none' }}>
            <div className="user-type-btn d-flex flex-column align-items-center justify-content-center">
              <div className="subtitle mb-2">{t('For')}</div>
              <div className="title">{t('Find a job')}</div>
              <div className="subtitle">{t('Mahidol student only')}</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserTypeButtons;