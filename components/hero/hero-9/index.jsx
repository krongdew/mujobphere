'use client'
import SearchForm4 from "../../common/job-search/SearchForm4";
import Funfact2 from "../../fun-fact-counter/Funfact2";
import Image from "next/image";
import Homebutton from "../../button/Homebutton";
import { useTranslations } from 'next-intl';

const index = () => {
  const t = useTranslations("Hero");
  return (
    <section
      className="banner-section-nine"
      style={{ backgroundColor:"#ff006e",paddingTop:200 }}

    
    >
      <div className="auto-container">
        <div className="cotnent-box">
          <div className="title-box" data-aso-delay="300" data-aos="fade-up">
            {/* <img src="/images/icons/Jlogopng.png" style={{width:300}}></img> */}
            <Image
          width={400}
          height={400}
          src="/images/icons/Jlogopng.png"
          alt="hero image"
         
        />
            {/* <h3 style={{color:"#3863a9"}}>15,000+ Browse Jobs</h3> */}
            <div className="text">
              
              {t('DiscirptionWeb')}
            </div>
          </div>

          {/* <!-- Job Search Form --> */}
      
            <Homebutton />
         
        </div>
        {/* <!-- Job Search Form --> */}

        <div className="fun-fact-section" style={{paddingTop:40}}>
          <div className="row">
            <Funfact2 />
          </div>
        </div>
        {/* <!-- Fun Fact Section --> */}
      </div>
    </section>
  );
};

export default index;
