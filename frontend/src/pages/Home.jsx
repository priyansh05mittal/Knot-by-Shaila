import React from 'react';
import { Helmet } from 'react-helmet-async';
import HeroSlider from '../components/home/HeroSlider';
import CategoryGrid from '../components/home/CategoryGrid';
import ProductCollectionSection from '../components/home/ProductCollectionSection';
import {
  CustomOrderPromo,
  WhyChooseUs,
  TestimonialSection,
  InstagramGallery,
  NewsletterSection,
} from '../components/home/HomeSections';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Crochet Nest | Handmade Crochet Bags, Tops &amp; Gifts</title>
        <meta
          name="description"
          content="Shop premium handmade crochet bags, tops, accessories, and custom crochet gifts. Every piece stitched by hand with love."
        />
      </Helmet>

      <HeroSlider />
      <CategoryGrid />

      <ProductCollectionSection
        type="featured"
        eyebrow="Handpicked"
        title="Featured Pieces"
        subtitle="Our artisans' favorite creations, chosen just for you."
        viewAllHref="/shop?collection=featured"
      />

      <ProductCollectionSection
        type="new-arrivals"
        eyebrow="Fresh Off the Hook"
        title="New Arrivals"
        subtitle="The latest additions to our handmade collection."
        viewAllHref="/shop?collection=new-arrivals"
      />

      <CustomOrderPromo />

      <ProductCollectionSection
        type="best-sellers"
        eyebrow="Customer Favorites"
        title="Best Sellers"
        subtitle="The pieces our community can't stop ordering."
        viewAllHref="/shop?collection=best-sellers"
      />

      <WhyChooseUs />

      <ProductCollectionSection
        type="trending"
        eyebrow="Trending Now"
        title="What's Hot Right Now"
        viewAllHref="/shop?collection=trending"
        limit={4}
      />

      <TestimonialSection />
      <InstagramGallery />
      <NewsletterSection />
    </>
  );
};

export default Home;
