"use client";

import { Bell, Loader2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsButtonProps {
  href?: string;
  count?: number;
}

export default function NotificationsButton({
  href, 
  count = 0,
}: NotificationsButtonProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark notifications as read");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative touch-manipulation rounded-full focus-visible:ring-2 focus-visible:ring-slate-400"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl shadow-lg border border-slate-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <PopoverHeader className="gap-0">
            <PopoverTitle className="text-sm font-semibold text-slate-900">Notifications</PopoverTitle>
            <PopoverDescription className="text-xs text-slate-500">
              You have {unreadCount} unread messages.
            </PopoverDescription>
          </PopoverHeader>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="h-auto px-2 py-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-auto max-h-[350px]">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex flex-col gap-1 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !notification.is_read ? "bg-slate-50/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm font-medium ${!notification.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notification.title}
                    </span>
                    {!notification.is_read && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {notification.description}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-8 w-8 text-slate-200 mb-3" />
              <p className="text-sm font-medium text-slate-900">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">Check back later for new notifications.</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
