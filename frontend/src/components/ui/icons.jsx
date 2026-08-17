const base = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconMenu({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}

export function IconSearch({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m17 17-3.8-3.8" />
    </svg>
  );
}

export function IconBell({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M5 8a5 5 0 0 1 10 0c0 3.2 1 4.2 1.5 5H3.5C4 12.2 5 11.2 5 8Z" />
      <path d="M8.2 15.5a1.8 1.8 0 0 0 3.6 0" />
    </svg>
  );
}

export function IconChevronDown({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="m5.5 7.5 4.5 5 4.5-5" />
    </svg>
  );
}

export function IconChevronLeft({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="m12.5 5.5-4.5 4.5 4.5 4.5" />
    </svg>
  );
}

export function IconChevronRight({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="m7.5 5.5 4.5 4.5-4.5 4.5" />
    </svg>
  );
}

export function IconSun({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
    </svg>
  );
}

export function IconMoon({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8Z" />
    </svg>
  );
}

export function IconDots({ className }) {
  return (
    <svg {...base} fill="currentColor" stroke="none" className={className}>
      <circle cx="4.5" cy="10" r="1.3" />
      <circle cx="10" cy="10" r="1.3" />
      <circle cx="15.5" cy="10" r="1.3" />
    </svg>
  );
}

export function IconLogOut({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M8 17.5H4.5a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1H8" />
      <path d="M13 14l4-4-4-4" />
      <path d="M17 10H7.5" />
    </svg>
  );
}

export function IconPlus({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  );
}

export function IconDownload({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M10 3v10.5" />
      <path d="m5.8 9.3 4.2 4.2 4.2-4.2" />
      <path d="M3.5 16.5h13" />
    </svg>
  );
}

export function IconFileSpreadsheet({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 2.5h6l3 3v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" />
      <path d="M12 2.5v3h3" />
      <path d="M7.3 11h5.4M7.3 14h5.4M9 11v6" />
    </svg>
  );
}

export function IconFilePdf({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 2.5h6l3 3v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" />
      <path d="M12 2.5v3h3" />
      <path d="M6.8 15v-4h1.1c.7 0 1.2.5 1.2 1.15S8.6 13.3 7.9 13.3H6.8" />
      <path d="M10.6 15v-4h1c1 0 1.6.7 1.6 2s-.6 2-1.6 2h-1Z" />
    </svg>
  );
}

export function IconPencil({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="m13.3 3.8 2.9 2.9-9 9-3.4.6.6-3.5 8.9-9Z" />
    </svg>
  );
}

export function IconTrash({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5h12" />
      <path d="M7.5 5.5v-1a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1" />
      <path d="M5.3 5.5 6 16a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9l.7-10.5" />
      <path d="M8.3 8.5v5M11.7 8.5v5" />
    </svg>
  );
}

export function IconX({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
    </svg>
  );
}

export function IconAlertTriangle({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M8.5 3.5 1.8 15a1 1 0 0 0 .87 1.5h14.66a1 1 0 0 0 .87-1.5L11.5 3.5a1 1 0 0 0-1.73 0z" />
      <path d="M10 8v3.3M10 14h.01" />
    </svg>
  );
}

export function IconUserPlus({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="7.5" r="3" />
      <path d="M2.5 17c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2" />
      <path d="M15 7v5M12.5 9.5h5" />
    </svg>
  );
}

export function IconEye({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M2 10s2.7-5.5 8-5.5S18 10 18 10s-2.7 5.5-8 5.5S2 10 2 10Z" />
      <circle cx="10" cy="10" r="2.3" />
    </svg>
  );
}

export function IconGrid({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="6" height="6" rx="1.2" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" />
    </svg>
  );
}

export function IconBuilding({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 17V4.5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1V17" />
      <path d="M14 9.5h1.5a1 1 0 0 1 1 1V17" />
      <path d="M2.5 17h15" />
      <path d="M6.5 6.5h1M9.5 6.5h1M6.5 9.5h1M9.5 9.5h1M6.5 12.5h1M9.5 12.5h1" />
    </svg>
  );
}

export function IconUsers({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="7" cy="7" r="2.6" />
      <path d="M2.5 16c0-2.6 2-4.2 4.5-4.2s4.5 1.6 4.5 4.2" />
      <circle cx="14" cy="7.5" r="2" />
      <path d="M13 11.9c1.9.2 3.5 1.6 3.5 4.1" />
    </svg>
  );
}

export function IconAlertCircle({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6.8v3.6" />
      <path d="M10 13.2h.01" />
    </svg>
  );
}

export function IconCreditCard({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="2.5" y="5" width="15" height="10.5" rx="1.5" />
      <path d="M2.5 8.3h15" />
      <path d="M5 12.3h3" />
    </svg>
  );
}

export function IconMegaphone({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 8v4a1 1 0 0 0 1 1h1.3L9 15.8V4.2L5.3 7H4a1 1 0 0 0-1 1Z" />
      <path d="M11.5 6.2a4 4 0 0 1 0 7.6" />
      <path d="M14 4.8a7 7 0 0 1 0 10.4" />
    </svg>
  );
}

export function IconCalendar({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="14" height="13" rx="1.5" />
      <path d="M3 8h14" />
      <path d="M7 2.5v3M13 2.5v3" />
    </svg>
  );
}

export function IconShield({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M10 2.5 16 5v4.5c0 4-2.6 6.7-6 8.2-3.4-1.5-6-4.2-6-8.2V5Z" />
      <path d="m7.3 9.8 1.8 1.8 3.6-3.8" />
    </svg>
  );
}

export function IconArrowUpRight({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 14 14 6" />
      <path d="M7.5 6H14v6.5" />
    </svg>
  );
}

export function IconArrowDownRight({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l8 8" />
      <path d="M12.5 14H6V7.5" />
    </svg>
  );
}

export function IconClock({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4.3l3 1.7" />
    </svg>
  );
}

export function IconCheck({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="m4.5 10.5 3.8 3.8L15.5 6" />
    </svg>
  );
}

export function IconQrCode({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="5.5" height="5.5" rx="1" />
      <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" />
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" />
      <path d="M12 12h2M12 15.5h4.5M16.5 12v4.5" />
    </svg>
  );
}

export function IconCamera({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 7.5a1 1 0 0 1 1-1h2.2l.9-1.6a1 1 0 0 1 .87-.5h3.06a1 1 0 0 1 .87.5l.9 1.6H16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-8Z" />
      <circle cx="10" cy="11.5" r="3" />
    </svg>
  );
}

export function IconMap({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M7 4 3 5.5v11L7 15m0-11 6 2m-6-2v11m6-9 4-1.5v11L13 15m0-9v9m0-9 6 2v11" />
    </svg>
  );
}

export function IconPoll({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="10.5" width="3.2" height="6" rx="0.8" />
      <rect x="8.4" y="6.5" width="3.2" height="10" rx="0.8" />
      <rect x="13.8" y="3.5" width="3.2" height="13" rx="0.8" />
    </svg>
  );
}

export function IconLock({ className }) {
  return (
    <svg {...base} className={className}>
      <rect x="4.5" y="9" width="11" height="8" rx="1.5" />
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
      <circle cx="10" cy="12.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWrench({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M13.5 3.5a4 4 0 0 0-5.2 4.9L3.5 13.2a1.5 1.5 0 0 0 2.1 2.1l4.8-4.8a4 4 0 0 0 4.9-5.2l-2.3 2.3-2-2Z" />
    </svg>
  );
}

export function IconCar({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 12.5V15a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-.7h7v.7a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2.5" />
      <path d="M3.5 12.5 5 7.8a1.5 1.5 0 0 1 1.4-1h7.2a1.5 1.5 0 0 1 1.4 1l1.5 4.7Z" />
      <path d="M3.5 12.5h13" />
      <circle cx="6.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13.5" cy="12.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconUser({ className }) {
  return (
    <svg {...base} className={className}>
      <circle cx="10" cy="6.8" r="3.3" />
      <path d="M3.5 17c0-3.3 2.9-5.8 6.5-5.8s6.5 2.5 6.5 5.8" />
    </svg>
  );
}

export function IconBook({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 4.5c1.8-.7 4.1-.7 6 .3v10.7c-1.9-1-4.2-1-6-.3V4.5Z" />
      <path d="M16 4.5c-1.8-.7-4.1-.7-6 .3v10.7c1.9-1 4.2-1 6-.3V4.5Z" />
    </svg>
  );
}

export function IconHistory({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M3.5 10a6.5 6.5 0 1 0 2-4.7" />
      <path d="M3 3.5v3.3h3.3" />
      <path d="M10 6.5V10l2.6 1.6" />
    </svg>
  );
}

export function IconPhone({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M5 3.5h2.2l1 3-1.6 1.4a9 9 0 0 0 4.5 4.5l1.4-1.6 3 1v2.2c0 .9-.8 1.6-1.7 1.5A13.5 13.5 0 0 1 3.5 5.2c-.1-.9.6-1.7 1.5-1.7Z" />
    </svg>
  );
}

export function IconSiren({ className }) {
  return (
    <svg {...base} className={className}>
      <path d="M4.5 15.5a5.5 5.5 0 1 1 11 0Z" />
      <path d="M10 15.5V9" />
      <path d="M10 2.5v2M15.5 6l-1.4 1.4M4.5 6l1.4 1.4" />
      <path d="M3 15.5h14" />
    </svg>
  );
}
