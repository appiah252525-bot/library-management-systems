"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { StudentFormData, StudentSchema } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Save, ArrowLeft, GraduationCap } from "lucide-react";

interface StudentFormProps {
  initialData?: Partial<StudentFormData> & { id?: string };
  isEdit?: boolean;
}

const DEPARTMENTS = [
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

export function StudentForm({ initialData, isEdit = false }: StudentFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState<StudentFormData>({
    studentNumber: initialData?.studentNumber || "",
    fullName: initialData?.fullName || "",
    department: initialData?.department || DEPARTMENTS[0],
    email: initialData?.email || "",
    phone: initialData?.phone || "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = StudentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      toast.error("Please resolve the validation errors.");
      return;
    }

    try {
      const endpoint = isEdit ? `/api/students/${initialData?.id}` : "/api/students";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save student record.");
      }

      toast.success(
        isEdit
          ? `Updated profile for ${result.data.fullName}`
          : `Student ${result.data.fullName} registered successfully.`
      );
      router.push("/students");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {isEdit ? "Edit Student Profile" : "Register New Student"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Academic credentials and library patron information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Student ID / Matriculation Number *"
            name="studentNumber"
            value={formData.studentNumber}
            onChange={handleChange}
            placeholder="e.g. STU-2024-042"
            helperText="Unique university identification code."
            error={errors.studentNumber}
          />

          <Input
            label="Full Name *"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Alexander Hamilton"
            error={errors.fullName}
          />

          <div>
            <label className="block text-xs font-semibold text-foreground/80 tracking-wide mb-1.5">
              Academic Department *
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-xs text-destructive mt-1">{errors.department}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="University Email Address *"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. a.hamilton@apex.edu"
              error={errors.email}
            />

            <Input
              label="Phone Number *"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +1 (555) 019-2834"
              error={errors.phone}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" isLoading={isLoading}>
            <Save className="h-4 w-4" /> {isEdit ? "Update Student" : "Register Student"}
          </Button>
        </div>
      </div>
    </form>
  );
}
