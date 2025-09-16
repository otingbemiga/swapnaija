'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX } from 'react-icons/fi';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import logo from '../public/logo.png';

// Pulse animation style for bell icon
const bellPulseStyle = `
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
.bell-pulse {
  animation: pulse 0.6s ease-in-out;
}
`;

interface Notification {
  id: string;
  message: string;
  status: string;
  created_at: string;
}

export default function Navbar() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [bellPulse, setBellPulse] = useState(false); // for animation

  const isAdmin = session?.user?.email === 'onefirstech@gmail.com';
  const dashboardLink = isAdmin ? '/admin/dashboard' : '/user/userdashboard';
  const notificationLink = isAdmin ? '/admin/notifications' : '/user/notifications';

  const category = [
    { name: 'Food Items', slug: 'food' },
    { name: 'Phone Accessories', slug: 'phone' },
    { name: 'Furniture', slug: 'furniture' },
    { name: 'Services', slug: 'services' },
    { name: 'Farm Produce', slug: 'farm' },
    { name: 'Wears', slug: 'wear' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Others', slug: 'others' },
  ];

  // Load user details
  useEffect(() => {
    if (session?.user) {
      const fullName = session.user.user_metadata?.fullName || '';
      const first = fullName.trim().split(' ')[0] || 'User';
      setFirstName(first.charAt(0).toUpperCase() + first.slice(1));
      setAvatarUrl(session.user.user_metadata?.avatar_url || '/default-avatar.png');
    } else {
      setFirstName(null);
      setAvatarUrl(null);
    }
  }, [session]);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      if (!session?.user?.id) return;

      const query = supabase
        .from('notifications')
        .select('id, message, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin) query.eq('recipient_id', session.user.id);

      const { data, error } = await query;
      if (error) {
        console.warn('[Navbar] fetch notifications error:', error.message);
        return;
      }

      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => n.status === 'unread').length);
    } catch (err: any) {
      console.error('❌ Unexpected error fetching notifications:', err?.message || err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session]);

  // Realtime updates
  useEffect(() => {
    if (!session?.user?.id) return;

    const filter = isAdmin ? undefined : `recipient_id=eq.${session.user.id}`;
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', ...(filter ? { filter } : {}) },
        async () => {
          await fetchNotifications();
          setBellPulse(true);
          setTimeout(() => setBellPulse(false), 700);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, isAdmin]);

  // Mark single as read
  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ status: 'read' }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Bulk mark all as read
  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ status: 'read' }).in(
      'id',
      notifications.filter((n) => n.status === 'unread').map((n) => n.id)
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    setUnreadCount(0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const handleLogoClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const isActive = (href: string) => pathname === href;

  // Bell icon
  const BellIcon = () => (
    <span
      className={`text-2xl cursor-pointer relative ${bellPulse ? 'bell-pulse' : ''}`}
      onClick={() => setIsNotifOpen((prev) => !prev)}
    >
      {isAdmin ? '👑' : '🔔'}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
          {unreadCount}
        </span>
      )}
    </span>
  );

  return (
    <>
      <style>{bellPulseStyle}</style>

      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 shadow ${
          isScrolled ? 'bg-white text-black' : 'bg-black text-white'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={handleLogoClick}>
          <Image src={logo} alt="SwapHub Logo" width={150} height={120} className="rounded-full" />
        </Link>

        {/* Mobile menu toggle */}
        <div className="md:hidden text-2xl z-50" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </div>

        {/* Menu links */}
        <div
          className={`fixed top-0 right-0 h-full w-2/3 bg-black text-white flex flex-col gap-6 p-6
          transform transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
          md:static md:flex md:flex-1 md:flex-row md:items-center md:justify-center md:gap-6 md:bg-transparent md:text-inherit md:w-auto md:h-auto md:p-0 md:opacity-100 md:translate-x-0`}
        >
          {/* Links */}
          <Link href="/swap" className={`hover:text-green-500 ${isActive('/swap') ? 'font-bold text-green-400' : ''}`}>
            Swap Item
          </Link>

          {/* Categories dropdown */}
          <div
            className="relative group md:block"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <button onClick={() => setIsCategoryOpen((prev) => !prev)} className="hover:text-green-500 flex items-center gap-1">
              Categories ▾
            </button>
            {isCategoryOpen && (
              <div className="absolute top-full mt-2 bg-white text-black shadow-lg rounded-md p-2 w-64 z-50 grid grid-cols-3 gap-2">
                {category.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="px-2 py-1 hover:bg-green-500 hover:text-white text-sm rounded transition block"
                    onClick={() => {
                      setIsCategoryOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/testimonials" className={`hover:text-green-500 ${isActive('/testimonials') ? 'font-bold text-green-400' : ''}`}>
            Success Stories
          </Link>
          <Link href="/support" className={`hover:text-green-500 ${isActive('/support') ? 'font-bold text-green-400' : ''}`}>
            Support
          </Link>
        </div>

        {/* Desktop profile */}
        <div className="hidden md:flex items-center gap-4 relative">
          {firstName ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <BellIcon />
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md w-80 max-h-96 overflow-y-auto z-50">
                    <div className="p-3 border-b font-semibold flex justify-between items-center">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setActiveNotification(n);
                            if (n.status === 'unread') markAsRead(n.id);
                          }}
                          className={`px-3 py-2 text-sm border-b last:border-0 cursor-pointer ${
                            n.status === 'unread' ? 'bg-green-50 font-medium' : 'bg-white'
                          }`}
                        >
                          {n.message}
                          <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500">No notifications</div>
                    )}
                    <Link href={notificationLink} className="block text-center py-2 text-sm text-green-600 hover:bg-green-50">
                      View all
                    </Link>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <Image
                  src={avatarUrl || '/default-avatar.png'}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full cursor-pointer border border-green-500"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                />
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg text-black w-44 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm">
                        Hi, Welcome <strong>{firstName}</strong>{' '}
                        {isAdmin && <span className="text-yellow-500 text-xs">👑 Admin</span>}
                      </p>
                    </div>
                    <Link href={dashboardLink} className="block px-4 py-2 text-sm hover:bg-green-100" onClick={() => setIsProfileMenuOpen(false)}>
                      My Dashboard
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/pending-items" className="block px-4 py-2 text-sm hover:bg-yellow-100" onClick={() => setIsProfileMenuOpen(false)}>
                        📋 Approve Items
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition">
                Get Started
              </Link>
              <Link href="/auth/login" className="border border-green-600 text-green-600 hover:bg-green-100 px-4 py-2 rounded-md transition">
                Login
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Notification Details Modal */}
      {activeNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-md shadow-lg max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-2">Notification Details</h2>
            <p className="mb-4">{activeNotification.message}</p>
            <p className="text-xs text-gray-500 mb-6">{new Date(activeNotification.created_at).toLocaleString()}</p>
            <button
              onClick={() => setActiveNotification(null)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
