'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLocation } from "../../../features/filter/filterSlice";
import { useTranslations } from "next-intl";

const LocationBox = () => {
    const { jobList } = useSelector((state) => state.filter);
    const [getLocation, setLocation] = useState(jobList.location);
    const dispatch = useDispatch();
    const t = useTranslations("JobSearchForm");

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
                <option value="">{t('Select location')}</option>
                <option value="online">{t('online')}</option>
                <option value="onsite">{t('onsite')}</option>
            </select>
            <span className="icon flaticon-map-locator"></span>
        </>
    );
};

export default LocationBox;