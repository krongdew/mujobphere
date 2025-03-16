'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from 'next/image';

// แก้ไขสำหรับ PostBoxForm.js (ฝั่ง client)
const formatDateForDateInput = (dateString) => {
  if (!dateString) return null;

  try {
    // สร้าง Date โดยไม่มีการปรับ timezone
    const date = new Date(dateString);
    return date;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการจัดรูปแบบวันที่:', error);
    return null;
  }
};





const StudentFormInfoBox = () => {
const { data: session, status } = useSession();
  const [faculties, setFaculties] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [studentCardPreview, setStudentCardPreview] = useState(null);

  // Fetch faculties and profile data
  useEffect(() => {
    const fetchData = async () => {
      if (status === 'loading' || !session?.user?.id) return;
     
      try {
        // First, fetch profile data to get the user's current faculty
        const profileResponse = await fetch(`/api/profile/${session.user.id}`);
        const profileData = await profileResponse.json();

        // Format the birth date for the date input
        const formattedBirthDate = formatDateForDateInput(profileData.birth_date);

        // Set initial form data with user's current faculty and formatted birth date
        setFormData(prevData => ({
          ...prevData,
          ...profileData,
          // Ensure faculty is set first
          faculty: profileData.faculty || '',
          // Use the formatted birth date
          birth_date: formattedBirthDate
        }));

        // Log the formatted birth date
        console.log('Formatted birth date:', profileData.birth_date);

        // Then fetch full list of faculties
        const facultiesResponse = await fetch('/api/faculties');
        const facultiesData = await facultiesResponse.json();
        setFaculties(facultiesData);

        if (profileData.student_card_image) {
          setStudentCardPreview(profileData.student_card_image);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  // Modify handleDateChange to work with date input
  const handleDateChange = (e) => {
    const birthDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      birth_date: birthDate
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) { // 1MB limit
      setError('File size should be less than 1MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'student_card');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setStudentCardPreview(data.url);
      setFormData(prev => ({
        ...prev,
        student_card_image: data.url
      }));
    } catch (err) {
      setError('Failed to upload image');
      console.error('Upload error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          role: 'student',
          ...formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มฟังก์ชันคำนวณอายุ
const calculateAge = (birthDate) => {
  if (!birthDate) return '';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

  if (loading) return <div>Loading...</div>;

  return (
    <form className="default-form" onSubmit={handleSubmit}>
      <div className="row">
      {/* Error logging in the UI */}
      {error && (
        <div className="col-12 mb-4">
          <div className="alert alert-danger">
            {error}
            {/* Optional: Show more detailed error for debugging */}
            <pre className="text-xs">{JSON.stringify(faculties, null, 2)}</pre>
          </div>
        </div>
      )}
        {success && (
          <div className="col-12 mb-4">
            <div className="alert alert-success">Profile updated successfully!</div>
          </div>
        )}

        <div className="form-group col-lg-6 col-md-12">
          <label>Student ID *</label>
          <input
            type="text"
            name="student_id"
            value={formData.student_id || ''}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>First Name *</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name || ''}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Last Name *</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name || ''}
            onChange={handleInputChange}
            required
            className="form-control"
          />
        </div>

        <div className="form-group col-lg-6 col-md-12">
        <label>Faculty *</label>
        <select
          name="faculty"
          value={formData.faculty || ''}
          onChange={handleInputChange}
          required
          className="form-control"
        >
          {/* If user has a current faculty, show it first */}
          {formData.faculty && (
            <option value={formData.faculty}>{formData.faculty}</option>
          )}
          
          {/* Then add the full list of faculties */}
          {faculties
            .filter(faculty => faculty.name !== formData.faculty)
            .map(faculty => (
              <option key={faculty.id} value={faculty.name}>
                {faculty.name}
              </option>
            ))
          }
        </select>
                {/* Debug information */}
                {faculties.length === 0 && (
          <div className="text-danger mt-2">
            No faculties found. Check your API and database connection.
          </div>
        )}
     
        </div>

        <div className="form-group col-lg-6 col-md-12">
          <label>Major *</label>
          <input
            type="text"
            name="major"
            value={formData.major || ''}
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
        <label>Birth Date *</label>
        <input
          type="date"
          name="birth_date"
          value={formData.birth_date || ''}
          onChange={handleDateChange}
          required
          className="form-control"
        />
    
    </div>
<div className="form-group col-lg-6 col-md-12">
  <label>Age</label>
  <input
    type="text"
    value={calculateAge(formData.birth_date) + ' years'}
    readOnly
    disabled
    className="form-control bg-gray-100"
  />
</div>
      
        <div className="form-group col-lg-12 col-md-12">
        
  <label>Address</label>
  <textarea
    name="address"
    value={formData.address || ''}
    onChange={handleInputChange}
    className="form-control"
    rows="3"
  />
</div>
<div className="form-group col-lg-12 col-md-12">
          <label>Student Card Image</label>
          <div className="uploading-outer">
            <div className="uploadButton">
              <input
                className="uploadButton-input"
                type="file"
                name="student_card_image"
                accept="image/*"
                onChange={handleImageChange}
                id="upload"
              />
              <label
                className="uploadButton-button ripple-effect"
                htmlFor="upload"
              >
                {loading ? 'Uploading...' : 'Browse Student Card'}
              </label>
            </div>
          </div>
          {studentCardPreview && (
            <div className="mt-2">
              <Image
                src={studentCardPreview}
                alt="Student Card"
                width={200}
                height={100}
                className="object-cover rounded"
                unoptimized
              />
            </div>
          )}
        </div>

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
};

export default StudentFormInfoBox;