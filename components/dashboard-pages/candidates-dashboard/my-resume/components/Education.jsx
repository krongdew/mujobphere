'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Education = () => {
  const { data: session } = useSession();
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const [formData, setFormData] = useState({
    school_name: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    fetchEducations();
  }, [session]);

  const fetchEducations = async () => {
    try {
      const response = await fetch('/api/student/education');
      if (!response.ok) throw new Error('Failed to fetch educations');
      const data = await response.json();
      setEducations(data);
    } catch (err) {
      console.error('Error fetching educations:', err);
      setError('Failed to load educations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

 
  const clearForm = () => {
    setFormData({
      school_name: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setEditingEducation(null);
  };

  const handleModalSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const response = await fetch('/api/student/education', {
        method: editingEducation ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingEducation ? 
          { ...formData, id: editingEducation.id } : 
          formData
        ),
      });

      if (!response.ok) throw new Error('Failed to save education');

      await fetchEducations();
      
      // แสดงข้อความสำเร็จ
      setSuccessMessage(editingEducation ? 'อัพเดทข้อมูลการศึกษาเรียบร้อยแล้ว' : 'เพิ่มข้อมูลการศึกษาเรียบร้อยแล้ว');
      
      // เคลียร์ฟอร์ม
      clearForm();
      
      // ซ่อนข้อความหลังจาก 3 วินาที
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error saving education:', err);
      setError('Failed to save education');
    }
  };
  
  const handleEdit = (education) => {
    setEditingEducation(education);
    setFormData({
      school_name: education.school_name,
      degree: education.degree,
      field_of_study: education.field_of_study,
      start_date: education.start_date.split('T')[0],
      end_date: education.end_date?.split('T')[0] || '',
      description: education.description
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education?')) {
      return;
    }

    try {
      const response = await fetch('/api/student/education', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete education');

      await fetchEducations();
    } catch (err) {
      console.error('Error deleting education:', err);
      setError('Failed to delete education');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="resume-outer">
    <div className="upper-title">
      <h4>Education</h4>
      <button
        type="button"
        className="add-info-btn"
        data-bs-toggle="modal"
        data-bs-target="#educationModal"
        onClick={clearForm} // เคลียร์ฟอร์มเมื่อกดปุ่ม Add Education
      >
        <span className="icon flaticon-plus"></span> Add Education
      </button>
    </div>

      {/* Display Education List */}
      {educations.map((education) => (
        <div key={education.id} className="resume-block">
          <div className="inner">
            <span className="name">{education.school_name[0]}</span>
            <div className="title-box">
              <div className="info-box">
                <h3>{education.degree}</h3>
                <span>{education.school_name}</span>
              </div>
              <div className="edit-box">
                <span className="year">
                  {new Date(education.start_date).getFullYear()} - 
                  {education.end_date ? new Date(education.end_date).getFullYear() : 'Present'}
                </span>
                <div className="edit-btns">
                  <button 
                    type="button" 
                    data-bs-toggle="modal"
                    data-bs-target="#educationModal"
                    onClick={() => handleEdit(education)}
                  >
                    <span className="la la-pencil"></span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDelete(education.id)}
                  >
                    <span className="la la-trash"></span>
                  </button>
                </div>
              </div>
            </div>
            <div className="text">{education.description}</div>
          </div>
        </div>
      ))}

      {/* Bootstrap Modal */}
 
      {/* Modal */}
      <div className="modal fade" id="educationModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingEducation ? 'Edit Education' : 'Add Education'}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={clearForm} // เคลียร์ฟอร์มเมื่อปิด modal
              ></button>
            </div>
            <div className="modal-body">
            {successMessage && (
                <div className="alert alert-success mb-3">{successMessage}</div>
              )}

              <div className="form-group">
                <label>School Name *</label>
                <input
                  type="text"
                  name="school_name"
                  className="form-control"
                  value={formData.school_name}
                  onChange={handleInputChange}
                  required
                />
              </div>


              <div className="form-group">
                <label>Degree *</label>
                <input
                  type="text"
                  name="degree"
                  className="form-control"
                  value={formData.degree}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Field of Study *</label>
                <input
                  type="text"
                  name="field_of_study"
                  className="form-control"
                  value={formData.field_of_study}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  className="form-control"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="end_date"
                  className="form-control"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
                <button
                  type="button"
                  className="theme-btn btn-style-three"
                  data-bs-dismiss="modal"
                  onClick={clearForm} // เคลียร์ฟอร์มเมื่อกดปุ่ม Close
                >
                  Close
                </button>
                <button 
                  type="button"
                  className="theme-btn btn-style-one"
                  onClick={handleModalSubmit}
                >
                  {editingEducation ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
};

export default Education;