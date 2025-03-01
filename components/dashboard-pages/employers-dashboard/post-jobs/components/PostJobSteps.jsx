import { useTranslations } from "next-intl";

const PostJobSteps = () => {
  const t = useTranslations("JobPost");
  return (
    <div className="post-job-steps">
      <div className="step">
        <span className="icon flaticon-briefcase"></span>
        <h5>{t('Write Job Detail')}</h5>
      </div>


      <div className="step">
        <span className="icon flaticon-checked"></span>
        <h5>{t('Confirmation')}</h5>
      </div>

      <div className="step">
        <span className="icon flaticon-promotion"></span>
        <h5>{t('Approve and open')}</h5>
      </div>
    </div>
  );
};

export default PostJobSteps;
