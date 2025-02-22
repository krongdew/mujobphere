import CallToActions from "../components/CallToActions";
import DatePosted from "../components/DatePosted";
import ExperienceLevel from "../components/ExperienceLevel";
import JobType from "../components/JobType";
import SalaryRangeSlider from "../components/SalaryRangeSlider";
import Tag from "../components/Tag";
import HireTypeFilter from "../components/HireTypeFilter";
import EducationLevelFilter from "../components/EducationLevelFilter";

const FilterSidebar = () => {
    return (
        <div className="inner-column">
            <div className="filters-outer">
                <button
                    type="button"
                    className="btn-close text-reset close-filters show-1023"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
                {/* End .close filter */}

                <div className="switchbox-outer">
                    <h4>ประเภทการจ้าง</h4>
                    
                </div>

                <div className="switchbox-outer">
                    <h4>ประเภทงาน</h4>
                    <p>(faculty, personal) : งานที่มีการจ้างทั้งในนามคณะและในนามส่วนตัว</p>
                    <br></br>
                    <JobType />
                </div>
                {/* <!-- Switchbox Outer --> */}

                <div className="checkbox-outer">
                    <h4>วันที่ประกาศ</h4>
                    <DatePosted />
                </div>
                {/* <!-- Checkboxes Outer --> */}

               

                <div className="filter-block">
                    <h4>รายได้</h4>
                    <SalaryRangeSlider />
                </div>
                {/* <!-- Filter Block --> */}

                {/* <div className="checkbox-outer">
                   
                    <HireTypeFilter />
                </div> */}

                {/* <div className="checkbox-outer">
                    
                    <EducationLevelFilter />
                </div> */}

                {/* <div className="filter-block">
                    <h4>Tags</h4>
                    <Tag />
                </div> */}
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}

            <CallToActions />
            {/* <!-- End Call To Action --> */}
        </div>
    );
};

export default FilterSidebar;