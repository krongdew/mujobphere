'use client'
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const SkillsMultiple = () => {
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    description: '',
    programming_skills: '',
    language_skills: '',
    other_skills: ''
  });

  useEffect(() => {
    fetchSkillsData();
  }, []);

  const fetchSkillsData = async () => {
    try {
      const response = await fetch('/api/student/resume');
      if (!response.ok) throw new Error('Failed to fetch data');
      
      const data = await response.json();
      setFormData({
        description: data.description || '',
        programming_skills: data.programming_skills || '',
        language_skills: data.language_skills || '',
        other_skills: data.other_skills || ''
      });
    } catch (err) {
      console.error('Error fetching data:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // เช็คการยอมรับเงื่อนไขก่อนส่งฟอร์ม
    if (!acceptTerms) {
      setError("กรุณายอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว");
      return;
    }
    
    // ล้างข้อความผิดพลาด
    setError("");
    
    // ฟังก์ชันกรองข้อมูล
    const sanitizeInput = (input) => {
      // กรองเฉพาะอักขระที่อนุญาต
      return input 
        ? input.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '').trim() 
        : '';
    };
  
    // กรองข้อมูล
    const cleanFormData = {
      description: sanitizeInput(formData.description),
      programming_skills: sanitizeInput(formData.programming_skills),
      language_skills: sanitizeInput(formData.language_skills),
      other_skills: sanitizeInput(formData.other_skills)
    };
  
    try {
      const response = await fetch('/api/student/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(cleanFormData)
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }
  
      setSuccessMessage('บันทึกข้อมูลเรียบร้อยแล้ว');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
  
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="form-group col-lg-12 col-md-12">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-control"
            placeholder="Briefly describe your professional background and career objectives..."
            rows="4"
          />
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <label>Programming Skills *</label>
          <textarea
            name="programming_skills"
            value={formData.programming_skills}
            onChange={handleInputChange}
            className="form-control"
            placeholder="List programming tools and technologies you are familiar with (e.g., VS Code, Eclipse, Git, Docker)"
            rows="3"
            required
          />
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <label>Language Skills *</label>
          <textarea
            name="language_skills"
            value={formData.language_skills}
            onChange={handleInputChange}
            className="form-control"
            placeholder="List languages you can communicate in (e.g., Thai-Native, English-Intermediate)"
            rows="3"
            required
          />
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <label>Other Skills</label>
          <textarea
            name="other_skills"
            value={formData.other_skills}
            onChange={handleInputChange}
            className="form-control"
            placeholder="List any other skills you have (e.g., Leadership, Problem Solving, Project Management)"
            rows="3"
          />
        </div>

        {error && (
          <div className="col-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="col-12">
            <div className="alert alert-success">{successMessage}</div>
          </div>
        )}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <div className="input-group checkboxes square">
            <input
              type="checkbox"
              name="remember-me"
              id="rememberMe"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="remember">
              <span className="custom-checkbox"></span> You accept our{" "}
              <span data-bs-dismiss="modal">
                <Link href="https://privacy.mahidol.ac.th/en/mu-data-privacy-policy/">
                  Terms and Conditions and Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <button type="submit" className="theme-btn btn-style-one">
            Save
          </button>
        </div>
      </div>
    </form>
  );
};

export default SkillsMultiple;