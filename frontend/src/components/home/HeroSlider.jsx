import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { bannerService } from '../../services/productService';

const fallbackSlides = [
  {
    _id: 'fallback-1',
    title: 'Handmade With Love',
    subtitle: 'Cozy crochet pieces, stitched one loop at a time',
    buttonText: 'Shop the Collection',
    redirectUrl: '/shop',
    image: { url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1600' },
  },
  {
    _id: 'fallback-2',
    title: 'Your Vision, Hand-Stitched',
    subtitle: 'Bring your dream crochet piece to life with a custom order',
    buttonText: 'Start a Custom Order',
    redirectUrl: '/custom-order',
    image: { url: 'https://images.unsplash.com/photo-1517705600644-9151cb32f31c?w=1600' },
  },
];

const HeroSlider = () => {
  const [slides, setSlides] = useState(fallbackSlides);

  useEffect(() => {
    let mounted = true;
    bannerService
      .getBanners('hero')
      .then((data) => {
        if (mounted && data.banners?.length) setSlides(data.banners);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleClick = (banner) => {
    if (banner._id && !banner._id.startsWith('fallback')) {
      bannerService.trackClick(banner._id).catch(() => {});
    }
  };

  return (
    <section className="relative">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="h-[70vh] min-h-[420px] max-h-[720px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <div className="relative w-full h-full">
              <img
                src={slide.image?.url}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brown-deep/70 via-brown-deep/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end px-6 sm:px-12 lg:px-20 pb-20">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="max-w-xl"
                >
                  <span className="label-eyebrow text-white/80 mb-3 block">🧶 Crochet Nest</span>
                  <h1 className="font-display text-3xl sm:text-5xl font-semibold text-white mb-4 leading-tight text-balance">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-white/85 text-base sm:text-lg mb-7 max-w-md">{slide.subtitle}</p>
                  )}
                  <Link
                    to={slide.redirectUrl || '/shop'}
                    onClick={() => handleClick(slide)}
                    className="btn-primary"
                  >
                    {slide.buttonText || 'Shop Now'}
                  </Link>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;
