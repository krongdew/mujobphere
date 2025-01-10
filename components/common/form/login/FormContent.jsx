import Link from "next/link";
import LoginWithSocial from "./LoginWithSocial";
import { useTranslations } from 'next-intl';

const FormContent = () => {
  const t = useTranslations("Login");
  
  return (
    <div className="form-inner">
      <h3>{t('Login to JobSphere')}</h3>

      {/* <!--Login Form--> */}
      <form method="post">
        <div className="form-group">
          <label>{t('Email')}</label>
          <input type="email" name="email" placeholder={t('Email')} required />
        </div>
        {/* name */}

        <div className="form-group">
          <label>{t('Password')}</label>
          <input
            type="password"
            name="password"
            placeholder={t('Password')}
            required
          />
        </div>
        {/* password */}

        <div className="form-group">
          <div className="field-outer">
            <div className="input-group checkboxes square">
              <input type="checkbox" name="remember-me" id="remember" />
              {/* <label htmlFor="remember" className="remember">
                <span className="custom-checkbox"></span> Remember me
              </label> */}
            </div>
            <a href="#" className="pwd">
            {t('Forgot password')}
            </a>
          </div>
        </div>
        {/* forgot password */}

        <div className="form-group">
          <button
            className="theme-btn btn-style-one"
            type="submit"
            name="log-in"
          >
            {t('LogIn')}
          </button>
        </div>
        {/* login */}
      </form>
      {/* End form */}

      <div className="bottom-box">
        <div className="text">
        {t('Dont have an account')}{" "}
          <Link
            href="#"
            className="call-modal signup"
            data-bs-toggle="modal"
            data-bs-target="#registerModal"
          >
            {t('Sign up')}
          </Link>
        </div>

        <div className="divider">
          <span>{t('or')}</span>
        </div>

        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default FormContent;
