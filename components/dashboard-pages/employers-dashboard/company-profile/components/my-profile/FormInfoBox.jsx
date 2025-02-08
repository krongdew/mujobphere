//components/dashboard-pages/employers-dashboard/company-profile/components/my-profile/FormInfoBox.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";

const FormInfoBox = () => {
  const { data: session, status } = useSession();  // เพิ่ม status
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);  // เพิ่มบรรทัดนี้

    // เพิ่ม array ของ titles
    const titleOptions = [
      "นาย",
      "นาง",
      "นางสาว",
      "ศาสตราจารย์",
      "รองศาสตราจารย์",
      "ผู้ช่วยศาสตราจารย์",
      "ดร."
    ];

  useEffect(() => {
    const fetchProfileData = async () => {
      if (status === 'loading' || !session?.user?.id) return;

      try {
        const response = await fetch(`/api/profile/${session.user.id}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch profile');
        }

        const data = await response.json();
        setFormData(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session, status]);

   // Fetch departments
   useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (!response.ok) throw new Error('Failed to fetch departments');
        const data = await response.json();
        setDepartments(data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    if (session?.user?.role === 'employer') {
      fetchDepartments();
    }
  }, [session?.user?.role]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: session.user.id,
          role: session.user.role,
          ...formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setFormData(updatedData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="text-center p-4">Please login to view this page</div>;
  }

  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
        {/* Error and Success Messages */}
        {error && (
          <div className="col-12 mb-4">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        {success && (
          <div className="col-12 mb-4">
            <div className="alert alert-success">Profile updated successfully!</div>
          </div>
        )}

        {/* Common fields */}
        <div className="form-group col-lg-6 col-md-12">
          <label>Email</label>
          <input
            type="email"
            value={formData.email || ''}
            readOnly
            disabled
            className="form-control bg-gray-100"
          />
        </div>
        
        <div className="form-group col-lg-6 col-md-12">
          <label>Title</label>
          <select
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            className="form-control"
          >
            <option value="">Select Title</option>
            {titleOptions.map((title, index) => (
              <option key={index} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        {/* Role-specific fields */}
        {session?.user?.role === 'employeroutside' ? (
          // Form fields for employeroutside
          <>
            <div className="form-group col-lg-6 col-md-12">
              <label>Company Name *</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>

          <div className="form-group col-lg-12 col-md-12">
            <label>Company Address *</label>
            <textarea
              name="company_address"
              value={formData.company_address || ''}
              onChange={handleInputChange}
              required
              className="form-control"
              rows="3"
            />
          </div>

          <div className="form-group col-lg-6 col-md-12">
            <label>Company Phone</label>
            <input
              type="tel"
              name="company_phone"
              value={formData.company_phone || ''}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>

          <div className="form-group col-lg-6 col-md-12">
            <label>Company Email *</label>
            <input
              type="email"
              name="company_email"
              value={formData.company_email || ''}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group col-lg-6 col-md-12">
            <label>Contact First Name *</label>
            <input
              type="text"
              name="contact_first_name"
              value={formData.contact_first_name || ''}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group col-lg-6 col-md-12">
            <label>Contact Last Name *</label>
            <input
              type="text"
              name="contact_last_name"
              value={formData.contact_last_name || ''}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group col-lg-6 col-md-12">
            <label>Contact Phone *</label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone || ''}
              onChange={handleInputChange}
              required
              className="form-control"
            />
          </div>

          <div className="form-group col-lg-12 col-md-12">
            <label>Company Description</label>
            <textarea
              name="company_description"
              value={formData.company_description || ''}
              onChange={handleInputChange}
              className="form-control"
              rows="4"
            />
          </div>

          <div className="form-group col-lg-12 col-md-12">
            <label>Company Benefits</label>
            <textarea
              name="company_benefits"
              value={formData.company_benefits || ''}
              onChange={handleInputChange}
              className="form-control"
              rows="4"
            />
          </div>
        </>
        ) : (
          // Form fields for employer (internal)
          <>
            

            <div className="form-group col-lg-6 col-md-12">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group col-lg-6 col-md-12">
              <label>Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>

            <div className="form-group col-lg-6 col-md-12">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>

            <div className="form-group col-lg-6 col-md-12">
              <label>Mobile Phone *</label>
              <input
                type="tel"
                name="mobile_phone"
                value={formData.mobile_phone || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="form-group col-lg-12 col-md-12">
          <button
            type="submit"
            className="theme-btn btn-style-one"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  );
}
export default FormInfoBox;