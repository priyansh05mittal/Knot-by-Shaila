import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { productService } from '../../services/productService';
import ProductCard from '../common/ProductCard';
import { SkeletonGrid } from '../common/SkeletonCard';

const ProductCollectionSection = ({ type, eyebrow, title, subtitle, viewAllHref, limit = 8 }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['collection', type, limit],
    queryFn: () => productService.getCollection(type, { limit }),
  });

  const products = data?.products || [];

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="label-eyebrow">{eyebrow}</span>
            <h2 className="text-3xl sm:text-4xl mt-2">{title}</h2>
            {subtitle && <p className="text-brown-light mt-2 max-w-lg">{subtitle}</p>}
          </div>
          <Link to={viewAllHref} className="flex items-center gap-1.5 font-label text-sm font-medium text-rose-dark hover:gap-2.5 transition-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <SkeletonGrid count={limit} />
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7"
          >
            {products.map((product) => (
              <motion.div key={product._id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductCollectionSection;
