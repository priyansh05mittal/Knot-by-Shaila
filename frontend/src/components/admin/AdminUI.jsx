import React from 'react';

const ACCENT_CLASSES = {
  rose: { bg: 'bg-rose/10', text: 'text-rose-dark' },
  blush: { bg: 'bg-blush/10', text: 'text-blush' },
  brown: { bg: 'bg-brown/10', text: 'text-brown-deep' },
  beige: { bg: 'bg-beige-dark/20', text: 'text-brown-deep' },
};

export const StatCard = ({ icon: Icon, label, value, trend, accent = 'rose' }) => {
  const cls = ACCENT_CLASSES[accent] || ACCENT_CLASSES.rose;
  return (
    <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${cls.bg} flex items-center justify-center`}>
          <Icon size={20} className={cls.text} />
        </div>
        {trend && <span className="text-xs font-medium text-green-600">{trend}</span>}
      </div>
      <p className="text-2xl font-label font-semibold text-brown-deep">{value}</p>
      <p className="text-sm text-brown-light mt-0.5">{label}</p>
    </div>
  );
};

export const AdminTable = ({ columns, children }) => (
  <div className="bg-white rounded-cozy shadow-soft border border-beige/60 overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-beige/60 bg-cream-deep/40">
          {columns.map((col) => (
            <th key={col} className="text-left px-5 py-3.5 font-label font-semibold text-brown-deep whitespace-nowrap">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-beige/60">{children}</tbody>
    </table>
  </div>
);

export const StatusBadge = ({ status, colorMap }) => {
  const defaultColors = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-gray-50 text-gray-700',
    blocked: 'bg-red-50 text-red-700',
  };
  const colors = colorMap || defaultColors;
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${colors[status] || 'bg-gray-50 text-gray-700'}`}>
      {String(status).replace(/_/g, ' ')}
    </span>
  );
};

export const AdminPageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-display font-semibold text-brown-deep">{title}</h1>
      {subtitle && <p className="text-sm text-brown-light mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);
