"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Icon mapping based on category name
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    "Accounting / Finance": "flaticon-money-1",
    "Marketing": "flaticon-promotion",
    "Design": "flaticon-vector",
    "Development": "flaticon-web-programming",
    "Human Resource": "flaticon-headhunting",
    "Automotive": "flaticon-rocket-ship",
    "Customer Service": "flaticon-headphones",
    "Health and Care": "flaticon-first-aid-kit-1",
    "Project Management": "flaticon-car",
    "Education": "flaticon-mortarboard",
    "Engineering": "flaticon-tools",
    "Research": "flaticon-search",
    "Technology": "flaticon-monitor",
    "Administration": "flaticon-briefcase",
    "Legal": "flaticon-auction"
  };
  
  // Return matching icon or default icon if no match
  return iconMap[categoryName] || "flaticon-briefcase";
};

const JobCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/job-categories/count');
        
        if (!response.ok) {
          throw new Error('Failed to fetch job categories');
        }
        
        const data = await response.json();
        
        // Map the API data to the format needed for display
        const formattedCategories = data.map(category => ({
          id: category.id,
          icon: getCategoryIcon(category.name),
          catTitle: category.name,
          hireType: category.hire_type === 'personal' ? 'จ้างส่วนตัว' : 'จ้างในนามคณะ',
          jobNumber: category.job_count
        }));
        
        setCategories(formattedCategories);
      } catch (err) {
        console.error("Error fetching job categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading job categories...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-red-500">Error: {error}</div>;
  }

  return (
    <>
      {categories.map((item) => (
        <div
          className="category-block col-lg-4 col-md-6 col-sm-12"
          key={item.id}
        >
          <div className="inner-box">
            <div className="content">
              <span className={`icon ${item.icon}`}></span>
              <h4>
                {/* <Link href={`/job-list?category=${item.id}`}>{item.catTitle}</Link> */}
                <Link href={`/job-list-v2`}>{item.catTitle}</Link>
              </h4>
              <p className="hire-type-tag">{item.hireType}</p>
              <p>({item.jobNumber} open positions)</p>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default JobCategories;