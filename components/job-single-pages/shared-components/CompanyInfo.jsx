import React from 'react';
import Social from "../social/Social";

const CompanyInfo = ({ profileData }) => {
  // Log the entire profileData for debugging
  console.log('CompanyInfo - Raw Profile Data:', profileData);

  // Prevent errors if no profile data is passed
  if (!profileData) {
    console.warn('No profile data provided to CompanyInfo');
    return null;
  }

  // Prepare company information based on available data
  const companyInfo = [
    // Always include these if available
    { label: 'Title', value: profileData.title },
    { label: 'Name', value: profileData.name },
    { label: 'Email', value: profileData.email },
    { label: 'Department', value: profileData.department },
    
    // Additional fields based on possible keys
    { label: 'Position', value: profileData.position },
    { label: 'Company Name', value: profileData.company_name },
    { label: 'Company Address', value: profileData.company_address },
    { label: 'Phone', value: profileData.phone || profileData.company_phone },
  ];

  // Filter out items with no value
  const filteredCompanyInfo = companyInfo.filter(item => item.value);

  console.log('Processed Company Info:', filteredCompanyInfo);

  return (
    <ul className="company-info">
      {/* Render company information dynamically */}
      {filteredCompanyInfo.map((info, index) => (
        <li key={index}>
          {info.label}: <span>{info.value}</span>
        </li>
      ))}
      
      {/* Optional social media section */}
      {/* <li>
        Social media:
        <Social />
      </li> */}
    </ul>
  );
};

export default CompanyInfo;