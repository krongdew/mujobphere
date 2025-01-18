'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Awards = () => {
  const { data: session } = useSession();
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingAward, setEditingAward] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date_received: '',
    description: ''
  });

  useEffect(() => {
    fetchAwards();
  }, [session]);

  const fetchAwards = async () => {
    try {
      const response = await fetch('/api/student/award');
      if (!response.ok) throw new Error('Failed to fetch awards');
      const data = await response.json();
      setAwards(data);
    } catch (err) {
      console.error('Error fetching awards:', err);
      setError('Failed to load awards');
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
      title: '',
      issuer: '',
      date_received: '',
      description: ''
    });
    setEditingAward(null);
  };

  const handleModalSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const response = await fetch('/api/student/award', {
        method: editingAward ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingAward ? 
          { ...formData, id: editingAward.id } : 
          formData
        ),
      });

      if (!response.ok) throw new Error('Failed to save award');

      await fetchAwards();
      
      // แสดงข้อความสำเร็จ
      setSuccessMessage(editingAward ? 'อัพเดทข้อมูลรางวัลเรียบร้อยแล้ว' : 'เพิ่มข้อมูลรางวัลเรียบร้อยแล้ว');
      
      // เคลียร์ฟอร์ม
      clearForm();
      
      // ซ่อนข้อความหลังจาก 3 วินาที
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error saving award:', err);
      setError('Failed to save award');
    }
  };

  const handleEdit = (award) => {
    setEditingAward(award);
    setFormData({
      title: award.title,
      issuer: award.issuer,
      date_received: award.date_received.split('T')[0],
      description: award.description
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this award?')) {
      return;
    }

    try {
      const response = await fetch('/api/student/award', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete award');

      await fetchAwards();
    } catch (err) {
      console.error('Error deleting award:', err);
      setError('Failed to delete award');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="resume-outer theme-yellow">
      <div className="upper-title">
        <h4>Awards</h4>
        <button 
          type="button"
          className="add-info-btn"
          data-bs-toggle="modal"
          data-bs-target="#awardModal"
          onClick={clearForm}
        >
          <span className="icon flaticon-plus"></span> Add Award
        </button>
      </div>

      {/* Display Awards List */}
      {awards.map((award) => (
        <div key={award.id} className="resume-block">
          <div className="inner">
            <span className="name">{award.title[0]}</span>
            <div className="title-box">
              <div className="info-box">
                <h3>{award.title}</h3>
                <span>{award.issuer}</span>
              </div>
              <div className="edit-box">
                <span className="year">
                  {new Date(award.date_received).getFullYear()}
                </span>
                <div className="edit-btns">
                  <button 
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#awardModal"
                    onClick={() => handleEdit(award)}
                  >
                    <span className="la la-pencil"></span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleDelete(award.id)}
                  >
                    <span className="la la-trash"></span>
                  </button>
                </div>
              </div>
            </div>
            <div className="text">{award.description}</div>
          </div>
        </div>
      ))}

      {/* Bootstrap Modal */}
      <div className="modal fade" id="awardModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editingAward ? 'Edit Award' : 'Add Award'}
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
                <label>Award Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Issuer *</label>
                <input
                  type="text"
                  name="issuer"
                  className="form-control"
                  value={formData.issuer}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date Received *</label>
                <input
                  type="date"
                  name="date_received"
                  className="form-control"
                  value={formData.date_received}
                  onChange={handleInputChange}
                  required
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
                {editingAward ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Awards;