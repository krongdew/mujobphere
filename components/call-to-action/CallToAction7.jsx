import Link from "next/link";
import LoginPopup from "../common/form/login/LoginPopup";
import { useTranslations } from "next-intl";

const CallToAction7 = () => {
    const t = useTranslations("Common");

  return (
    <section
      className="call-to-action-two"
      style={{ backgroundImage: "url(/images/background/8.png)" }}
    >
      <div className="auto-container" data-aos="fade-up">
        <div className="sec-title light text-center">
          <h2>{t("Make a Difference")} </h2>
          <div className="text">
          {t("Make a Difference Des")}
          </div>
        </div>
        {/* End sec-title */}

        <div className="btn-box">
        <button
                    className="theme-btn btn-style-six call-modal"
                    data-bs-toggle="modal"
                    data-bs-target="#loginPopupModal"
                  >
                    {t("Login / Register")}
                  </button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction7;
