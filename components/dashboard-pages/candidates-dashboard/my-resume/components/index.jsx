'use client'

import { Suspense, lazy } from 'react';
import { useSession } from 'next-auth/react';
import CvUploader from '../../cv-manager/components/CvUploader';

// Custom loading components with skeleton UI
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

// Lazy load components with preloading
const Education = lazy(() => {
  // Start preloading other components when Education loads
  const preloadComponents = () => {
    import('./Experiences');
    import('./Awards');
    import('./SkillsMultiple');
  };
  
  return import('./Education').then(module => {
    preloadComponents();
    return module;
  });
});

const Experiences = lazy(() => import('./Experiences'));
const Awards = lazy(() => import('./Awards'));
const SkillsMultiple = lazy(() => import('./SkillsMultiple'));


const Index = () => {
  const { data: session } = useSession();

  return (
    <div className="default-form">
      <div className="row">
        {/* Education Section */}
        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <Education />
          </Suspense>
        </div>

        {/* Experience Section */}
        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <Experiences />
          </Suspense>
        </div>

        {/* Awards Section */}
        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <Awards />
          </Suspense>
        </div>

        {/* Skills Section */}
        <div className="form-group col-lg-12 col-md-12">
          <Suspense fallback={<LoadingSkeleton />}>
            <SkillsMultiple />
          </Suspense>
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <CvUploader />
        </div>
      </div>
    </div>
  );
}

export default Index;