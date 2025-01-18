'use client'

import AddPortfolio from "./AddPortfolio";
import Awards from "./Awards";
import Education from "./Education";
import Experiences from "./Experiences";
import SkillsMultiple from "./SkillsMultiple";

const Index = () => {
  return (
    <div className="default-form">
      <div className="row">
        <div className="form-group col-lg-12 col-md-12">
          <Education />
          <Experiences />
        </div>

        <div className="form-group col-lg-12 col-md-12">
          <Awards />
        </div>

    

        <div className="form-group col-lg-12 col-md-12">
          <SkillsMultiple />
        </div>

        {/* <div className="form-group col-lg-12 col-md-12">
          <AddPortfolio />
        </div> */}
      </div>
    </div>
  );
};

export default Index;