import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound = () => (
  <>
    <Helmet><title>Page Not Found | Crochet Nest</title></Helmet>
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <span className="text-6xl mb-6">🧶</span>
      <h1 className="text-4xl mb-3">Oops! Thread Lost.</h1>
      <p className="text-brown-light mb-8 max-w-sm">
        We couldn't find the page you're looking for. Let's get you back to something cozy.
      </p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  </>
);

export default NotFound;
