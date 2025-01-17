'use client';

import { useState, useEffect } from "react";
import Image from 'next/image';
import { useSession } from "next-auth/react";

const LogoCoverUploader = () => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentLogo, setCurrentLogo] = useState("");
    const [currentCover, setCurrentCover] = useState("");

    useEffect(() => {
        const fetchImages = async () => {
            if (!session?.user?.id) return;
            
            try {
                const response = await fetch(`/api/profile/${session.user.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const data = await response.json();
                
                if (data.company_logo) {
                    setCurrentLogo(data.company_logo.startsWith('/') ? data.company_logo : `/${data.company_logo}`);
                }
                if (data.company_cover) {
                    setCurrentCover(data.company_cover.startsWith('/') ? data.company_cover : `/${data.company_cover}`);
                }
            } catch (error) {
                console.error('Error fetching images:', error);
                setError('Failed to load images');
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
            formData.append('file', file);
            formData.append('type', type);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await response.json();
            
            if (type === 'logo') {
                setCurrentLogo(data.url);
            } else {
                setCurrentCover(data.url);
            }

        } catch (err) {
            setError(err.message);
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    const logoHandler = async (file) => {
        await uploadFile(file, 'logo');
    };

    const coverHandler = async (file) => {
        await uploadFile(file, 'cover');
    };

    const sanitizePath = (path) => {
        // ลบ prefix /pubilc/upload/
        // แปลง HTML entity ของ slash
        return path
          
          .replace(/&#x2F;/g, '/')
          .replace(/^\/+/, '')  // ลบ leading slashes
         
      };

    return (
        <>
            {error && (
                <div className="alert alert-danger mb-4">{error}</div>
            )}

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
                    <label
                        className="uploadButton-button ripple-effect"
                        htmlFor="upload"
                    >
                        {loading ? 'Uploading...' : 'Browse Logo'}
                    </label>
                    {currentLogo && (
    <div className="mt-2">
        <Image
            src={`/${sanitizePath(currentLogo)}`}
            alt="Company Logo"
            width={100}
            height={100}
            className="object-cover rounded"
            unoptimized
        />
    </div>
)}
                </div>
                <div className="text">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg & .png
                </div>
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
                        {loading ? 'Uploading...' : 'Browse Cover'}
                    </label>
                    {currentCover && (
                        <div className="mt-2">
                            <Image
                                src={`/${sanitizePath(currentCover)}`}
                                alt="Company Cover"
                                width={200}
                                height={100}
                                className="object-cover rounded"
                                unoptimized
                            />
                        </div>
                    )}
                </div>
                <div className="text">
                    Max file size is 1MB, Minimum dimension: 330x300 And
                    Suitable files are .jpg & .png
                </div>
            </div>
        </>
    );
};

export default LogoCoverUploader;