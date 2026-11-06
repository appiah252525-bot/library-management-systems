import { SignUp } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mb-3">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create Library Patron Account
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Apex University Institutional Library Portal
        </p>
      </div>

      <div className="w-full max-w-md flex justify-center">
        <SignUp
          appearance={{
            elements: {
              card: "rounded-2xl border border-border shadow-xl bg-card",
            },
          }}
        />
      </div>
    </div>
  );
}
