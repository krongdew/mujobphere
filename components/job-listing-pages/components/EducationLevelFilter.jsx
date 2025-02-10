'use client'
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const EducationLevelFilter = () => {
    const dispatch = useDispatch();
    const [selectedEducationLevel, setSelectedEducationLevel] = useState('');

    const educationLevelOptions = [
        { value: 'bachelor', label: 'ปริญญาตรี' },
        { value: 'master', label: 'ปริญญาโท' },
        { value: 'doctoral', label: 'ปริญญาเอก' }
    ];

    const handleEducationLevelChange = (value) => {
        setSelectedEducationLevel(value);
        // Dispatch action to update education level filter in Redux
        // You'll need to create this action in your filterSlice
        // dispatch(addEducationLevel(value));
    };

    return (
        <div className="checkbox-outer">
            <h4>ระดับการศึกษา</h4>
            <ul className="checkboxes">
                {educationLevelOptions.map((option) => (
                    <li key={option.value}>
                        <label className="checkbox-label">
                            <input
                                type="radio"
                                name="education-level"
                                value={option.value}
                                checked={selectedEducationLevel === option.value}
                                onChange={() => handleEducationLevelChange(option.value)}
                            />
                            <span>{option.label}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EducationLevelFilter;