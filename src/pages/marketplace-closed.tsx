import PublicLayout from "@/frontend/components/Layout/PublicLayout";
import { useEffect, useRef } from "react";

export default function Marketplace() {
  const searchRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (evt: Event) => {
    if (searchRef.current && !searchRef.current.contains(evt.target as Node)) {
      // Show project search menu
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return (
      <PublicLayout>
        <div>
          <h1 className="text-white md:text-3xl text-2xl py-4 font-bold text-center">
            Allowlist Marketplace under maintenance.
          </h1>
        </div>
      </PublicLayout>
  );
}
