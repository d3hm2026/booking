export function LogoMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 4L27 13.5V14.5H25V25.5C25 26.0523 24.5523 26.5 24 26.5H8C7.44772 26.5 7 26.0523 7 25.5V14.5H5V13.5L16 4Z"
        fill="currentColor"
      />
      <rect x="13.5" y="18" width="5" height="8.5" rx="0.75" fill="white" />
      <circle cx="23" cy="9.5" r="4" fill="white" />
      <path
        d="M21.3 9.5L22.4 10.6L24.7 8.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const padding = size === "sm" ? "p-1.5" : "p-2";
  const iconSize = size === "sm" ? "size-4" : "size-5";
  return (
    <div className={`bg-indigo-600 text-white rounded-lg ${padding} shrink-0`}>
      <LogoMark className={iconSize} />
    </div>
  );
}
