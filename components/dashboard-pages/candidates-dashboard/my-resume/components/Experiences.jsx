'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Experiences = () => {
  const { data: session } = useSession();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingExperience, setEditingExperience] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    fetchExperiences();
  }, [session]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/student/experience');
      if (!response.ok) throw new Error('Failed to fetch experiences');
      const data = await response.json();
      setExperiences(data);
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError('Failed to load experiences');
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
      company_name: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setEditingExperience(null);
  };

  const handleModalSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const response = await fetch('/api/student/experience', {
        method: editingExperience ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingExperience ? 
          { ...formData, id: editingExperience.id } : 
          formData
        ),
      });

      if (!response.ok) throw new Error('Failed to save experience');

      await fetchExperiences();
      
      // แสดงข้อความสำเร็จ
      setSuccessMessage(editingExperience ? 'อัพเดทข้อมูลประสบการณ์เรียบร้อยแล้ว' : 'เพิ่มข้อมูลประสบการณ์เรียบร้อยแล้ว');
      
      // เคลียร์ฟอร์ม
      clearForm();
      
      // ซ่อนข้อความหลังจาก 3 วินาที
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error saving experience:', err);
      setError('Failed to save experience');
    }
  };

  const handleEdit = (experience) => {
    setEditingExperience(experience);
    setFormData({
      company_name: experience.company_name,
      position: experience.position,
      start_date: experience.start_date.split('T')[0],
      end_date: experience.end_date?.split('T')[0] || '',
      description: experience.description
    });
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    try {
      const response = await fetch('/api/student/experience', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete experience');

      await fetchExperiences();
    } catch (err) {
      console.error('Error deleting experience:', err);
      setError('Failed to delete experience');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="resume-outer theme-blue">
      <div className="upper-title">
        <h4>Work & Experience</h4>
        <button 
          type="button"
          className="add-info-btn"
          data-bs-toggle="modal"
          data-bs-target="#experienceModal"
          onClick={clearForm}
        >
          <span className="icon flaticon-plus"></span> Add Work
        </button>
      </div>

      {/* Display Experience List */}
      {experiences.map((experience) => (
        <div key={experience.id} className="resume-block">
          <div className="inner">
            <span className="name">{experience.company_name[0]}</span>
            <div className="title-box">
              <div className="info-box">
                <h3>{experience.position}</h3>
                <span>{experience.company_name}</span>
              </div>
              <div className="edit-box">
                <span className="year">
                  {new Date(experience.start_date).getFullYear()} - 
                  {experience.end_date ? 
                    new Date(experience.end_date).getFullYear() : 
                    'Present'}
                </span>
                <div className="edit-btns">
                  <button 
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#experienceModal"
                    onClick={() => handleEdit(experience)}
                  >
                    <span className="la la-pencil"></span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(experience.id)}
                  >
                    <span className="la la-trash"></span>
                  </button>
                </div>
              </div>
            </div>
            <div className="text">{experience.description}</div>
          </div>
        </div>
      ))}

      {/* Bootstrap Modal */}
      <div className="modal fade" id="experienceModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingExperience ? 'Edit Experience' : 'Add Experience'}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={clearForm}
              ></button>
            </div>
            <div className="modal-body">
              {/* แสดงข้อความแจ้งเตือน */}
              {successMessage && (
                <div className="alert alert-success mb-3">{successMessage}</div>
              )}

              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company_name"
                  className="form-control"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Position *</label>
                <input
                  type="text"
                  name="position"
                  className="form-control"
                  value={formData.position}
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
                onClick={clearForm}
              >
                Close
              </button>
              <button 
                type="button"
                className="theme-btn btn-style-one"
                onClick={handleModalSubmit}
              >
                {editingExperience ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Experiences;