/**
 * Marca NexPerson, um "N" formado por nós conectados (nexus) com um hub central,
 * dentro de um círculo. Simboliza continuidade irradiando pela organização.
 */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NexPerson"
    >
      <circle cx="24" cy="24" r="23" fill="#DBEAFE" />
      {/* traços do N */}
      <g stroke="#2563EB" strokeWidth="4" strokeLinecap="round">
        <line x1="9" y1="39" x2="9" y2="9" />
        <line x1="9" y1="9" x2="39" y2="39" />
        <line x1="39" y1="39" x2="39" y2="9" />
      </g>
      {/* nós das pontas */}
      <g fill="#2563EB">
        <circle cx="9" cy="9" r="5.5" />
        <circle cx="9" cy="39" r="5.5" />
        <circle cx="39" cy="9" r="5.5" />
        <circle cx="39" cy="39" r="5.5" />
      </g>
      {/* hub central */}
      <circle cx="24" cy="24" r="8" fill="#1E3A8A" />
    </svg>
  );
}
