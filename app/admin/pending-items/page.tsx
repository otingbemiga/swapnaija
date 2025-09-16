'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default function PendingItemsPage() {
  const session = useSession();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [approvedItems, setApprovedItems] = useState<any[]>([]);
  const [rejectedItems, setRejectedItems] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // ✅ Check if user is super admin
  useEffect(() => {
    if (!session) return;
    const email = session?.user?.email?.toLowerCase();
    if (email === 'onefirstech@gmail.com') {
      setIsAdmin(true);
    } else {
      router.replace('/user/dashboard');
    }
  }, [session, router]);

  // ✅ Fetch items
  const fetchItems = async () => {
    const { data: pending } = await supabase
      .from('items')
      .select('*, profiles(points)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    const { data: approved } = await supabase
      .from('items')
      .select('*, profiles(points)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    const { data: rejected } = await supabase
      .from('items')
      .select('*, profiles(points)')
      .eq('status', 'rejected')
      .order('created_at', { ascending: false });

    const { data: all } = await supabase
      .from('items')
      .select('*')
      .eq('status', 'approved');

    setPendingItems(pending || []);
    setApprovedItems(approved || []);
    setRejectedItems(rejected || []);
    setAllItems(all || []);
  };

  // ✅ Real-time subscription
  useEffect(() => {
    if (!isAdmin) return;
    fetchItems();

    const channel = supabase
      .channel('admin-pending-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => {
          fetchItems(); // Refresh lists on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // ✅ Approve item (via API route)
  const approveItem = async (item: any) => {
    setLoadingId(item.id);
    try {
      const res = await fetch('/api/items/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          user_id: item.user_id,
          points: item.points || 10,
          admin_id: session?.user?.id, // ✅ pass logged-in admin
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success('Item approved successfully');
    } catch (err) {
      toast.error('Failed to approve item');
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Reject item (via API route)
  const rejectItem = async (item: any) => {
    const reason = rejectReason[item.id];
    if (!reason || reason.trim().length < 3) {
      toast.error('Please provide a valid rejection reason.');
      return;
    }

    setLoadingId(item.id);
    try {
      const res = await fetch('/api/items/reject', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          user_id: item.user_id,
          points: item.points || 10,
          reason,
          admin_id: session?.user?.id, // ✅ include admin
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success('Item rejected');
    } catch (err) {
      toast.error('Failed to reject item');
    } finally {
      setLoadingId(null);
    }
  };

  // 🔍 Search filter
  const filterItems = (items: any[]) =>
    items.filter(
      (item) =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

  const filteredPending = filterItems(pendingItems);
  const filteredApproved = filterItems(approvedItems);
  const filteredRejected = filterItems(rejectedItems);

  // ✅ Reusable media swiper (images & videos)
  const renderMediaSwiper = (item: any) => (
    <Swiper modules={[Navigation]} navigation spaceBetween={10} slidesPerView={1} className="w-[320px] h-[220px]">
      {item.image_paths?.map((path: string, idx: number) => (
        <SwiperSlide key={`img-${idx}`}>
          <Image
            src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-images/${path}`}
            alt={item.title}
            width={320}
            height={220}
            className="rounded object-cover w-full h-full"
            unoptimized
          />
        </SwiperSlide>
      ))}
      {item.video_path && (
        <SwiperSlide key="video">
          <video
            src={`https://rzjfumrvmmdluunqsqsp.supabase.co/storage/v1/object/public/item-videos/${item.video_path}`}
            controls
            className="rounded w-full h-full object-cover"
          />
        </SwiperSlide>
      )}
    </Swiper>
  );

  if (!session) return <p className="p-6 text-center">Loading session...</p>;

  return (
    <main className="p-6 max-w-6xl mx-auto space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-green-700">Admin: Manage Items</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {/* Tabs with badge counters */}
      <div className="flex gap-4 border-b pb-2 mb-6">
        {([
          { key: 'pending', label: 'Pending', count: filteredPending.length },
          { key: 'approved', label: 'Approved', count: filteredApproved.length },
          { key: 'rejected', label: 'Rejected', count: filteredRejected.length },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-t font-semibold flex items-center gap-2 ${
              activeTab === tab.key ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === tab.key ? 'bg-white text-green-700' : 'bg-gray-700 text-white'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <section>
          {filteredPending.length === 0 ? (
            <p className="text-gray-500">No pending items.</p>
          ) : (
            filteredPending.map((item) => (
              <div key={item.id} className="bg-yellow-50 border p-4 rounded mb-6 shadow">
                <div className="flex gap-4">
                  <div className="w-[320px]">{renderMediaSwiper(item)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm mt-1">📦 Condition: {item.condition}</p>
                    <p className="text-sm mt-1">🎯 Desired Swap: {item.desired_swap}</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      ⭐ User Points: {item.profiles?.points ?? 0}
                    </p>
                    <textarea
                      placeholder="Reason for rejection..."
                      value={rejectReason[item.id] || ''}
                      onChange={(e) => setRejectReason((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full border rounded p-2 text-sm mt-2"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        disabled={loadingId === item.id}
                        onClick={() => approveItem(item)}
                        className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {loadingId === item.id ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        disabled={loadingId === item.id}
                        onClick={() => rejectItem(item)}
                        className="bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                      >
                        {loadingId === item.id ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'approved' && (
        <section>
          {filteredApproved.length === 0 ? (
            <p className="text-gray-500">No approved items yet.</p>
          ) : (
            filteredApproved.map((item) => (
              <div key={item.id} className="bg-green-50 border p-4 rounded mb-6 shadow">
                <div className="flex gap-4">
                  <div className="w-[320px]">{renderMediaSwiper(item)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm mt-1">📦 Condition: {item.condition}</p>
                    <p className="text-sm mt-1">🎯 Desired Swap: {item.desired_swap}</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      ⭐ User Points: {item.profiles?.points ?? 0}
                    </p>
                    <p className="text-sm font-semibold text-green-700 mt-1">✅ Approved</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'rejected' && (
        <section>
          {filteredRejected.length === 0 ? (
            <p className="text-gray-500">No rejected items yet.</p>
          ) : (
            filteredRejected.map((item) => (
              <div key={item.id} className="bg-red-50 border p-4 rounded mb-6 shadow">
                <div className="flex gap-4">
                  <div className="w-[320px]">{renderMediaSwiper(item)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm mt-1">📦 Condition: {item.condition}</p>
                    <p className="text-sm mt-1">🎯 Desired Swap: {item.desired_swap}</p>
                    <p className="text-sm font-bold text-green-600 mt-1">
                      ⭐ User Points: {item.profiles?.points ?? 0}
                    </p>
                    <p className="text-sm font-semibold text-red-700 mt-1">
                      ❌ Rejected – {item.review_reason}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </main>
  );
}
