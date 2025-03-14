'use client'

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const CvUploader = () => {
    const { data: session } = useSession();
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadedCVs, setUploadedCVs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // ฟังก์ชันตรวจสอบประเภทไฟล์
    const checkFileType = (file) => {
        const allowedType = "application/pdf";
        return file.type === allowedType;
    };

    // ฟังก์ชันตรวจสอบขนาดไฟล์ (ขนาดไม่เกิน 100MB)
    const checkFileSize = (file) => {
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        return file.size <= maxSize;
    };

    // โหลดข้อมูล CV ที่อัพโหลดแล้วเมื่อ component mount
    useEffect(() => {
        if (session?.user?.id) {
            fetchUserCVs();
        }
    }, [session?.user?.id]);

    // ฟังก์ชันดึงข้อมูล CV ที่อัพโหลดแล้ว
    const fetchUserCVs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/student/cv');
            if (!response.ok) throw new Error('Failed to fetch CV data');
            const data = await response.json();
            setUploadedCVs(data);
        } catch (err) {
            console.error('Error fetching CV data:', err);
            toast.error('ไม่สามารถโหลดข้อมูล CV ได้');
        } finally {
            setIsLoading(false);
        }
    };

    // ฟังก์ชันจัดการไฟล์ที่อัพโหลด
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        let errorMsg = "";

        // ตรวจสอบไฟล์ทั้งหมดที่เลือก
        const validFiles = selectedFiles.filter((file) => {
            // ตรวจสอบประเภทไฟล์
            if (!checkFileType(file)) {
                errorMsg = "กรุณาอัพโหลดไฟล์ PDF เท่านั้น";
                return false;
            }

            // ตรวจสอบขนาดไฟล์
            if (!checkFileSize(file)) {
                errorMsg = "ขนาดไฟล์ต้องไม่เกิน 100MB";
                return false;
            }

            // ตรวจสอบว่าไฟล์ซ้ำหรือไม่
            const isExist = files.some((existingFile) => existingFile.name === file.name) ||
                            uploadedCVs.some((cv) => cv.filename === file.name);
            if (isExist) {
                errorMsg = "มีไฟล์นี้อยู่แล้ว";
                return false;
            }

            return true;
        });

        if (errorMsg) {
            setError(errorMsg);
            return;
        }

        if (validFiles.length > 0) {
            setFiles([...files, ...validFiles]);
            setError("");
        }
    };

    // ฟังก์ชันอัพโหลดไฟล์ไปยัง server
    const uploadFiles = async () => {
        if (files.length === 0) {
            toast.error('กรุณาเลือกไฟล์ที่ต้องการอัพโหลด');
            return;
        }

        setLoading(true);
        setError("");

        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/student/cv/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'อัพโหลดไฟล์ไม่สำเร็จ');
                }
            }

            // เคลียร์ไฟล์ที่เลือกหลังจากอัพโหลดสำเร็จ
            setFiles([]);
            toast.success('อัพโหลดไฟล์สำเร็จ');
            
            // โหลดข้อมูล CV ใหม่
            fetchUserCVs();
        } catch (err) {
            console.error('Error uploading files:', err);
            setError(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
            toast.error(err.message || 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์');
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันลบไฟล์ที่เลือก (ก่อนอัพโหลด)
    const removeSelectedFile = (name) => {
        const updatedFiles = files.filter((file) => file.name !== name);
        setFiles(updatedFiles);
    };

    // ฟังก์ชันลบไฟล์ที่อัพโหลดแล้ว
    const deleteUploadedCV = async (cvId) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่ต้องการลบไฟล์ CV นี้?')) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/student/cv/${cvId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'ลบไฟล์ไม่สำเร็จ');
            }

            toast.success('ลบไฟล์สำเร็จ');
            
            // อัพเดทรายการไฟล์ที่อัพโหลดแล้ว
            setUploadedCVs(uploadedCVs.filter(cv => cv.id !== cvId));
        } catch (err) {
            console.error('Error deleting CV:', err);
            toast.error(err.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
        } finally {
            setLoading(false);
        }
    };

    // ฟังก์ชันดาวน์โหลดไฟล์ CV
    const downloadCV = async (cvId, filename) => {
        try {
            const response = await fetch(`/api/student/cv/${cvId}/download`);
            if (!response.ok) throw new Error('ดาวน์โหลดไฟล์ไม่สำเร็จ');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading CV:', err);
            toast.error('ไม่สามารถดาวน์โหลดไฟล์ได้');
        }
    };

    return (
        <>
            <div className="widget-title">
                <h4>อัพโหลด CV (เฉพาะไฟล์ PDF)</h4>
            </div>
            
            {/* ส่วนอัพโหลดไฟล์ */}
            <div className="uploading-resume">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="attachments[]"
                        accept="application/pdf"
                        id="upload"
                        multiple
                        onChange={handleFileChange}
                    />
                    <label className="cv-uploadButton" htmlFor="upload">
                        <span className="title">วางไฟล์ที่นี่เพื่ออัพโหลด</span>
                        <span className="text">
                            รองรับไฟล์ PDF ขนาดไม่เกิน 100MB เท่านั้น
                        </span>
                        <span className="theme-btn btn-style-one">
                            เลือกไฟล์ PDF
                        </span>
                        {error && <p className="ui-danger mt-2">{error}</p>}
                    </label>
                </div>
            </div>

            {/* แสดงไฟล์ที่เลือกแต่ยังไม่ได้อัพโหลด */}
            {files.length > 0 && (
                <div className="mt-4">
                    <h5>ไฟล์ที่เลือก</h5>
                    <div className="files-outer">
                        {files.map((file, i) => (
                            <div key={i} className="file-edit-box">
                                <span className="title">{file.name}</span>
                                <span className="file-size text-muted">
                                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                                <div className="edit-btns">
                                    <button onClick={() => removeSelectedFile(file.name)}>
                                        <span className="la la-trash"></span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3">
                        <button 
                            className="theme-btn btn-style-one" 
                            onClick={uploadFiles}
                            disabled={loading}
                        >
                            {loading ? 'กำลังอัพโหลด...' : 'อัพโหลดไฟล์ทั้งหมด'}
                        </button>
                    </div>
                </div>
            )}

            {/* แสดง CV ที่อัพโหลดแล้ว */}
            <div className="mt-5">
                <h5>CV ที่อัพโหลดแล้ว</h5>
                {isLoading ? (
                    <div>กำลังโหลดข้อมูล...</div>
                ) : uploadedCVs.length > 0 ? (
                    <div className="files-outer">
                        {uploadedCVs.map((cv) => (
                            <div key={cv.id} className="file-edit-box">
                                <span className="title">{cv.filename}</span>
                                <span className="text-muted small d-block">
                                    อัพโหลดเมื่อ: {new Date(cv.uploaded_at).toLocaleString('th-TH')}
                                </span>
                                <div className="edit-btns">
                                    <button onClick={() => downloadCV(cv.id, cv.filename)} title="ดาวน์โหลด">
                                        <span className="la la-download"></span>
                                    </button>
                                    <button onClick={() => deleteUploadedCV(cv.id)} title="ลบไฟล์">
                                        <span className="la la-trash"></span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info">ยังไม่มี CV ที่อัพโหลด</div>
                )}
            </div>
        </>
    );
};

export default CvUploader;