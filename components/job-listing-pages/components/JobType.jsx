'use client'
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addJobType } from "../../../features/filter/filterSlice";
import { jobTypeCheck } from "../../../features/job/jobSlice";

const JobType = () => {
    const [jobTypes, setJobTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchJobTypes = async () => {
            try {
                // เรียก API เพียงครั้งเดียว
                const response = await fetch('/api/job-types-all');
                if (!response.ok) throw new Error('Failed to fetch job types');
                const data = await response.json();
                
                // Group และจัดการข้อมูลใน memory
                const groupedTypes = data.reduce((acc, type) => {
                    const existingType = acc.find(t => t.name === type.name);
                    if (existingType) {
                        if (!existingType.hire_types.includes(type.hire_type)) {
                            existingType.hire_types.push(type.hire_type);
                        }
                        if (!existingType.type_ids.includes(type.id)) {
                            existingType.type_ids.push(type.id);
                        }
                    } else {
                        acc.push({
                            name: type.name,
                            hire_types: [type.hire_type],
                            type_ids: [type.id],
                            id: type.id,
                            value: type.id.toString(),
                            isChecked: false
                        });
                    }
                    return acc;
                }, []);

                setJobTypes(groupedTypes);
            } catch (error) {
                console.error('Error loading job types:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobTypes();
    }, []);

    const jobTypeHandler = (e, id) => {
        const value = e.target.value;
        setJobTypes(prev => 
            prev.map(item => 
                item.id === id 
                    ? { ...item, isChecked: !item.isChecked }
                    : item
            )
        );
        dispatch(addJobType(value));
        dispatch(jobTypeCheck(id));
    };

    if (isLoading) {
        return <div className="animate-pulse">กำลังโหลดประเภทงาน...</div>;
    }

    if (jobTypes.length === 0) {
        return <div>ไม่พบประเภทงาน</div>;
    }

    return (
        <ul className="switchbox">
            {jobTypes.map((item) => (
                <li key={item.id}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            value={item.value}
                            checked={item.isChecked || false}
                            onChange={(e) => jobTypeHandler(e, item.id)}
                        />
                        <span className="slider round"></span>
                        <span className="title">
                            {item.name}
                            {item.hire_types && item.hire_types.length > 1 && (
                                <small style={{marginLeft: '5px', color: '#888', fontSize: '0.7em'}}>
                                    ({item.hire_types.join(', ')})
                                </small>
                            )}
                        </span>
                    </label>
                </li>
            ))}
        </ul>
    );
};

export default JobType;