'use client'

import { Suspense, lazy } from 'react';

// Lazy load components
const Education = lazy(() => import('./Education'));
const Experiences = lazy(() => import('./Experiences'));
const Awards = lazy(() => import('./Awards'));
const SkillsMultiple = lazy(() => import('./SkillsMultiple'));

const Index = () => {
  return (
    <div className="default-form">
      <div className="row">
        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<div>Loading Education...</div>}>
            <Education />
          </Suspense>
          <Suspense fallback={<div>Loading Experiences...</div>}>
            <Experiences />
          </Suspense>
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<div>Loading Awards...</div>}>
            <Awards />
          </Suspense>
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<div>Loading Skills...</div>}>
            <SkillsMultiple />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Index;