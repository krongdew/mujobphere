"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from 'next/navigation';

const LogoCoverUploader = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [currentCover, setCurrentCover] = useState("");

// ฟังก์ชัน getPublicPath
const getPublicPath = (path) => {
  if (!path) return '';
  
  // แปลง HTML entities
  let cleanPath = path.replace(/&#x2F;/g, '/');
  
  // เอาเฉพาะส่วน filename
  const filename = cleanPath.split('/').pop();
  
  return `/images/uploads/${filename}`;
};



  useEffect(() => {
    const fetchImages = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/profile/${session.user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        console.log('Profile data:', data);

        if (data.company_logo) {
          const logoPath = getPublicPath(data.company_logo);
          console.log('Logo path:', logoPath);
          setCurrentLogo(logoPath);
        }

        if (data.company_cover) {
          const coverPath = getPublicPath(data.company_cover);
          console.log('Cover path:', coverPath);
          setCurrentCover(coverPath);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Failed to load images");
      }
    };

    fetchImages();
  }, [session?.user?.id]);

// ฟังก์ชัน getImageUrl
const getImageUrl = (path) => {
  if (!path) return '';
  
  // ถ้าเป็น path เต็มแล้วให้ใช้เลย
  if (path.startsWith('/images/uploads/')) {
    return path;
  }
  
  // ถ้าไม่ใช่ให้แปลงเป็น path ที่ถูกต้อง
  return `/images/uploads/${path.split('/').pop()}`;
};

  const uploadFile = async (file, type) => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();

      if (type === "logo") {
        setCurrentLogo(data.url);
      } else {
        setCurrentCover(data.url);
      }
    } catch (err) {
      setError(err.message);
      console.error("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logoHandler = async (file) => {
    await uploadFile(file, "logo");
  };

  const coverHandler = async (file) => {
    await uploadFile(file, "cover");
  };




  return (
    <>
      {error && <div className="alert alert-danger mb-4">{error}</div>}
      
      {currentLogo && (
        <div className="mt-2">
          <div className="text ml-2" style={{ marginBottom: '10px' }}>
            รูปโลโก้ / รูปโปรไฟล์ปัจจุบัน
          </div>
          {/* <div style={{ marginBottom: '5px' }}>Debug path: {getImageUrl(currentLogo)}</div> */}
          <Image
            src={getImageUrl(currentLogo)}
            alt="Company Logo"
            width={100}
            height={100}
            className="object-cover rounded"
            style={{ marginBottom: '10px' }}
            unoptimized
          />
        </div>
      )}
  <div className="text ml-2" style={{ marginTop: '10px' }}>
              อัพโหลดภาพปกใหม่
            </div>
      <div className="uploading-outer">
    
        <div className="uploadButton">
          <input
            className="uploadButton-input"
            type="file"
            name="attachments[]"
            accept="image/jpeg,image/png"
            id="upload"
            onChange={(e) => logoHandler(e.target.files[0])}
            disabled={loading}
          />
          <label className="uploadButton-button ripple-effect" htmlFor="upload">
            {loading ? "Uploading..." : "Browse Logo"}
          </label>
       
          
        </div>
        <div className="text" style={{ marginLeft: '10px' }}>
            Max file size is 1MB, Minimum dimension: 330x300 And Suitable files
            are .jpg & .png
          </div>
      </div>
      {currentCover && (
        <div className="mt-2">
          <div className="text ml-2" style={{ marginBottom: '10px' }}>
            รูปปกปัจจุบัน
          </div>
          {/* <div style={{ marginBottom: '5px' }}>Debug path: {getImageUrl(currentCover)}</div> */}
          <Image
            src={getImageUrl(currentCover)}
            alt="Company Cover"
            width={200}
            height={100}
            className="object-cover rounded"
            style={{ marginBottom: '10px' }}
            unoptimized
          />
        </div>
      )}


<div className="text ml-2" style={{ marginTop: '10px',marginBottom:'-10px' }}>
              อัพโหลดภาพปกใหม่
            </div>
      <div className="uploading-outer mt-4">
        <div className="uploadButton">
          <input
            className="uploadButton-input"
            type="file"
            name="attachments[]"
            accept="image/jpeg,image/png"
            id="upload_cover"
            onChange={(e) => coverHandler(e.target.files[0])}
            disabled={loading}
          />
          <label
            className="uploadButton-button ripple-effect"
            htmlFor="upload_cover"
          >
            {loading ? "Uploading..." : "Browse Cover"}
          </label>
        </div>
        <div className="text" style={{ marginLeft: '10px' }}>
          Max file size is 1MB, Minimum dimension: 330x300 And Suitable files
          are .jpg & .png
        </div>
        
      </div>
    </>
  );
};

export default LogoCoverUploader;
