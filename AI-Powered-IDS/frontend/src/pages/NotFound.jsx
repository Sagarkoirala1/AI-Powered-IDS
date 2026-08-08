import { Link } from "react-router-dom";
import { Radar } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-base px-6 text-center text-ink">
      <Radar className="text-signal" size={28} />
      <h1 className="font-display text-xl font-semibold">Signal lost</h1>
      <p className="max-w-xs text-sm text-ink-muted">
        Nothing's detected at this address. It may have been moved or never existed.
      </p>
      <Link to="/" className="mt-2 text-sm text-signal hover:underline">
        Return to dashboard
      </Link>
    </div>
  );
}
