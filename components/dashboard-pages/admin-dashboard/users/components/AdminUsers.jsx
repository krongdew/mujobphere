//components/dashboard-pages/admin-dashboard/users/component/AdminUsers.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const AdminUsers = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'admin',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');


  const fetchUsers = async () => {
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('limit', itemsPerPage);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      
      console.log("Users data received:", data);
      
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / itemsPerPage));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update user role');
      
      // Refetch users to show updated role
      fetchUsers();
      setSuccessMessage('อัพเดทบทบาทผู้ใช้สำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setErrorMessage('ไม่สามารถอัพเดทบทบาทผู้ใช้ได้');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const updateApprovalStatus = async (userId, status) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          role: status === 'approved' ? 'employeroutside' : 'waituser' 
        }),
      });

      if (!response.ok) throw new Error('Failed to update approval status');
      
      // Refetch users to show updated status
      fetchUsers();
      setSuccessMessage(status === 'approved' ? 'อนุมัติผู้ใช้สำเร็จ' : 'ปฏิเสธผู้ใช้สำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating approval status:', error);
      setErrorMessage('ไม่สามารถอัพเดทสถานะการอนุมัติได้');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  //components/dashboard-pages/admin-dashboard/users/component/AdminUsers.jsx
// เฉพาะฟังก์ชัน deleteUser ที่ต้องอัพเดท (ไม่ใช่โค้ดทั้งไฟล์)

