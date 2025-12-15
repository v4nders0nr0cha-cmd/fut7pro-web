import { useState } from "react";

export function useNotificationBadge(initialCount = 0) {
  const [unreadCount, setUnreadCount] = useState(initialCount);

  const addUnread = (amount = 1) => setUnreadCount((prev) => prev + amount);
  const resetUnread = () => setUnreadCount(0);

  return { unreadCount, addUnread, resetUnread };
}
