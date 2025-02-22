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

  // Helper function to format phone info based on role
  const getPhoneInfo = (data) => {
    if (data.role === 'employeroutside') {
      return [
        { label: 'Company Phone', value: data.company_phone },
        { label: 'Contact Phone', value: data.contact_phone }
      ].filter(item => item.value);
    } else if (data.role === 'employer') {
      return [
        { label: 'Phone', value: data.phone },
        { label: 'Mobile', value: data.mobile_phone }
      ].filter(item => item.value);
    }
    return [];
  };

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
    
    // Add phone numbers
    ...getPhoneInfo(profileData)
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