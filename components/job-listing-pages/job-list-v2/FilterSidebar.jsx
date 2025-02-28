import CallToActions from "../components/CallToActions";
import DatePosted from "../components/DatePosted";
import ExperienceLevel from "../components/ExperienceLevel";
import JobType from "../components/JobType";
import SalaryRangeSlider from "../components/SalaryRangeSlider";
import Tag from "../components/Tag";
import HireTypeFilter from "../components/HireTypeFilter";
import EducationLevelFilter from "../components/EducationLevelFilter";
import { useTranslations } from "next-intl";

const FilterSidebar = () => {
     const t = useTranslations("JobSearchForm");
    
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
                    <h4> {t('Select Job type')} </h4>
                    
                </div>

                <div className="switchbox-outer">
                    <h4> {t('Job type')}  </h4>
                    <p> {t('Job type Des')} </p>
                    <br></br>
                    <JobType />
                </div>
                {/* <!-- Switchbox Outer --> */}

                <div className="checkbox-outer">
                    <h4> {t('Date post')}</h4>
                    <DatePosted />
                </div>
                {/* <!-- Checkboxes Outer --> */}

               

                <div className="filter-block">
                    <h4>{t('Income')}</h4>
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

           
            {/* <!-- End Call To Action --> */}
        </div>
    );
};

export default FilterSidebar;