"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { Crown } from "lucide-react";
import Link from "next/link";

type NotificationRaw = Record<string, any>;

type Notification = {
  id?: string;
  type?: string;
  message?: string;
  sender_email?: string | null;
  recipient_id?: string;
  status?: "unread" | "read" | string;
  item_id?: string | null;
  created_at?: string;
};

export default function AdminNotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "read">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const ADMIN_ID =
    process.env.NEXT_PUBLIC_ADMIN_USER_ID ||
    "6bce5da8-9255-4e25-925a-4344d7436fe2"; // ✅ fallback for production

  // Normalize notification shape
  const normalize = (n: NotificationRaw): Notification => ({
    id: n.id ?? n.notification_id ?? n.notificationId ?? n._id,
    type: n.type ?? n.kind ?? "notification",
    message: n.message ?? n.body ?? "",
    sender_email: n.sender_email ?? n.sender ?? null,
    recipient_id: n.recipient_id ?? n.recipient ?? null,
    status: n.status ?? "unread",
    item_id: n.item_id ?? n.itemId ?? null,
    created_at:
      n.created_at ??
      n.inserted_at ??
      n.createdAt ??
      n.insertedAt ??
      new Date().toISOString(),
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          "id, type, message, sender_email, recipient_id, status, item_id, created_at"
        )
        .or(`recipient_id.eq.${ADMIN_ID},recipient_id.is.null`) // ✅ show admin + global
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications((data || []).map(normalize));
    } catch (err: any) {
      console.error("❌ Error fetching admin notifications:", err?.message || err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [supabase, ADMIN_ID]);

  // Mark as read
  const markAsRead = useCallback(
    async (note: Notification) => {
      const id = note.id;
      if (!id) return toast.error("Missing ID");

      if (note.status === "read") return;
      setUpdatingId(id);

      setNotifications((arr) =>
        arr.map((n) => (n.id === id ? { ...n, status: "read" } : n))
      );

      try {
        const { error } = await supabase
          .from("notifications")
          .update({ status: "read" })
          .eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        console.error("❌ Error marking as read:", err.message);
        toast.error("Failed to mark as read");
      } finally {
        setUpdatingId(null);
      }
    },
    [supabase]
  );

  // Delete notification
  const deleteNotification = async (note: Notification) => {
    const id = note.id;
    if (!id) return toast.error("Missing ID");

    if (!confirm("Are you sure you want to delete this notification?")) return;

    setDeletingId(id);
    const prev = notifications;
    setNotifications((arr) => arr.filter((n) => n.id !== id));

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
      toast.success("Notification deleted");
    } catch (err: any) {
      console.error("❌ Error deleting notification:", err.message);
      toast.error("Failed to delete");
      setNotifications(prev);
    } finally {
      setDeletingId(null);
    }
  };

  // Click handler
  const handleNotificationClick = async (note: Notification) => {
    await markAsRead(note);
    if (note.item_id) window.location.href = `/admin/review/${note.item_id}`;
  };

  // Real-time updates
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const raw = payload.new as NotificationRaw;
          const normalized = normalize(raw);

          // ✅ Only show admin/global notifications
          if (
            !normalized.recipient_id ||
            normalized.recipient_id === ADMIN_ID
          ) {
            setNotifications((prev) => [normalized, ...prev]);
            toast.success(`🔔 ${normalized.message}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase, ADMIN_ID]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return n.status === "unread";
    return n.status === "read";
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Crown className="w-7 h-7 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold">Admin Notifications</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/notifications" className="text-sm text-gray-600 hover:text-gray-800">
            Refresh
          </Link>
          <span className="px-3 py-1 text-sm font-medium bg-gray-100 rounded-full">
            Total ({notifications.length})
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-4 border-b mb-4">
        {[
          { key: "all", label: `All (${notifications.length})` },
          { key: "unread", label: `Unread (${unreadCount})` },
          { key: "read", label: `Read (${notifications.length - unreadCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`pb-2 px-3 transition ${
              activeFilter === tab.key
                ? "border-b-2 border-green-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading notifications...</p>}
      {!loading && notifications.length === 0 && <p>No notifications yet.</p>}

      <ul className="space-y-4 mt-4">
        {filteredNotifications.map((n, idx) => (
          <li
            key={n.id || idx}
            onClick={() => handleNotificationClick(n)}
            role="button"
            className={`p-4 rounded-md border cursor-pointer hover:shadow-sm transition ${
              n.status === "unread"
                ? "bg-yellow-50 border-yellow-300"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{n.type}</span>
                  {n.sender_email && (
                    <span className="text-xs text-gray-500">
                      · {n.sender_email}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                  {n.message}
                </p>
              </div>

              <div className="text-right space-y-2">
                <div className="text-xs text-gray-500">
                  {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                </div>

                {n.status === "unread" && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await markAsRead(n);
                    }}
                    disabled={updatingId === n.id}
                    className="block text-xs bg-green-600 text-white px-2 py-1 rounded disabled:opacity-60"
                  >
                    {updatingId === n.id ? "Marking..." : "Mark as read"}
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n);
                  }}
                  disabled={deletingId === n.id}
                  className="block text-xs bg-red-600 text-white px-2 py-1 rounded disabled:opacity-60"
                >
                  {deletingId === n.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
