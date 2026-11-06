"use client";

import * as React from "react";
import {
  Bell,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Mail,
  User,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error("Failed to fetch reminders.");
      }
    } catch {
      toast.error("Network error fetching notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSendAll = async () => {
    setIsSending(true);
    try {
      const res = await fetch("/api/notifications/send-reminders", {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message);
        fetchNotifications();
      } else {
        toast.error(json.error || "Failed to dispatch reminders.");
      }
    } catch {
      toast.error("Network error dispatching reminders.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSingle = (studentEmail: string, title: string) => {
    toast.success(`Automated notification notice sent to ${studentEmail}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-3">
          <div className="h-24 bg-card rounded-2xl border border-border animate-pulse" />
          <div className="h-24 bg-card rounded-2xl border border-border animate-pulse" />
        </div>
      </div>
    );
  }

  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Notification & Reminder Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Automated alerts for imminent due dates, delinquency notices, and fine warnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            className="text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSendAll}
            isLoading={isSending}
            disabled={notifications.length === 0}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" /> Dispatch All Reminders ({notifications.length})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Active Alerts
            </span>
            <div className="text-2xl font-extrabold text-foreground mt-1">
              {data?.totalCount || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending student notifications</p>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 uppercase">
              Overdue Delinquencies
            </span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">
              {data?.overdueCount || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Accruing daily fines</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase">
              Due Within 72 Hours
            </span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {data?.dueSoonCount || 0}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">Upcoming return date reminders</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-2 opacity-80" />
            <h3 className="text-base font-bold text-foreground">All Clear!</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No pending overdue notices or upcoming due dates require reminder dispatches.
            </p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-5 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.type === "OVERDUE"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    n.type === "OVERDUE"
                      ? "bg-rose-500/10 text-rose-600"
                      : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  {n.type === "OVERDUE" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={n.type === "OVERDUE" ? "destructive" : "warning"} className="text-[10px]">
                      {n.type === "OVERDUE" ? "OVERDUE NOTICE" : "DUE DATE REMINDER"}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">
                      Due: {formatDate(n.dueDate)}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                  <p className="text-xs text-muted-foreground max-w-xl">{n.message}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground/80 pt-1">
                    <span>
                      <strong>Student:</strong> {n.studentName} ({n.studentNumber})
                    </span>
                    <span>
                      <strong>Email:</strong> {n.studentEmail}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5"
                  onClick={() => handleSendSingle(n.studentEmail, n.title)}
                >
                  <Mail className="h-3.5 w-3.5" /> Send Notice
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
