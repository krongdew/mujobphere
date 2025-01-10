import dynamic from "next/dynamic";

import CandidatesList from "@/components/candidates-listing-pages/candidates-list-v3";

export const metadata = {
  title: 'Candidates List V3 || Superio - Job Borad React NextJS Template',
  description:
    'Superio - Job Borad React NextJS Template',
  
}


const index = () => {
  return (
    <>
      
      <CandidatesList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
