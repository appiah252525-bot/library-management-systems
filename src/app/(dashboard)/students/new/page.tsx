import { StudentForm } from "@/components/students/StudentForm";

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          Register Student Patron
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Enroll student into university library circulation and issue borrowing privileges
        </p>
      </div>

      <StudentForm />
    </div>
  );
}
