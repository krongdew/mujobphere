'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocation } from "../../../features/filter/filterSlice";

const LocationBox = () => {
    const { jobList } = useSelector((state) => state.filter);
    const [getLocation, setLocation] = useState(jobList.location);
    const dispatch = useDispatch();

    // location handler
    const locationHandler = (e) => {
        dispatch(addLocation(e.target.value));
    };

    useEffect(() => {
        setLocation(jobList.location);
    }, [setLocation, jobList]);

    return (
        <>
            <select
                className="form-select"
                value={jobList.location}
                onChange={locationHandler}
            >
                <option value="">เลือกประเภทสถานที่ทำงาน</option>
                <option value="online">ออนไลน์</option>
                <option value="onsite">ออนไซต์</option>
            </select>
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;