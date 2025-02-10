'use client'
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

const HireTypeFilter = () => {
    const dispatch = useDispatch();
    const [selectedHireType, setSelectedHireType] = useState('');

    const hireTypeOptions = [
        { value: 'faculty', label: 'จ้างในนามคณะ' },
        { value: 'personal', label: 'จ้างส่วนบุคคล' }
    ];

    const handleHireTypeChange = (value) => {
        setSelectedHireType(value);
        // Dispatch action to update hire type filter in Redux
        // You'll need to create this action in your filterSlice
        // dispatch(addHireType(value));
    };

    return (
        <div className="checkbox-outer">
            <h4>ประเภทการจ้าง</h4>
            <ul className="checkboxes">
                {hireTypeOptions.map((option) => (
                    <li key={option.value}>
                        <label className="checkbox-label">
                            <input
                                type="radio"
                                name="hire-type"
                                value={option.value}
                                checked={selectedHireType === option.value}
                                onChange={() => handleHireTypeChange(option.value)}
                            />
                            <span>{option.label}</span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default HireTypeFilter;