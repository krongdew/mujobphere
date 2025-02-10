'use client'
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addJobType } from "../../../features/filter/filterSlice";
import { jobTypeCheck } from "../../../features/job/jobSlice";

const JobType = () => {
    const [jobTypes, setJobTypes] = useState([]);
    const [error, setError] = useState(null);
    const dispatch = useDispatch();

    // Fetch job types for both hire types sequentially
    useEffect(() => {
        const fetchJobTypes = async () => {
            try {
                const hireTypes = ['personal', 'faculty'];
                const allJobTypes = [];

                for (const hireType of hireTypes) {
                    const response = await fetch(`/api/job-types?hire_type=${hireType}`);
                    
                    if (!response.ok) {
                        // Try to get error details from response
                        const errorText = await response.text();
                        console.error(`Error response for ${hireType}:`, errorText);
                        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                    }
                    
                    const data = await response.json();
                    allJobTypes.push(...data);
                }
                
                console.log('Received job types data:', allJobTypes);

                // Validate and transform data
                if (!Array.isArray(allJobTypes)) {
                    throw new Error('Unexpected response format: not an array');
                }
                
                // Group job types by name
                const groupedJobTypes = allJobTypes.reduce((acc, type) => {
                    const existingType = acc.find(t => t.name === type.name);
                    
                    if (existingType) {
                        // Add hire type if not already present
                        if (!existingType.hire_types.includes(type.hire_type)) {
                            existingType.hire_types.push(type.hire_type);
                        }
                        // Add type ID if not already present
                        if (!existingType.type_ids.includes(type.id)) {
                            existingType.type_ids.push(type.id);
                        }
                    } else {
                        // Create new grouped type
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

                setJobTypes(groupedJobTypes);
                setError(null);
            } catch (error) {
                console.error('Full error details:', {
                    message: error.message,
                    name: error.name,
                    stack: error.stack
                });
                setError(error.message);
                setJobTypes([]);
            }
        };

        fetchJobTypes();
    }, []);

    // dispatch job-type
    const jobTypeHandler = (e, id) => {
        const value = e.target.value;
        
        // Update local state
        const updatedJobTypes = jobTypes.map(item => 
            item.id === id 
                ? { ...item, isChecked: !item.isChecked }
                : item
        );
        setJobTypes(updatedJobTypes);

        // Dispatch to redux
        dispatch(addJobType(value));
        dispatch(jobTypeCheck(id));
    };

    // Render error state
    if (error) {
        return (
            <div className="alert alert-danger">
                เกิดข้อผิดพลาดในการโหลดประเภทงาน: {error}
                <pre>{error}</pre>
            </div>
        );
    }

    // Render empty state
    if (jobTypes.length === 0) {
        return <div>กำลังโหลดประเภทงาน...</div>;
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