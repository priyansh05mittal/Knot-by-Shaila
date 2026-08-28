import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, Package, MapPin, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/custom-orders', label: 'Custom Requests', icon: Sparkles },
];

const AccountLayout = () => {
  const { user } = useAuth();

  return (
    <div className="section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-full bg-rose/15 flex items-center justify-center font-display text-2xl text-rose-dark flex-shrink-0">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.fullName?.charAt(0)
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl">{user?.fullName}</h1>
            <p className="text-brown-light text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-label font-medium whitespace-nowrap transition-colors ${
                    isActive ? 'bg-rose text-white' : 'text-brown-deep hover:bg-beige/50'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
