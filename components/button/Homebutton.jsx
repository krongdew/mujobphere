// UserTypeButtons.jsx
import React from 'react';
import Link from 'next/link';
import "./style.css"
import { useTranslations } from 'next-intl';


const UserTypeButtons = () => {
  const t = useTranslations("Hero");

  return (
    <div className="container my-4">
      <div className="row g-4">
        <div className="col-12 col-md-6">
          <div className="user-type-btn d-flex flex-column align-items-center justify-content-center">
            <div className="subtitle mb-2">{t('For')}</div>
            <div className="title">{t('Hiring')}</div>
          </div>
        </div>
        <div className="col-12 col-md-6">
        <Link href="/th/job-list-v2" style={{ textDecoration: 'none' }}>
          <div className="user-type-btn d-flex flex-column align-items-center justify-content-center">
            <div className="subtitle mb-2">{t('For')}</div>
            <div className="title">{t('Find a job')}</div>
            <div className="subtitle ">{t('Mahidol student only')}</div>
          </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserTypeButtons;
