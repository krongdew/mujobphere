//components/dashboard-pages/admin-dashboard/faculties/component/AdminFaculties.jsx
'use client';

import { useState, useEffect } from 'react';

const AdminFaculties = () => {
  const [loading, setLoading] = useState(true);
  const [faculties, setFaculties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    is_active: true
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchFaculties = async () => {
    try {
      const url = new URL('/api/admin/faculties', window.location.origin);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', itemsPerPage);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch faculties');
      const data = await response.json();
      
      console.log("Faculties data received:", data);
      
      setFaculties(data.faculties);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, [currentPage, itemsPerPage]);

  const updateFacultyStatus = async (facultyId, isActive) => {
    try {
      const response = await fetch(`/api/admin/faculties/${facultyId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update faculty status');
      }
      
      // Refetch faculties to show updated status
      fetchFaculties();
      setSuccessMessage(`อัพเดทสถานะเป็น${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}สำเร็จ`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating faculty status:', error);
      setErrorMessage(error.message || 'ไม่สามารถอัพเดทสถานะได้');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const deleteFaculty = async (facultyId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคณะนี้?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/faculties/${facultyId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete faculty');
      }
      
      // Refetch faculties to update the list
      fetchFaculties();
      setSuccessMessage('ลบคณะสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting faculty:', error);
      setErrorMessage(error.message || 'ไม่สามารถลบคณะได้');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับกรองข้อมูล
  const filteredFaculties = faculties.filter(faculty => {
    // กรองตามคำค้นหา
    const searchMatch = 
      faculty.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // กรองตามสถานะการใช้งาน
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && faculty.is_active) || 
      (statusFilter === 'inactive' && !faculty.is_active);
    
    return searchMatch && statusMatch;
  });

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFaculty.name,
          is_active: newFaculty.is_active
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add faculty');
      }
      
      // Clear form and close modal
      setNewFaculty({
        name: '',
        is_active: true
      });
      setShowAddModal(false);
      
      // Refetch faculties to update the list
      fetchFaculties();
      setSuccessMessage('เพิ่มคณะสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding faculty:', error);
      setErrorMessage(error.message || 'ไม่สามารถเพิ่มคณะได้');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEditFaculty = async (e) => {
    e.preventDefault();
    
    if (!selectedFaculty) return;

    try {
      const response = await fetch(`/api/admin/faculties/${selectedFaculty.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedFaculty.name,
          is_active: selectedFaculty.is_active
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update faculty');
      }
      
      // Close modal
      setShowEditModal(false);
      setSelectedFaculty(null);
      
      // Refetch faculties to update the list
      fetchFaculties();
      setSuccessMessage('แก้ไขคณะสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating faculty:', error);
      setErrorMessage(error.message || 'ไม่สามารถแก้ไขคณะได้');
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

  const renderAddFacultyModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เพิ่มคณะใหม่</h5>
              <button type="button" className="close" onClick={() => setShowAddModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddFaculty}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ชื่อคณะ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={newFaculty.name}
                    onChange={(e) => setNewFaculty({...newFaculty, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>สถานะการใช้งาน</label>
                  <div className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      id="isActiveCheckbox"
                      checked={newFaculty.is_active}
                      onChange={(e) => setNewFaculty({...newFaculty, is_active: e.target.checked})}
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

  const renderEditFacultyModal = () => {
    if (!showEditModal || !selectedFaculty) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">แก้ไขคณะ</h5>
              <button type="button" className="close" onClick={() => setShowEditModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleEditFaculty}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ชื่อคณะ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={selectedFaculty.name}
                    onChange={(e) => setSelectedFaculty({...selectedFaculty, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>สถานะการใช้งาน</label>
                  <div className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      id="editIsActiveCheckbox"
                      checked={selectedFaculty.is_active}
                      onChange={(e) => setSelectedFaculty({...selectedFaculty, is_active: e.target.checked})}
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
        <h4>จัดการคณะ</h4>
        
        <div className="chosen-outer">
          <button
            className="btn btn-primary mr-2"
            onClick={() => setShowAddModal(true)}
          >
            <i className="la la-plus"></i> เพิ่มคณะใหม่
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
          <div className="col-md-6 mb-3">
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="ค้นหาด้วยชื่อคณะ..." 
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
          <div className="col-md-6 mb-3">
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
                <th>ชื่อคณะ</th>
                <th>สถานะการใช้งาน</th>
                <th>อัพเดทล่าสุด</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content" style={{paddingLeft: 0}}>
                          <h4>{faculty.name}</h4>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${faculty.is_active ? 'active' : 'inactive'}`}>
                      {faculty.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td>{formatDate(faculty.updated_at || faculty.created_at)}</td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedFaculty(faculty);
                              setShowEditModal(true);
                            }}
                            data-text="แก้ไข"
                          >
                            <span className="la la-edit"></span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => updateFacultyStatus(faculty.id, !faculty.is_active)}
                            data-text={faculty.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            <span className={`la la-${faculty.is_active ? 'ban' : 'check-circle'}`}></span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => deleteFaculty(faculty.id)}
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
              {filteredFaculties.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">ไม่พบข้อมูลคณะ</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {renderPagination()}
        </div>
      </div>

      {renderAddFacultyModal()}
      {renderEditFacultyModal()}
    </div>
  );
};

export default AdminFaculties;