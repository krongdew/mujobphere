'use client'

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addKeyword } from "../../../features/filter/filterSlice";

const SearchBox = () => {
    const { jobList } = useSelector((state) => state.filter);
    const [getKeyWord, setkeyWord] = useState(jobList.keyword);
    const dispatch = useDispatch();

    // keyword handler
    const keywordHandler = (e) => {
        dispatch(addKeyword(e.target.value));
    };

    useEffect(() => {
        setkeyWord(jobList.keyword);
    }, [setkeyWord, jobList]);

    return (
        <>
            <input
                type="text"
                name="listing-search"
                placeholder="ค้นหางาน ชื่อบริษัท หรือคำสำคัญ"
                value={getKeyWord}
                onChange={keywordHandler}
            />
            <span className="icon flaticon-search-3"></span>
        </>
    );
};

export default SearchBox;