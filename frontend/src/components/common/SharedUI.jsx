import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

export const EmptyState = ({ icon = '🧶', title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-6">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="font-display text-xl text-brown-deep mb-2">{title}</h3>
    {description && <p className="text-brown-light text-sm max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

export const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;

  const items = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      items.push(i);
    } else if (items[items.length - 1] !== '...') {
      items.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-4 py-2 rounded-full text-sm font-label border border-beige-dark disabled:opacity-40 hover:border-rose transition-colors"
      >
        Prev
      </button>
      {items.map((it, idx) =>
        it === '...' ? (
          <span key={`dots-${idx}`} className="px-2 text-brown-light">…</span>
        ) : (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={`w-9 h-9 rounded-full text-sm font-label transition-colors ${
              it === page ? 'bg-rose text-white' : 'hover:bg-beige/50 text-brown-deep'
            }`}
          >
            {it}
          </button>
        )
      )}
      <button
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="px-4 py-2 rounded-full text-sm font-label border border-beige-dark disabled:opacity-40 hover:border-rose transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export const StarRating = ({ rating = 0, size = 16, onChange, interactive = false }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onChange && onChange(s)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star size={size} className={s <= rating ? 'fill-rose text-rose' : 'text-beige-dark'} />
        </button>
      ))}
    </div>
  );
};

export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-cozy shadow-lift max-w-sm w-full p-6"
        >
          <h3 className="font-display text-lg text-brown-deep mb-2">{title}</h3>
          <p className="text-sm text-brown-light mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="btn-outline text-sm py-2 px-5">Cancel</button>
            <button
              onClick={onConfirm}
              className={`text-sm py-2 px-5 rounded-full font-label font-medium text-white transition-colors ${
                danger ? 'bg-blush hover:bg-red-500' : 'bg-rose hover:bg-blush'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
