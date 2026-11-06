"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  GraduationCap,
  BookOpen,
  Phone,
  Mail,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";

const DEPARTMENTS = [
  "All",
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Business Administration",
  "Economics",
  "Mathematics",
  "Physics",
  "Medicine & Health",
  "Law",
  "Literature & Arts",
];

export default function StudentsPage() {
  const [students, setStudents] = React.useState<any[]>([]);
  const [meta, setMeta] = React.useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDept, setSelectedDept] = React.useState("All");
  const [isLoading, setIsLoading] = React.useState(true);

  const [deleteModal, setDeleteModal] = React.useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: "",
    name: "",
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchStudents = React.useCallback(
    async (page = 1, q = searchQuery, dept = selectedDept) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (q.trim()) params.append("q", q.trim());
        if (dept && dept !== "All") params.append("department", dept);

        const res = await fetch(`/api/students?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
          setMeta(data.meta || { page: 1, limit: 10, totalPages: 1, totalItems: 0 });
        }
      } catch {
        toast.error("Failed to load students.");
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedDept]
  );

  React.useEffect(() => {
    fetchStudents(1);
  }, [selectedDept]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(1, searchQuery, selectedDept);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student.");
      toast.success(`Removed student record for ${deleteModal.name}`);
      setDeleteModal({ isOpen: false, id: "", name: "" });
      fetchStudents(meta.page);
    } catch (err: any) {
      toast.error(err.message || "Could not delete student.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Student Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Registered university patrons, borrowing limits, and loan tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchStudents(meta.page)}
            className="text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Link href="/students/new">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID, or email..."
            className="h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-4 text-xs sm:text-sm text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                fetchStudents(1, searchQuery, e.target.value);
              }}
              className="h-10 w-full rounded-xl border border-input bg-muted/30 pl-9 pr-8 text-xs font-medium text-foreground focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedDept !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedDept("All");
                fetchStudents(1, "", "All");
              }}
              className="h-10 text-xs shrink-0"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Contact</th>
                <th className="px-6 py-3.5 text-center">Active Loans</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4 h-12 bg-muted/10" />
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-xs">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-xs text-primary">
                      {student.studentNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {student.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-[11px]">
                        {student.department}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {student.email}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {student.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant={student.activeBorrowsCount > 0 ? "default" : "outline"}
                        className="text-xs"
                      >
                        {student.activeBorrowsCount} book(s)
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/students/${student.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Profile">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Delete Student"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              id: student.id,
                              name: student.fullName,
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.totalItems}
        limit={meta.limit}
        onPageChange={(page) => fetchStudents(page)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
        title="Remove Student Record"
        description="Are you sure you want to delete this student patron?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Student: <strong className="text-foreground">{deleteModal.name}</strong> will be removed. This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: false, id: "", name: "" })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Confirm Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
