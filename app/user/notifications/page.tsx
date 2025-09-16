"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";

type Notification = {
  notification_id: string;
  recipient_id: string;
  sender_id: string;
  type: string;
  message: string;
  status: string;
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

  const fetchNotifications = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("get_user_notifications", {
      user_id: session.user.id,
    });

    if (error) {
      console.error("❌ Error fetching notifications:", error.message);
      toast.error("Failed to load notifications");
      setLoading(false);
      return;
    }

    const notifData = (data || []) as Notification[];
    setNotifications(notifData);

    // ✅ Type the parameter 'n' explicitly
    setUnreadCount(notifData.filter((n: Notification) => n.status === "unread").length);

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();

    if (!session?.user) return;

    // Realtime subscription
    const channel = supabase
      .channel(`user-notifications-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          if (payload.new.recipient_id === session.user.id) {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Mark single read when clicked
  const handleNotifClick = async (n: Notification) => {
    setNotifModal(n);
    if (n.status === "unread") {
      await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("notification_id", n.notification_id);
      await fetchNotifications();
    }
  };

  // Bulk mark all as read
  const handleMarkAllRead = async () => {
    const ids = notifications
      .filter((n: Notification) => n.status === "unread")
      .map((n: Notification) => n.notification_id);
    if (ids.length > 0) {
      await supabase
        .from("notifications")
        .update({ status: "read" })
        .in("notification_id", ids);
      await fetchNotifications();
    }
  };

  // Apply filter
  const filteredNotifications = notifications.filter((n: Notification) =>
    filter === "all" ? true : filter === "unread" ? n.status === "unread" : n.status === "read"
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 🔔 Page Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🔔 My Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-4">
        {["all", "unread", "read"].map((f) => (
          <button
            key={`filter-${f}`}
            onClick={() => setFilter(f as "all" | "unread" | "read")}
            className={`px-3 py-1 rounded-md text-sm ${
              filter === f ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk action */}
      {notifications.length > 0 && unreadCount > 0 && (
        <button
          onClick={handleMarkAllRead}
          className="mb-4 text-sm text-green-600 hover:underline"
        >
          Mark all as read
        </button>
      )}

      {/* Notifications list */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredNotifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredNotifications.map((n, idx) => (
            <li
              key={n.notification_id || `${n.created_at}-${idx}`}
              className={`p-4 rounded-md shadow cursor-pointer transition ${
                n.status === "unread"
                  ? "bg-green-50 border-l-4 border-green-500"
                  : "bg-white"
              }`}
              onClick={() => handleNotifClick(n)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{n.type}</span>
                <span className="text-sm text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2">{n.message}</p>
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
