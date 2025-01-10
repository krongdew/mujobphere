

'use client'

import Image from "next/image";
import testimonilaContent from "../../data/testimonial";
import Slider from "react-slick";
import { useTranslations } from 'next-intl';

const Testimonial4 = () => {
  const t = useTranslations('testimonials');
  const settings = {
    dots: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    responsive: [
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <>
      <Slider {...settings} arrows={false}>
        {testimonilaContent.slice(0, 5).map((item) => (
          <div className="testimonial-block" key={item.id}>
            <div className="inner-box">
            <h4 className="title">
            <Image
          width={30}
          height={30}
          src="/images/icons/SDG Wheel_Transparent_WEB.png"
          alt="hero image"
         
        />
              {t(`${item.id}.feedback`)}</h4>
            <div className="text">{t(`${item.id}.feedbackText`)}</div>
            
            </div>
          </div>
        ))}
      </Slider>
    </>
  );
};

export default Testimonial4;
