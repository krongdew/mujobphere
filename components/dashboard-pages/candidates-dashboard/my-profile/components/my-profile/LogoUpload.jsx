'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

const LogoUpload = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentLogo, setCurrentLogo] = useState("");

    useEffect(() => {
        const fetchImage = async () => {
            if (!session?.user?.id) return;

            try {
                const response = await fetch(`/api/profile/${session.user.id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }
                const data = await response.json();
                console.log("Profile data:", data);

                if (data.img_student) {
                    setCurrentLogo(data.img_student);
                }
            } catch (error) {
                console.error("Error fetching image:", error);
                setError("Failed to load image");
            }
        };

        fetchImage();
    }, [session?.user?.id]);

    const getImageUrl = (filename) => {
        if (!filename) return '';
        // เอาเฉพาะชื่อไฟล์
        const justFileName = filename.split('/').pop();
        // เรียกผ่าน API
        return `/api/image/${justFileName}`;
    };

    const uploadFile = async (file) => {
        if (!file) return;

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("type", "student_profile");

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Upload failed");
            }

            const data = await response.json();
            setCurrentLogo(data.url);
        } catch (err) {
            setError(err.message);
            console.error("Upload error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {currentLogo && (
                <div className="mt-2">
                    <div className="text ml-2" style={{ marginBottom: "10px" }}>
                        รูปนักศึกษาปัจจุบัน
                    </div>
                    <Image
                        src={getImageUrl(currentLogo)}
                        alt="Student Profile"
                        width={200}
                        height={100}
                        className="object-cover rounded"
                        style={{ marginBottom: "10px" }}
                        unoptimized
                    />
                </div>
            )}

            <div className="uploading-outer">
                <div className="uploadButton">
                    <input
                        className="uploadButton-input"
                        type="file"
                        name="attachments[]"
                        accept="image/jpeg,image/png"
                        id="upload"
                        onChange={(e) => uploadFile(e.target.files[0])}
                        disabled={loading}
                    />
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload"
                    >
                        {loading ? "Uploading..." : "Browse Student Picture"}
                    </label>
                </div>
                <div className="text ml-2">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg & .png
                </div>
            </div>
        </>
    );
};

export default LogoUpload;