'use client'

import { useEffect, useState } from "react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useDispatch, useSelector } from "react-redux";
import { addSalary } from "../../../features/filter/filterSlice";

const SalaryRangeSlider = () => {
   const { jobList } = useSelector((state) => state.filter);
   const [salary, setSalary] = useState({
       min: jobList?.salary?.min || 0,
       max: jobList?.salary?.max || 20000,
   });

   const dispatch = useDispatch();

   const handleOnChange = (value) => {
       setSalary({
           min: value[0],
           max: value[1]
       });
       
       dispatch(addSalary({
           min: value[0],
           max: value[1]
       }));
   };

   useEffect(() => {
       setSalary({
           min: jobList?.salary?.min || 0,
           max: jobList?.salary?.max || 20000,
       });
   }, [jobList]);

   return (
       <div className="range-slider-one salary-range">
           <Slider
               range
               min={0}
               max={20000}
               value={[salary.min, salary.max]}
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
                       <span className="min">{salary.min} บาท</span>
                       <span className="max ms-2">{salary.max} บาท</span>
                   </span>
               </div>
           </div>
       </div>
   );
};

export default SalaryRangeSlider;