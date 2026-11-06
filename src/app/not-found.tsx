import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BookX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6">
        <BookX className="h-10 w-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
        404 - Page Not Found
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        The library catalog page or resource you are looking for does not exist or may have been relocated.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <Button variant="primary">
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
