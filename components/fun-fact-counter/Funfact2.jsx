'use client'

import { useState } from "react";
import CountUp from "react-countup";
import { InView } from "react-intersection-observer";
import { useTranslations } from 'next-intl';

const Funfact2 = () => {
  const [focus, setFocus] = useState(false);
  const t = useTranslations('funfact');

  const counterUpContent = [
    {
      id: 1,
      startCount: "0",
      endCount: "97216",
      meta: "advertising_space_1",
      animationDelay: "700",
    },
    {
      id: 2,
      startCount: "0",
      endCount: "4782",
      meta: "advertising_space_2",
      animationDelay: "800",
    },
    {
      id: 3,
      startCount: "0",
      endCount: "5322",
      meta: "advertising_space_3",
      animationDelay: "900",
    },
    {
      id: 4,
      startCount: "0",
      endCount: "6329",
      meta: "advertising_space_4",
      animationDelay: "1000",
    },
  ];

  return (
    <>
      {counterUpContent.map((val) => (
        <div
          className="counter-column col-lg-3 col-md-6 col-sm-12"
          data-aos="fade-up"
          data-aos-delay={val.animationDelay}
          key={val.id}
          style={{backgroundColor:"grey",padding:10}}
        >
          <div className="count-box">
            <span className="count-text">
              {/* <CountUp
                start={focus ? val.startCount : null}
                end={val.endCount}
                duration={2}
              >
                {({ countUpRef }) => (
                  <InView
                    as="span"
                    onChange={(isVisible) => {
                      if (isVisible) {
                        setFocus(true);
                      }
                    }}
                  >
                    <span ref={countUpRef} />
                  </InView>
                )}
              </CountUp> */}
            </span>
          </div>
          <h4 className="counter-title">{t(`space.${val.id}`)}</h4>
        </div>
      ))}
    </>
  );
};

export default Funfact2;