import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StitchDivider from '../components/common/StitchDivider';

const About = () => (
  <>
    <Helmet>
      <title>Our Story | Crochet Nest</title>
      <meta name="description" content="Learn about Crochet Nest — a handmade crochet brand dedicated to cozy, premium, stitched-with-love products." />
    </Helmet>

    <div className="section-padding">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <span className="label-eyebrow">Our Story</span>
        <h1 className="text-3xl sm:text-4xl mt-2 mb-6">Handmade With Love, Since Day One</h1>
        <p className="text-brown-light leading-relaxed text-lg">
          Crochet Nest began as a single hook and a ball of yarn, driven by a love for slow, intentional
          craftsmanship. Today, every bag, top, and gift we create still starts the same way — by hand,
          stitch by stitch, with care poured into every loop.
        </p>
      </div>

      <StitchDivider className="mb-16" />

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
        {[
          { title: 'Ethically Handmade', text: 'Every piece is crafted by skilled artisans, never mass-produced in a factory.' },
          { title: 'Quality Materials', text: 'We source premium cotton and blended yarns that feel as good as they look.' },
          { title: 'Made To Order', text: 'Many pieces — including all custom requests — are made fresh just for you.' },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card-cozy p-6 text-center"
          >
            <h3 className="font-label font-semibold text-brown-deep mb-2">{item.title}</h3>
            <p className="text-sm text-brown-light leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/shop" className="btn-primary">Explore Our Collection</Link>
      </div>
    </div>
  </>
);

export default About;
