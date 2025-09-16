"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type Notification = {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
  recipient_id?: string;
};

interface Props {
  isAdmin?: boolean;
  userId?: string;
}

export default function NotificationList({ isAdmin = false, userId }: Props) {
  const supabase = createClientComponentClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchNotifications = async () => {
    setLoading(true);

    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .range(page * limit, page * limit + limit - 1);

    if (!isAdmin && userId) {
      query = query.eq("recipient_id", userId);
    }

    const { data, error } = await query;

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, userId, isAdmin]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">
        {isAdmin ? "Admin Notifications" : "My Notifications"}
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-3 border rounded-lg ${
                n.status === "unread"
                  ? "bg-gray-100 border-blue-300"
                  : "bg-white"
              }`}
            >
              <p className="text-sm">{n.message}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{n.type}</span>
                <span>{new Date(n.created_at).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">Page {page + 1}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
