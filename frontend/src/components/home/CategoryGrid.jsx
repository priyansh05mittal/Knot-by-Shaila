import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../services/productService';

const CategoryGrid = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getCategories,
  });

  const categories = data?.categories || [];

  if (!isLoading && categories.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="label-eyebrow">Explore</span>
          <h2 className="text-3xl sm:text-4xl mt-2">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-cozy shimmer-bg animate-pulse" />
              ))
            : categories.slice(0, 5).map((cat, i) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <Link to={`/shop?category=${cat.slug}`} className="group block">
                    <div className="relative aspect-square rounded-cozy overflow-hidden bg-beige mb-3">
                      {cat.image?.url ? (
                        <img
                          src={cat.image.url}
                          alt={cat.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🧶</div>
                      )}
                      <div className="absolute inset-0 bg-brown-deep/10 group-hover:bg-brown-deep/25 transition-colors" />
                    </div>
                    <p className="text-center font-label text-sm font-medium text-brown-deep group-hover:text-rose transition-colors">
                      {cat.name}
                    </p>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
