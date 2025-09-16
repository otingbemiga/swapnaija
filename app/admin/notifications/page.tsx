"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { Crown } from "lucide-react"; // crown icon for admin header
import Link from "next/link";

type NotificationRaw = Record<string, any>;

type Notification = {
  notification_id?: string; // RPC may alias id -> notification_id
  id?: string;              // fallback if RPC returns "id"
  type?: string;
  message?: string;
  sender_email?: string | null;
  recipient_id?: string;
  status?: "unread" | "read" | string;
  item_id?: string | null; // always use item_id after normalization
  created_at?: string;
};

export default function AdminNotificationsPage() {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "read">(
    "all"
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Helper: normalize note shape
  const normalize = (n: NotificationRaw): Notification => {
    return {
      notification_id: n.notification_id ?? n.id ?? n.notificationId ?? n._id,
      id: n.id ?? n.notification_id ?? n.notificationId ?? n._id,
      type: n.type ?? n.kind ?? "notification",
      message: n.message ?? n.body ?? "",
      sender_email: n.sender_email ?? n.sender ?? null,
      recipient_id: n.recipient_id ?? n.recipient ?? null,
      status: n.status ?? "unread",
      item_id: n.item_id ?? n.itemId ?? null, // normalize all to item_id
      created_at:
        n.created_at ??
        n.inserted_at ??
        n.createdAt ??
        n.insertedAt ??
        new Date().toISOString(),
    };
  };

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const rpcResult = await supabase.rpc("get_admin_notifications");

      if (rpcResult.error) {
        console.warn(
          "RPC get_admin_notifications failed, falling back to direct select:",
          rpcResult.error.message
        );
        const { data, error } = await supabase
          .from("notifications")
          .select(
            "id, type, message, sender_email, recipient_id, status, item_id, created_at"
          )
          .order("created_at", { ascending: false });
        if (error) throw error;
        setNotifications((data || []).map(normalize));
        setLoading(false);
        return;
      }

      // RPC success
      const arr = (rpcResult.data || []) as NotificationRaw[];
      setNotifications(arr.map(normalize));
    } catch (err: any) {
      console.error("❌ Error fetching admin notifications:", err?.message || err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Mark as read
  const markAsRead = useCallback(
    async (note: Notification) => {
      const id = note.notification_id ?? note.id;
      if (!id) {
        toast.error("Notification missing id, cannot mark read");
        return;
      }
      if (note.status === "read") return;

      setUpdatingId(id);
      const prev = notifications;
      setNotifications((prevArr) =>
        prevArr.map((n) =>
          (n.notification_id ?? n.id) === id ? { ...n, status: "read" } : n
        )
      );

      try {
        const res = await fetch("/api/notify-admin", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: "read" }),
        });

        const body = await res.json();
        if (!res.ok) {
          throw new Error(body?.error || body?.message || "Failed to mark read");
        }

        toast.success("Marked as read");
      } catch (err: any) {
        console.error("❌ Error marking notification read:", err?.message || err);
        toast.error("Failed to mark notification read");
        setNotifications(prev);
      } finally {
        setUpdatingId(null);
      }
    },
    [notifications]
  );

  // When user clicks a notification
  const handleNotificationClick = async (note: Notification) => {
    await markAsRead(note);

    // navigate only if item_id is present
    if (note.item_id) {
      window.location.href = `/item/${note.item_id}`;
    }
  };

  // Realtime subscription
  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          try {
            const raw = payload.new as NotificationRaw;
            const n = normalize(raw);
            setNotifications((prev) => [n, ...prev]);
            toast(`${n.type} — ${n.message}`, { duration: 5000 });
          } catch (e) {
            console.error("Error processing realtime payload:", e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return n.status === "unread";
    return n.status === "read";
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with crown icon + unread badge */}
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
          <Link
            href="/admin/notifications"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            View all
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
          {
            key: "read",
            label: `Read (${notifications.length - unreadCount})`,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveFilter(t.key as any)}
            className={`pb-2 px-3 transition ${
              activeFilter === (t.key as any)
                ? "border-b-2 border-green-600 font-semibold"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p>Loading notifications...</p>}
      {!loading && notifications.length === 0 && (
        <p>No notifications yet — you will see them here when they arrive.</p>
      )}

      <ul className="space-y-4 mt-4">
        {filteredNotifications.map((n, idx) => {
          const key = n.notification_id ?? n.id ?? `${n.created_at ?? ""}-${idx}`;
          return (
            <li
              key={key}
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
                      <span className="text-xs text-gray-500">· {n.sender_email}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleString()
                      : ""}
                  </div>

                  {n.status === "unread" && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await markAsRead(n);
                      }}
                      disabled={updatingId === (n.notification_id ?? n.id)}
                      className="mt-2 text-xs bg-green-600 text-white px-2 py-1 rounded disabled:opacity-60"
                    >
                      {updatingId === (n.notification_id ?? n.id)
                        ? "Marking..."
                        : "Mark as read"}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
