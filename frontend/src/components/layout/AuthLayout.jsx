import React, { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLoader from '../common/PageLoader';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-cream">
      {/* Decorative side panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-rose via-rose-light to-beige">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
            <circle cx="80" cy="80" r="60" fill="white" />
            <circle cx="320" cy="180" r="90" fill="white" />
            <circle cx="150" cy="330" r="70" fill="white" />
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col justify-center px-16 text-white"
        >
          <span className="text-5xl mb-6">🧶</span>
          <h1 className="font-display text-4xl font-semibold mb-4 leading-tight">
            Handmade with love,
            <br />
            stitch by stitch.
          </h1>
          <p className="text-white/85 text-lg leading-relaxed max-w-md">
            Join the Crochet Nest family — shop cozy handmade pieces, track your custom orders,
            and be the first to know about new drops.
          </p>
        </motion.div>
      </div>

      {/* Auth form panel */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 sm:p-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="text-2xl">🧶</span>
            <span className="font-display text-xl font-semibold text-brown-deep">Crochet Nest</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
