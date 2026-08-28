import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import PageLoader from '../common/PageLoader';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#F7F1EC]">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-beige/60 px-5 sm:px-8 h-16 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-brown-deep">
            <Menu size={22} />
          </button>
          <div className="hidden lg:block font-label text-sm text-brown-light">Welcome back, {user?.fullName?.split(' ')[0]} 👋</div>
          <div className="flex items-center gap-4">
            <button className="relative text-brown-deep">
              <Bell size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-rose text-white flex items-center justify-center font-label font-semibold text-sm">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        <main className="p-5 sm:p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
