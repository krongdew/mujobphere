'use client'

import { useEffect, useState } from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDispatch, useSelector } from "react-redux";
import { addFoundationDate } from "../../../features/filter/employerFilterSlice";

const FoundationDate = () => {
   const { foundationDate: getGoundationDate } =
       useSelector((state) => state.employerFilter) || {};
   const [foundationDate, setFoundationDate] = useState({
       min: getGoundationDate.min,
       max: getGoundationDate.max,
   });

   const dispath = useDispatch();

   const handleOnChange = (value) => {
       dispath(addFoundationDate({
           min: value[0],
           max: value[1]
       }));
   };

   useEffect(() => {
       setFoundationDate(getGoundationDate);
   }, [setFoundationDate, getGoundationDate]);

   return (
       <div className="range-slider-one salary-range">
           <Slider
               range
               min={1900}
               max={2028}
               value={[foundationDate.min, foundationDate.max]}
               onChange={handleOnChange}
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
                   <span className="d-inline-flex align-items-center">
                       <span className="min">{foundationDate.min}</span>
                       <span className="max ms-2">{foundationDate.max}</span>
                   </span>
               </div>
           </div>
       </div>
   );
};

export default FoundationDate;