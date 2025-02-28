'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory } from "../../../features/filter/filterSlice";
import { useTranslations } from "next-intl";

const Categories = () => {
     const t = useTranslations("JobSearchForm");
    const { jobList } = useSelector((state) => state.filter) || {};
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    // Fetch categories once
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/job-types-all');
                if (!response.ok) throw new Error('Failed to fetch categories');
                
                const data = await response.json();

                // Remove duplicates while preserving the first occurrence
                const uniqueCategories = Object.values(
                    data.reduce((acc, category) => {
                        // Use name as key to ensure uniqueness
                        if (!acc[category.name]) {
                            acc[category.name] = {
                                id: category.id,
                                name: category.name,
                                hire_type: category.hire_type
                            };
                        }
                        return acc;
                    }, {})
                );

                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const categoryHandler = (e) => {
        dispatch(addCategory(e.target.value));
    };

    if (isLoading) {
        return (
            <div className="form-select animate-pulse">
                {t('Job type loading')} 
            </div>
        );
    }

    return (
        <>
            <select
                className="form-select"
                value={jobList?.category || ""}
                onChange={categoryHandler}
            >
                <option value=""> {t('Select Job type')}</option>
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