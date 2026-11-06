"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Repeat,
  AlertCircle,
  PlusCircle,
  TrendingUp,
  DollarSign,
  Send,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { RecentBorrowingsTable } from "@/components/dashboard/RecentBorrowingsTable";
import { Button } from "@/components/ui/Button";
import { BorrowBookModal } from "@/components/borrowings/BorrowBookModal";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = React.useState(false);
  const [isSendingReminders, setIsSendingReminders] = React.useState(false);

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        toast.error("Failed to load dashboard statistics.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error loading dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      const res = await fetch("/api/notifications/send-reminders", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchDashboardData();
      } else {
        toast.error(data.error || "Failed to dispatch reminders.");
      }
    } catch {
      toast.error("Error dispatching reminders.");
    } finally {
      setIsSendingReminders(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Library Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Real-time university catalog status, circulation analytics, and patron activities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="text-xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminders}
            isLoading={isSendingReminders}
            className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700"
          >
            <Send className="h-3.5 w-3.5" /> Dispatch Reminders
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsBorrowModalOpen(true)}
            className="text-xs shadow-sm"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Issue Book
          </Button>
        </div>
      </div>

      {/* KPI Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Books (Titles)"
          value={isLoading ? "..." : stats?.totalBooks ?? 0}
          subtitle={
            stats?.totalCopies
              ? `${stats.totalCopies} physical copies registered`
              : "Across all university departments"
          }
          icon={BookOpen}
          variant="primary"
        />

        <StatCard
          title="Borrowed Books"
          value={isLoading ? "..." : stats?.borrowedBooks ?? 0}
          subtitle="Currently on loan to students"
          icon={Repeat}
          variant="purple"
        />

        <StatCard
          title="Overdue Books"
          value={isLoading ? "..." : stats?.overdueBooks ?? 0}
          subtitle="Past specified return due date"
          icon={AlertCircle}
          variant="destructive"
        />

        <StatCard
          title="Registered Students"
          value={isLoading ? "..." : stats?.registeredStudents ?? 0}
          subtitle="Active library card holders"
          icon={Users}
          variant="success"
        />
      </div>

      {/* Secondary Banner: Total Outstanding Fines */}
      {stats && stats.totalUnpaidFines > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground">
                Outstanding Overdue Fines Pending Collection
              </span>
              <p className="text-xs text-muted-foreground">
                Students currently hold {formatCurrency(stats.totalUnpaidFines)} in unpaid overdue fines.
              </p>
            </div>
          </div>
          <Link href="/fines">
            <Button size="sm" variant="outline" className="text-xs text-amber-600 dark:text-amber-400 shrink-0">
              Review Unpaid Fines
            </Button>
          </Link>
        </div>
      )}

      {/* Analytics Charts */}
      <div>
        <OverviewChart
          monthlyTrends={stats?.monthlyBorrowTrends || []}
          categoryDistribution={stats?.categoryDistribution || []}
        />
      </div>

      {/* Recent Activity Table */}
      <div>
        <RecentBorrowingsTable
          records={stats?.recentBorrowings || []}
          onRefresh={fetchDashboardData}
        />
      </div>

      {/* Issue Book Modal */}
      <BorrowBookModal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
