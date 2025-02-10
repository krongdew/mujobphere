'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/filterSlice";

const Categories = () => {
    const { jobList } = useSelector((state) => state.filter) || {};
    const [categories, setCategories] = useState([]);
    const [getCategory, setCategory] = useState(jobList.category);

    const dispatch = useDispatch();

    // Fetch job types as categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const hireTypes = ['personal', 'faculty'];
                const allCategories = [];

                for (const hireType of hireTypes) {
                    const response = await fetch(`/api/job-types?hire_type=${hireType}`);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    allCategories.push(...data);
                }

                // Group categories and remove duplicates
                const uniqueCategories = allCategories.reduce((acc, category) => {
                    if (!acc.some(existingCat => existingCat.name === category.name)) {
                        acc.push(category);
                    }
                    return acc;
                }, []);

                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // category handler
    const categoryHandler = (e) => {
        dispatch(addCategory(e.target.value));
    };

    useEffect(() => {
        setCategory(jobList.category);
    }, [setCategory, jobList]);

    return (
        <>
            <select
                className="form-select"
                value={jobList.category}
                onChange={categoryHandler}
            >
                <option value="">เลือกประเภทงาน</option>
                {categories.map((category) => (
                    <option 
                        key={category.id} 
                        value={category.id.toString()}
                    >
                        {category.name}
                    </option>
                ))}
            </select>
            <span className="icon flaticon-briefcase"></span>
        </>
    );
};

export default Categories;