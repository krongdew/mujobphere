'use client'

import { useEffect, useState } from "react";
import Slider from 'rc-slider'; // เปลี่ยนเป็น import Slider
import 'rc-slider/assets/index.css'; // เพิ่ม import CSS
import { useDispatch, useSelector } from "react-redux";
import { addDestination } from "../../../features/filter/filterSlice";

const DestinationRangeSlider = () => {
    const { jobList } = useSelector((state) => state.filter);

    const [destination, setDestination] = useState({
        min: jobList.destination.min,
        max: jobList.destination.max,
    });

    const dispatch = useDispatch();

    // destination handler
    const handleOnChange = (value) => {
        // rc-slider ส่งค่ามาเป็น array [min, max]
        dispatch(addDestination({ min: value[0], max: value[1] }));
    };

    useEffect(() => {
        setDestination({
            min: jobList.destination.min,
            max: jobList.destination.max,
        });
    }, [setDestination, jobList]);

    return (
        <div className="range-slider-one">
            <Slider
                range // เพิ่ม prop range เพื่อให้เป็น range slider
                min={0}
                max={100}
                value={[destination.min, destination.max]} // ส่งค่าเป็น array
                onChange={handleOnChange}
                // เพิ่ม styles ตามต้องการ
                railStyle={{ backgroundColor: '#eee' }}
                trackStyle={[{ backgroundColor: '#1967d2' }]}
                handleStyle={[
                    { backgroundColor: 'white', border: '2px solid #1967d2' },
                    { backgroundColor: 'white', border: '2px solid #1967d2' }
                ]}
            />
            <div className="input-outer">
                <div className="amount-outer">
                    <span className="area-amount">{destination.max}</span>
                    km
                </div>
            </div>
        </div>
    );
};

export default DestinationRangeSlider;