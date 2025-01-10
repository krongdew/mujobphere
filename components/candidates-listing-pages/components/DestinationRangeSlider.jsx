'use client'

import { useEffect, useState } from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDispatch, useSelector } from "react-redux";
import { addDestination } from "../../../features/filter/candidateFilterSlice";

const DestinationRangeSlider = () => {
    const { destination } = useSelector((state) => state.candidateFilter);
    const [getDestination, setDestination] = useState({
        min: destination.min,
        max: destination.max,
    });

    const dispatch = useDispatch();

    // destination handler
    const handleOnChange = (value) => {
        // แปลงจาก array เป็น object เพื่อให้ตรงกับ format เดิม
        dispatch(addDestination({
            min: value[0],
            max: value[1]
        }));
    };

    // destination dispatch
    useEffect(() => {
        setDestination(destination);
    });

    return (
        <div className="range-slider-one">
            <Slider
                range
                min={0}
                max={100}
                value={[getDestination.min, getDestination.max]}
                onChange={handleOnChange}
                // styling options
                railStyle={{ 
                    backgroundColor: '#eee', 
                    height: 8 
                }}
                trackStyle={[{ 
                    backgroundColor: '#1967d2',
                    height: 8 
                }]}
                handleStyle={[
                    { 
                        backgroundColor: 'white',
                        border: '2px solid #1967d2',
                        width: 16,
                        height: 16,
                        marginTop: -4,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    },
                    { 
                        backgroundColor: 'white',
                        border: '2px solid #1967d2',
                        width: 16,
                        height: 16,
                        marginTop: -4,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                ]}
            />
            <div className="input-outer">
                <div className="amount-outer">
                    <span className="area-amount">{getDestination.max}</span>
                    km
                </div>
            </div>
        </div>
    );
};

export default DestinationRangeSlider;