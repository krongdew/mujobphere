// components/dashboard-pages/employers-dashboard/company-profile/components/my-profile/LogoCoverUploader.jsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const LogoCoverUploader = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [currentCover, setCurrentCover] = useState("");

  const getPublicPath = (path) => {
    if (!path) return "";

    // แปลง HTML entities
    let cleanPath = path.replace(/&#x2F;/g, "/");

    // ตรวจสอบว่าเป็น path เต็มหรือไม่
    if (cleanPath.startsWith("/uploads/")) {  // แก้จาก /images/uploads เป็น /uploads
        return cleanPath;
    }

    // เอาเฉพาะส่วน filename
    const filename = cleanPath.split("/").pop();

    // สร้าง path ใหม่
    return `/uploads/${filename}`;  // แก้จาก /images/uploads เป็น /uploads
};

const getImageUrl = (filename) => {
    if (!filename) return '';
    return `/uploads/${filename}`;  // แก้จาก /images/uploads เป็น /uploads
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
        console.log("Profile data:", data);

        // ใช้ชื่อไฟล์จากฐานข้อมูลโดยตรง
        if (data.company_logo) {
          setCurrentLogo(data.company_logo);
        }

        if (data.company_cover) {
          setCurrentCover(data.company_cover);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Failed to load images");
      }
    };

    fetchImages();
  }, [session?.user?.id]);
 
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
          <div className="text ml-2" style={{ marginBottom: "10px" }}>
            รูปโลโก้ / รูปโปรไฟล์ปัจจุบัน
          </div>
          {/* <div style={{ marginBottom: '5px' }}>Debug path: {getImageUrl(currentLogo)}</div> */}
          <Image
            src={getImageUrl(currentLogo)}
            alt="Company Logo"
            width={100}
            height={100}
            className="object-cover rounded"
            style={{ marginBottom: "10px" }}
            unoptimized
          />
          
        </div>
      )}
      <div className="text ml-2" style={{ marginTop: "10px" }}>
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
        <div className="text" style={{ marginLeft: "10px" }}>
          Max file size is 1MB, Minimum dimension: 330x300 And Suitable files
          are .jpg & .png
        </div>
      </div>
      {currentCover && (
        <div className="mt-2">
          <div className="text ml-2" style={{ marginBottom: "10px" }}>
            รูปปกปัจจุบัน
          </div>
          {/* <div style={{ marginBottom: '5px' }}>Debug path: {getImageUrl(currentCover)}</div> */}
          <Image
            src={getImageUrl(currentCover)}
            alt="Company Cover"
            width={200}
            height={100}
            className="object-cover rounded"
            style={{ marginBottom: "10px" }}
            unoptimized
          />
        </div>
      )}

      <div
        className="text ml-2"
        style={{ marginTop: "10px", marginBottom: "-10px" }}
      >
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
        <div className="text" style={{ marginLeft: "10px" }}>
          Max file size is 1MB, Minimum dimension: 330x300 And Suitable files
          are .jpg & .png
        </div>
      </div>
    </>
  );
};

export default LogoCoverUploader;
