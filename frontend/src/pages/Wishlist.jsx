import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import ProductCard from '../components/common/ProductCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/SharedUI';

const Wishlist = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userService.getWishlist,
  });

  const products = data?.wishlist || [];

  return (
    <>
      <Helmet><title>My Wishlist | Crochet Nest</title></Helmet>

      <div className="section-padding">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl mb-10">My Wishlist</h1>

          {isLoading ? (
            <SkeletonGrid count={8} />
          ) : products.length === 0 ? (
            <EmptyState
              icon="💕"
              title="Your wishlist is empty"
              description="Save the pieces you love and come back to them anytime."
              action={<Link to="/shop" className="btn-primary">Explore Products</Link>}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
