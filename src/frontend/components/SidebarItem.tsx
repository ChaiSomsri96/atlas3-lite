import Link from "next/link";

export const SidebarItem = ({
  Icon,
  text,
  active,
  href,
  count,
  warning,
}: {
  Icon: React.ComponentType<{ className: string }>;
  text: string;
  active: boolean;
  href: string;
  count?: number | undefined | null;
  warning?: boolean | undefined | null;
}) => (
  <Link href={href}>
    <div
      className={`flex gap-2 w-full items-center py-2 px-2 hover:bg-dark-500 hover:cursor-pointer rounded-lg ${
        active ? "bg-dark-500" : ""
      } `}
    >
      <div className="p-3 bg-dark-600 rounded-lg">
        <Icon className="text-white w-4 h-4" />
      </div>
      <p className="text-white text-sm">{text}</p>

      {typeof count === "number" ? (
        <div className="px-2 text-sm bg-primary-500 rounded-lg">{count}</div>
      ) : null}

      {typeof warning === "boolean" && warning ? (
        <div className="px-2 text-sm bg-error-500 rounded-lg">!</div>
      ) : null}
    </div>
  </Link>
);
