"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";

type Notification = {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: string;
  message: string;
  status: "read" | "unread";
  created_at: string;
};

export default function UserNotificationsPage() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [notifModal, setNotifModal] = useState<Notification | null>(null);

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Fetch error:", error.message);
      toast.error("Unable to load notifications");
      setLoading(false);
      return;
    }

    const notifData = (data || []) as Notification[];
    setNotifications(notifData);
    setUnreadCount(notifData.filter((n) => n.status === "unread").length);
    setLoading(false);
  };

  // ✅ Realtime + initial fetch
  useEffect(() => {
    if (!session?.user) return;
    fetchNotifications();

    const userId = session.user.id; // ✅ Safely capture non-null id
    const channel = supabase
      .channel(`user_notifications_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${userId}`,
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, supabase]);

  // ✅ Mark one notification as read
  const handleNotifClick = async (n: Notification) => {
    setNotifModal(n);

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === n.id ? { ...notif, status: "read" } : notif
      )
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));

    // DB update (only if unread)
    if (n.status === "unread" && session?.user?.id) {
      const { error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("id", n.id)
        .eq("recipient_id", session.user.id);

      if (error) {
        console.error("❌ Update error:", error.message);
        toast.error("Failed to mark as read (check RLS)");
      } else {
        console.log("✅ Notification marked as read in DB");
      }
    }
  };

  // ✅ Mark all as read
  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter((n) => n.status === "unread")
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    // Optimistic UI
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
    setUnreadCount(0);

    if (!session?.user?.id) return;

    const { error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("recipient_id", session.user.id)
      .in("id", unreadIds);

    if (error) {
      console.error("❌ Bulk update error:", error.message);
      toast.error("Failed to mark all as read");
    } else {
      console.log("✅ All marked as read");
    }
  };

  // ✅ Filter
  const filteredNotifications = notifications.filter((n) =>
    filter === "all"
      ? true
      : filter === "unread"
      ? n.status === "unread"
      : n.status === "read"
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🔔 My Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-4">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded-md text-sm transition ${
              filter === f
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Mark All */}
      {notifications.length > 0 && unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          className="mb-4 text-sm text-green-600 hover:underline"
        >
          Mark all as read
        </button>
      )}

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredNotifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredNotifications.map((n, idx) => (
            <li
              key={n.id || `${n.created_at}-${idx}`}
              className={`p-4 rounded-md shadow cursor-pointer transition ${
                n.status === "unread"
                  ? "bg-green-50 border-l-4 border-green-500"
                  : "bg-white border border-gray-100"
              } hover:bg-gray-50`}
              onClick={() => handleNotifClick(n)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{n.type}</span>
                <span className="text-sm text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-gray-800">{n.message}</p>
              {n.status === "unread" && (
                <span className="text-xs text-green-600 font-semibold">New</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {notifModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-w-full p-6 relative">
            <h3 className="text-lg font-bold mb-2">Notification</h3>
            <p>{notifModal.message}</p>
            <p className="text-xs text-gray-500 mt-2">
              {new Date(notifModal.created_at).toLocaleString()}
            </p>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setNotifModal(null)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
