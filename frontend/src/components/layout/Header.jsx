import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, Package, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?collection=new-arrivals', label: 'New Arrivals' },
  { to: '/custom-order', label: 'Custom Orders' },
  { to: '/about', label: 'Our Story' },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setAccountOpen(false);
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-cream/95 backdrop-blur-md shadow-soft' : 'bg-cream'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🧶</span>
            <span className="font-display text-2xl font-semibold text-brown-deep tracking-tight group-hover:text-rose transition-colors">
              Crochet Nest
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `font-label text-sm font-medium tracking-wide transition-colors relative py-1 ${
                    isActive ? 'text-rose-dark' : 'text-brown-deep hover:text-rose'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="p-2.5 rounded-full hover:bg-beige/50 transition-colors"
              aria-label="Search"
            >
              <Search size={20} className="text-brown-deep" />
            </button>

            {isAuthenticated && (
              <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-beige/50 transition-colors relative" aria-label="Wishlist">
                <Heart size={20} className="text-brown-deep" />
              </Link>
            )}

            <Link to="/cart" className="p-2.5 rounded-full hover:bg-beige/50 transition-colors relative" aria-label="Cart">
              <ShoppingBag size={20} className="text-brown-deep" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen((a) => !a)}
                className="p-2.5 rounded-full hover:bg-beige/50 transition-colors"
                aria-label="Account"
              >
                <User size={20} className="text-brown-deep" />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lift border border-beige/60 overflow-hidden"
                  >
                    {isAuthenticated ? (
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-beige/60">
                          <p className="font-label text-sm font-semibold text-brown-deep truncate">{user?.fullName}</p>
                          <p className="text-xs text-brown-light truncate">{user?.email}</p>
                        </div>
                        <Link to="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-deep hover:bg-cream-deep transition-colors">
                          <Settings size={16} /> My Account
                        </Link>
                        <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-deep hover:bg-cream-deep transition-colors">
                          <Package size={16} /> My Orders
                        </Link>
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-brown-deep hover:bg-cream-deep transition-colors">
                            <Settings size={16} /> Admin Dashboard
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blush hover:bg-cream-deep transition-colors">
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 flex flex-col gap-2">
                        <Link to="/login" onClick={() => setAccountOpen(false)} className="btn-primary text-sm py-2.5 justify-center">
                          Log In
                        </Link>
                        <Link to="/signup" onClick={() => setAccountOpen(false)} className="btn-outline text-sm py-2.5 justify-center">
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2.5 rounded-full hover:bg-beige/50 transition-colors" aria-label="Menu">
              <Menu size={22} className="text-brown-deep" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.form
              onSubmit={handleSearch}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pb-4 flex items-center gap-2">
                <input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for crochet bags, tops, gifts…"
                  className="input-cozy flex-1"
                />
                <button type="submit" className="btn-primary px-5 py-3">
                  <Search size={18} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 bg-cream lg:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-beige">
              <span className="font-display text-xl font-semibold text-brown-deep">Menu</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={24} className="text-brown-deep" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-3 rounded-xl font-label text-base text-brown-deep hover:bg-beige/40"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-beige my-3" />
              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="py-3 px-3 rounded-xl font-label text-brown-deep hover:bg-beige/40">My Account</Link>
                  <Link to="/account/orders" onClick={() => setMobileOpen(false)} className="py-3 px-3 rounded-xl font-label text-brown-deep hover:bg-beige/40">My Orders</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="py-3 px-3 rounded-xl font-label text-brown-deep hover:bg-beige/40">Admin Dashboard</Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-left py-3 px-3 rounded-xl font-label text-blush hover:bg-beige/40">Logout</button>
                </>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary justify-center">Log In</Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn-outline justify-center">Sign Up</Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
