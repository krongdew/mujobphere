'use client';

import { useState, useEffect } from 'react';

const AdminDepartments = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    is_active: true
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDepartments = async () => {
    try {
      const url = new URL('/api/admin/departments', window.location.origin);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', itemsPerPage);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      
      console.log("Departments data received:", data);
      
      setDepartments(data.departments);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, itemsPerPage]);

  const updateDepartmentStatus = async (departmentId, isActive) => {
    try {
      const response = await fetch(`/api/admin/departments/${departmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update department status');
      }
      
      // Refetch departments to show updated status
      fetchDepartments();
      setSuccessMessage(`อัพเดทสถานะเป็น${isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}สำเร็จ`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating department status:', error);
      setErrorMessage(error.message || 'ไม่สามารถอัพเดทสถานะได้');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const deleteDepartment = async (departmentId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบภาควิชา/ส่วนงานนี้?')) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/departments/${departmentId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }
      
      // Refetch departments to update the list
      fetchDepartments();
      setSuccessMessage('ลบภาควิชา/ส่วนงานสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting department:', error);
      setErrorMessage(error.message || 'ไม่สามารถลบภาควิชา/ส่วนงานได้');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับกรองข้อมูล
  const filteredDepartments = departments.filter(department => {
    // กรองตามคำค้นหา
    const searchMatch = 
      department.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // กรองตามสถานะการใช้งาน
    const statusMatch = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && department.is_active) || 
      (statusFilter === 'inactive' && !department.is_active);
    
    return searchMatch && statusMatch;
  });

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDepartment.name,
          is_active: newDepartment.is_active
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add department');
      }
      
      // Clear form and close modal
      setNewDepartment({
        name: '',
        is_active: true
      });
      setShowAddModal(false);
      
      // Refetch departments to update the list
      fetchDepartments();
      setSuccessMessage('เพิ่มภาควิชา/ส่วนงานสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding department:', error);
      setErrorMessage(error.message || 'ไม่สามารถเพิ่มภาควิชา/ส่วนงานได้');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`/api/admin/departments/${selectedDepartment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedDepartment.name,
          is_active: selectedDepartment.is_active
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update department');
      }
      
      // Close modal
      setShowEditModal(false);
      setSelectedDepartment(null);
      
      // Refetch departments to update the list
      fetchDepartments();
      setSuccessMessage('แก้ไขภาควิชา/ส่วนงานสำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating department:', error);
      setErrorMessage(error.message || 'ไม่สามารถแก้ไขภาควิชา/ส่วนงานได้');
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

  const renderAddDepartmentModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เพิ่มภาควิชา/ส่วนงานใหม่</h5>
              <button type="button" className="close" onClick={() => setShowAddModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ชื่อภาควิชา/ส่วนงาน</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>สถานะการใช้งาน</label>
                  <div className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      id="isActiveCheckbox"
                      checked={newDepartment.is_active}
                      onChange={(e) => setNewDepartment({...newDepartment, is_active: e.target.checked})}
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

  const renderEditDepartmentModal = () => {
    if (!showEditModal || !selectedDepartment) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">แก้ไขภาควิชา/ส่วนงาน</h5>
              <button type="button" className="close" onClick={() => setShowEditModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleEditDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>ชื่อภาควิชา/ส่วนงาน</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={selectedDepartment.name}
                    onChange={(e) => setSelectedDepartment({...selectedDepartment, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>สถานะการใช้งาน</label>
                  <div className="form-check">
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      id="editIsActiveCheckbox"
                      checked={selectedDepartment.is_active}
                      onChange={(e) => setSelectedDepartment({...selectedDepartment, is_active: e.target.checked})}
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
        <h4>จัดการภาควิชา/ส่วนงาน</h4>
        
        <div className="chosen-outer">
          <button
            className="btn btn-primary mr-2"
            onClick={() => setShowAddModal(true)}
          >
            <i className="la la-plus"></i> เพิ่มภาควิชา/ส่วนงานใหม่
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
                placeholder="ค้นหาด้วยชื่อภาควิชา/ส่วนงาน..." 
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
                <th>ชื่อภาควิชา/ส่วนงาน</th>
                <th>สถานะการใช้งาน</th>
                <th>อัพเดทล่าสุด</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((department) => (
                <tr key={department.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content" style={{paddingLeft: 0}}>
                          <h4>{department.name}</h4>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status ${department.is_active ? 'active' : 'inactive'}`}>
                      {department.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td>{formatDate(department.updated_at || department.created_at)}</td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedDepartment(department);
                              setShowEditModal(true);
                            }}
                            data-text="แก้ไข"
                          >
                            <span className="la la-edit"></span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => updateDepartmentStatus(department.id, !department.is_active)}
                            data-text={department.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          >
                            <span className={`la la-${department.is_active ? 'ban' : 'check-circle'}`}></span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => deleteDepartment(department.id)}
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
              {filteredDepartments.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">ไม่พบข้อมูลภาควิชา/ส่วนงาน</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {renderPagination()}
        </div>
      </div>

      {renderAddDepartmentModal()}
      {renderEditDepartmentModal()}
    </div>
  );
};

export default AdminDepartments;