const deleteUser = async (userId) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้?')) return;
    
    try {
      setLoading(true);
      
      // เรียกใช้ API ลบโดยตรงแทน
      const response = await fetch(`/api/admin/users/${userId}/direct-delete`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error deleting user:', errorData);
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      // Refetch users to update the list
      fetchUsers();
      setSuccessMessage('ลบผู้ใช้สำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage('ไม่สามารถลบผู้ใช้ได้: ' + (error.message || 'Unknown error'));
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // เพิ่มฟังก์ชันสำหรับกรองข้อมูล
const filteredUsers = users.filter(user => {
  // กรองตามคำค้นหา
  const searchMatch = 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.faculty?.toLowerCase().includes(searchTerm.toLowerCase());
  
  // กรองตามสถานะ
  const statusMatch = 
    statusFilter === 'all' || 
    (statusFilter === 'pending' && user.approval_status === 'pending') ||
    (statusFilter === 'approved' && user.approval_status === 'approved') ||
    (statusFilter === 'rejected' && user.approval_status === 'rejected');
  
  // กรองตามบทบาท
  const roleMatch = 
    roleFilter === 'all' || 
    user.role === roleFilter;
  
  return searchMatch && statusMatch && roleMatch;
});

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (newUser.password !== newUser.confirmPassword) {
      setErrorMessage('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          password: newUser.password
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add user');
      }
      
      // Clear form and close modal
      setNewUser({
        email: '',
        name: '',
        role: 'admin',
        password: '',
        confirmPassword: ''
      });
      setShowAddModal(false);
      
      // Refetch users to update the list
      fetchUsers();
      setSuccessMessage('เพิ่มผู้ใช้สำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding user:', error);
      setErrorMessage(error.message || 'ไม่สามารถเพิ่มผู้ใช้ได้');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedUser.email,
          name: selectedUser.name,
          role: selectedUser.role
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }
      
      // Close modal
      setShowEditModal(false);
      setSelectedUser(null);
      
      // Refetch users to update the list
      fetchUsers();
      setSuccessMessage('แก้ไขผู้ใช้สำเร็จ');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating user:', error);
      setErrorMessage(error.message || 'ไม่สามารถแก้ไขผู้ใช้ได้');
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

  const renderAddUserModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">เพิ่มผู้ใช้ใหม่</h5>
              <button type="button" className="close" onClick={() => setShowAddModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>อีเมล</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ชื่อ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>บทบาท</label>
                  <select 
                    className="form-control" 
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="admin">ผู้ดูแลระบบ</option>
                    <option value="student">นักศึกษา</option>
                    <option value="employer">นายจ้างภายใน</option>
                    <option value="employeroutside">นายจ้างภายนอก</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>รหัสผ่าน</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ยืนยันรหัสผ่าน</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    required
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                  />
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

  const renderEditUserModal = () => {
    if (!showEditModal || !selectedUser) return null;

    return (
      <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">แก้ไขผู้ใช้</h5>
              <button type="button" className="close" onClick={() => setShowEditModal(false)}>
                <span>&times;</span>
              </button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label>อีเมล</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>ชื่อ</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>บทบาท</label>
                  <select 
                    className="form-control" 
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                  >
                    <option value="admin">ผู้ดูแลระบบ</option>
                    <option value="student">นักศึกษา</option>
                    <option value="employer">นายจ้างภายใน</option>
                    <option value="employeroutside">นายจ้างภายนอก</option>
                    <option value="waituser">รอการอนุมัติ</option>
                  </select>
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
    <h4>จัดการผู้ใช้งาน</h4>
    
    <div className="chosen-outer">
      {/* ปุ่มกรองรายการรอพิจารณา (ถ้าต้องการ) */}
      {/* <button 
        className="btn btn-outline-primary mr-2" 
        onClick={() => {
          setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending');
          setRoleFilter('waituser');
        }}
      >
        <i className="la la-clock-o"></i> รายการรอพิจารณา
      </button> */}
      
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

  {/* ส่วนค้นหาและตัวกรอง - แยกออกมาจาก widget-title */}
  <div className="search-filter-box mb-4 m-lg-4">
    <div className="row">
      <div className="col-md-6 mb-3">
        <div className="input-group">
          <input 
            type="text" 
            className="form-control" 
            placeholder="ค้นหาด้วยชื่อ, อีเมล, คณะ..." 
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
      <div className="col-md-3 col-6 mb-3">
        <select 
          className="form-control" 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="pending">รอพิจารณา</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ปฏิเสธแล้ว</option>
        </select>
      </div>
      <div className="col-md-3 col-6 mb-3">
        <select 
          className="form-control" 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">บทบาททั้งหมด</option>
          <option value="admin">ผู้ดูแลระบบ</option>
          <option value="student">นักศึกษา</option>
          <option value="employer">นายจ้างภายใน</option>
          <option value="employeroutside">นายจ้างภายนอก</option>
          <option value="waituser">รอการอนุมัติ</option>
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
                <th>ข้อมูลผู้ใช้</th>
                <th>บทบาท</th>
                <th>สถานะการอนุมัติ</th>
                <th>วันที่สร้าง</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="job-block">
                      <div className="inner-box">
                        <div className="content" style={{paddingLeft: 0}}>
                          <h4>{user.name}</h4>
                          <div>
                            <strong>อีเมล:</strong> {user.email}
                          </div>
                          {user.department && (
                            <div>
                              <strong>แผนก:</strong> {user.department}
                            </div>
                          )}
                          {user.faculty && (
                            <div>
                              <strong>คณะ:</strong> {user.faculty}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.role === 'admin' && 'ผู้ดูแลระบบ'}
                    {user.role === 'student' && 'นักศึกษา'}
                    {user.role === 'employer' && 'นายจ้างภายใน'}
                    {user.role === 'employeroutside' && 'นายจ้างภายนอก'}
                    {user.role === 'waituser' && 'รอการอนุมัติ'}
                  </td>
                  <td className={`status ${user.approval_status}`}>
                    {(user.role === 'employeroutside' || user.role === 'waituser') ? (
                        <>
                        {user.approval_status === 'pending' && 'รอพิจารณา'}
                        {user.approval_status === 'approved' && 'อนุมัติแล้ว'}
                        {user.approval_status === 'rejected' && 'ปฏิเสธแล้ว'}
                        {!user.approval_status && '-'}
                        </>
                    ) : (
                        '-'
                    )}
                    </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="option-box">
                      <ul className="option-list">
                        <li>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            data-text="แก้ไข"
                          >
                            <span className="la la-edit"></span>
                          </button>
                        </li>
                        {user.role === 'waituser' && (
                          <>
                            <li>
                              <button
                                onClick={() => updateApprovalStatus(user.id, 'approved')}
                                data-text="อนุมัติ"
                              >
                                <span className="la la-check-circle"></span>
                              </button>
                            </li>
                            <li>
                              <button
                                onClick={() => updateApprovalStatus(user.id, 'rejected')}
                                data-text="ปฏิเสธ"
                              >
                                <span className="la la-times-circle"></span>
                              </button>
                            </li>
                          </>
                        )}
                        <li>
                        {user.email !== 'dewwiisunny14@gmail.com' && (
                            <>
                          <button
                            onClick={() => deleteUser(user.id)}
                            data-text="ลบ"
                          >
                            <span className="la la-trash"></span>
                          </button>
                          </>
                        )}
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">ไม่พบข้อมูลผู้ใช้</td>
                </tr>
              )}
            </tbody>
          </table>
          
          {renderPagination()}
        </div>
      </div>

      {renderAddUserModal()}
      {renderEditUserModal()}
    </div>
  );
};

export default AdminUsers;