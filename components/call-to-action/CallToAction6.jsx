import Link from "next/link";
import { useTranslations } from 'next-intl';

const CallToAction6 = () => {

  const t = useTranslations('testimonials');

  return (
    <section className="call-to-action-three style-two" style={{backgroundColor:"#ffbe0b"}}>
      <div className="auto-container">
        <div className="outer-box">
          <div className="sec-title light">
            <h2> {t(`Get a question?`)} </h2>
            <div className="text">
            {t(`Check out our FAQs`)}
             <br />
              <a href="#">66 (0) 2849-6519</a>
            </div>
          </div>
          {/* End sec-title */}

          <div className="btn-box">
            <Link href="https://op.mahidol.ac.th/ir/th/" className="theme-btn btn-style-three">
            {t(`Get Started`)}
              
            </Link>
          </div>
        </div>
        {/* End outer-box */}
      </div>
    </section>
  );
};

export default CallToAction6;
