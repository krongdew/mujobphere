//components/dashboard-pages/admin-dashboard/job-types/component/AdminJobTypes.jsx
'use client';

import { useState, useEffect } from 'react';

const AdminJobTypes = () => {
  const [loading, setLoading] = useState(true);
  const [jobTypes, setJobTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [newJobType, setNewJobType] = useState({
    name: '',
    hire_type: 'faculty',
    is_active: true
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hireTypeFilter, setHireTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchJobTypes = async () => {
    try {
      const url = new URL('/api/admin/job-types', window.location.origin);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', itemsPerPage);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch job types');
      const data = await response.json();
      
      console.log("Job types data received:", data);
      
      setJobTypes(data.jobTypes);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching job types:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobTypes();
  }, [currentPage, itemsPerPage]);

  const updateJobTypeStatus = async (jobTypeId, isActive) => {
    try {
      const response = await fetch(`/api/admin/job-types/${jobTypeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update job type status');
      }
      
      // Refetch job types to show updated status
      fetchJobTypes();
      setSuccessMessage(`อัพเดทสถานะเป็น${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}สำเร็จ`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating job type status:', error);
      setErrorMessage(error.message || 'ไม่สามารถอัพเดทสถานะได้');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const deleteJobType = async (jobTypeId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบประเภทงานนี้?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/job-types/${jobTypeId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete job type');
      }
      
      // Refetch job types to update the list
      fetchJobTypes();
      setSuccessMessage('ลบประเภทงานสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting job type:', error);
      setErrorMessage(error.message || 'ไม่สามารถลบประเภทงานได้');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับกรองข้อมูล
  const filteredJobTypes = jobTypes.filter(jobType => {
    // กรองตามคำค้นหา
    const searchMatch = 
      jobType.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // กรองตามประเภทการจ้าง
    const hireTypeMatch = 
      hireTypeFilter === 'all' || 
      jobType.hire_type === hireTypeFilter;
    
    // กรองตามสถานะการใช้งาน
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && jobType.is_active) || 
      (statusFilter === 'inactive' && !jobType.is_active);
    
    return searchMatch && hireTypeMatch && statusMatch;
  });

  const handleAddJobType = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/job-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newJobType.name,
          hire_type: newJobType.hire_type,
          is_active: newJobType.is_active
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add job type');
      }
      
      // Clear form and close modal
      setNewJobType({
        name: '',
        hire_type: 'faculty',
        is_active: true
      });
      setShowAddModal(false);
      
      // Refetch job types to update the list
      fetchJobTypes();
      setSuccessMessage('เพิ่มประเภทงานสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding job type:', error);
      setErrorMessage(error.message || 'ไม่สามารถเพิ่มประเภทงานได้');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEditJobType = async (e) => {
    e.preventDefault();
    
    if (!selectedJobType) return;

    try {
      const response = await fetch(`/api/admin/job-types/${selectedJobType.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedJobType.name,
          hire_type: selectedJobType.hire_type,
          is_active: selectedJobType.is_active
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update job type');
      }
      
      // Close modal
      setShowEditModal(false);
      setSelectedJobType(null);
      
      // Refetch job types to update the list
      fetchJobTypes();
      setSuccessMessage('แก้ไขประเภทงานสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating job type:', error);
      setErrorMessage(error.message || 'ไม่สามารถแก้ไขประเภทงานได้');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const bangkokDate = new Date(
        date.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })
      );
      return bangkokDate.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav className="pagination-wrap">
        <ul className="pagination">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="la la-angle-left"></span>
            </button>
          </li>
          
          {startPage > 1 && (
            <>
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(1)}
                >
                  1
                </button>
              </li>
              {startPage > 2 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
            </>
          )}
          
          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            </li>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <li className="page-item disabled">
                  <span className="page-link">...</span>
                </li>
              )}
              <li className="page-item">
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </button>
              </li>
            </>
          )}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="la la-angle-right"></span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const renderAddJobTypeModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เพิ่มประเภทงานใหม่</h5>
              <button type="button" className="close" onClick={() => setShowAddModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddJobType}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ชื่อประเภทงาน</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={newJobType.name}
                    onChange={(e) => setNewJobType({...newJobType, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ประเภทการจ้าง</label>
                  <select 
                    className="form-control" 
                    value={newJobType.hire_type}
                    onChange={(e) => setNewJobType({...newJobType, hire_type: e.target.value})}
                  >
                    <option value="faculty">คณะ/หน่วยงาน</option>
                    <option value="personal">ส่วนบุคคล</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>สถานะการใช้งาน</label>
                  <div className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      id="isActiveCheckbox"
                      checked={newJobType.is_active}
                      onChange={(e) => setNewJobType({...newJobType, is_active: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="isActiveCheckbox">
                      เปิดใช้งาน
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderEditJobTypeModal = () => {
    if (!showEditModal || !selectedJobType) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">แก้ไขประเภทงาน</h5>
              <button type="button" className="close" onClick={() => setShowEditModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleEditJobType}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ชื่อประเภทงาน</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={selectedJobType.name}
                    onChange={(e) => setSelectedJobType({...selectedJobType, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ประเภทการจ้าง</label>
                  <select 
                    className="form-control" 
                    value={selectedJobType.hire_type}
                    onChange={(e) => setSelectedJobType({...selectedJobType, hire_type: e.target.value})}
                  >
                    <option value="faculty">คณะ/หน่วยงาน</option>
                    <option value="personal">ส่วนบุคคล</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>สถานะการใช้งาน</label>
                  <div className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      id="editIsActiveCheckbox"
                      checked={selectedJobType.is_active}
                      onChange={(e) => setSelectedJobType({...selectedJobType, is_active: e.target.checked})}
                    />
                    <label className="form-check-label" htmlFor="editIsActiveCheckbox">
                      เปิดใช้งาน
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="tabs-box">
      <div className="widget-title d-flex justify-content-between align-items-center mb-4">
        <h4>จัดการประเภทงาน</h4>
        
        <div className="chosen-outer">
          <button
            className="btn btn-primary mr-2"
            onClick={() => setShowAddModal(true)}
          >
            <i className="la la-plus"></i> เพิ่มประเภทงานใหม่
          </button>
          
          <select 
            className="form-select" 
            style={{ width: '100px', display: 'inline-block' }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="ml-2" style={{marginLeft: 5}}>รายการต่อหน้า</span>
        </div>
      </div>

      {/* ส่วนค้นหาและตัวกรอง */}
      <div className="search-filter-box mb-4 m-lg-4">
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="ค้นหาด้วยชื่อประเภทงาน..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="input-group-append">
                <span className="input-group-text" style={{paddingBottom:12,paddingTop:12}}>
                  <i className="la la-search"></i>
                </span>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-6 mb-3">
            <select 
              className="form-control" 
              value={hireTypeFilter}
              onChange={(e) => setHireTypeFilter(e.target.value)}
            >
              <option value="all">ประเภทการจ้างทั้งหมด</option>
              <option value="faculty">คณะ/หน่วยงาน</option>
              <option value="personal">ส่วนบุคคล</option>
            </select>
          </div>
          <div className="col-md-4 col-6 mb-3">
            <select 
              className="form-control" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">สถานะทั้งหมด</option>
              <option value="active">เปิดใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
            </select>
          </div>
        </div>
      </div>
      
      {errorMessage && (
        <div className="alert alert-danger mb-3" role="alert">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success mb-3" role="alert">
          {successMessage}
        </div>
      )}

      <div className="widget-content">
        <div className="table-outer">
          <table className="default-table manage-job-table">
            <thead>
              <tr>
                <th>ชื่อประเภทงาน</th>
                <th>ประเภทการจ้าง</th>
                <th>สถานะการใช้งาน</th>
                <th>อัพเดทล่าสุด</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobTypes.map((jobType) => (
                <tr key={jobType.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content" style={{paddingLeft: 0}}>
                          <h4>{jobType.name}</h4>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {jobType.hire_type === 'faculty' ? 'คณะ/หน่วยงาน' : 'ส่วนบุคคล'}
                  </td>
                  <td>
                    <span className={`status ${jobType.is_active ? 'active' : 'inactive'}`}>
                      {jobType.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td>{formatDate(jobType.updated_at || jobType.created_at)}</td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedJobType(jobType);
                              setShowEditModal(true);
                            }}
                            data-text="แก้ไข"
                          >
                            <span className="la la-edit"></span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => updateJobTypeStatus(jobType.id, !jobType.is_active)}
                            data-text={jobType.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            <span className={`la la-${jobType.is_active ? 'ban' : 'check-circle'}`}></span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => deleteJobType(jobType.id)}
                            data-text="ลบ"
                          >
                            <span className="la la-trash"></span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobTypes.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">ไม่พบข้อมูลประเภทงาน</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {renderPagination()}
        </div>
      </div>

      {renderAddJobTypeModal()}
      {renderEditJobTypeModal()}
    </div>
  );
};

export default AdminJobTypes;