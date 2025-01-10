import Image from "next/image";
import { useTranslations } from 'next-intl';

const Block5 = () => {
  const t = useTranslations('Block5');

  const blockContent = {
    title: t('title'),
    descriptions: t('descriptions'),
    list: [
      {
        count: "1",
        text: t('list.item1'),
      },
      {
        count: "2",
        text: t('list.item2'),
      },
      {
        count: "3",
        text: t('list.item3'),
      },
    ],
  };

  return (
    <section className="steps-section pt-0">
      <div className="auto-container">
        <div className="row">
          <div className="image-column col-lg-6 col-md-12 col-sm-12">
            <div className="inner-column">
              <figure className="image">
                <Image
                  width={608}
                  height={600}
                  src="/images/resource/steps-img.png"
                  alt="resource"
                />
              </figure>
              {/* <!-- Count Employers --> */}
              <div className="count-employers" data-aos="fade-up">
                <span className="title">{t('employersCount')}</span>
                <figure className="image">
                  <Image
                    width={209}
                    height={54}
                    src="/images/resource/multi-peoples.png"
                    alt="resource"
                  />
                </figure>
              </div>
            </div>
          </div>
          {/* End image-column */}

          <div className="content-column col-lg-6 col-md-12 col-sm-12">
            <div className="inner-column" data-aos="fade-up">
              <div className="sec-title">
                <h2>{blockContent.title}</h2>
                <div className="text">{blockContent.descriptions}</div>
                <ul className="steps-list">
                  {blockContent.list.map((list, i) => (
                    <li key={i}>
                      <span className="count">{list.count}</span> {list.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* End .content-column */}
        </div>
      </div>
    </section>
  );
};

export default Block5;