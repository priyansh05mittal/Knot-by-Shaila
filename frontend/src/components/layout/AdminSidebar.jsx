import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Image,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
  BarChart3,
  X,
} from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/custom-orders', label: 'Custom Orders', icon: Sparkles },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const AdminSidebar = ({ mobileOpen, onClose }) => {
  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧶</span>
          <span className="font-display text-lg font-semibold text-white">Crochet Nest</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-label font-medium transition-colors ${
                isActive ? 'bg-rose text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 text-xs text-white/30 border-t border-white/10">
        Crochet Nest Admin v1.0
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-[#2E2222] min-h-screen sticky top-0">{content}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#2E2222]">{content}</aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
