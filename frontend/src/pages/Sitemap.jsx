import { NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  IconGrid,
  IconAlertCircle,
  IconUserPlus,
  IconBuilding,
  IconUsers,
  IconCreditCard,
  IconMegaphone,
  IconCalendar,
  IconShield,
  IconUser,
  IconBook,
  IconHistory,
} from "@/components/ui/icons";

const ALL_ROLES = ["Admin", "Resident", "Guard", "Staff"];

const SITE_MAP = [
  { label: "Overview / Dashboard", to: "/dashboard", icon: IconGrid, roles: ALL_ROLES, desc: "Role-adaptive summary of complaints, visitors, billing, and alerts." },
  { label: "Users", to: "/users", icon: IconUserPlus, roles: ["Admin"], desc: "Manage resident, guard, and staff accounts." },
  { label: "Flats & Occupancy", to: "/flats", icon: IconBuilding, roles: ["Admin"], desc: "Create units and assign owners/tenants." },
  { label: "Complaints", to: "/complaints", icon: IconAlertCircle, roles: ["Admin", "Resident", "Staff"], desc: "Raise, assign, and resolve maintenance tickets." },
  { label: "Visitors", to: "/visitors", icon: IconUsers, roles: ["Admin", "Resident", "Guard"], desc: "Generate QR passes, scan gate entries, log walk-ins." },
  { label: "Billing", to: "/billing", icon: IconCreditCard, roles: ["Admin", "Resident"], desc: "Monthly invoicing, penalties, and simulated payments." },
  { label: "Notices", to: "/notices", icon: IconMegaphone, roles: ALL_ROLES, desc: "Announcements and community polls." },
  { label: "Amenities", to: "/amenities", icon: IconCalendar, roles: ["Admin", "Resident"], desc: "Book and manage shared facilities." },
  { label: "Emergency", to: "/emergency", icon: IconShield, roles: ALL_ROLES, desc: "Trigger SOS alerts and browse the emergency contact directory." },
  { label: "Guidelines", to: "/guidelines", icon: IconBook, roles: ALL_ROLES, desc: "Society rules and best practices published by admin." },
  { label: "Audit Log", to: "/audit-logs", icon: IconHistory, roles: ["Admin"], desc: "Trail of security-sensitive actions across the society." },
  { label: "My Profile", to: "/profile", icon: IconUser, roles: ALL_ROLES, desc: "Manage personal details, family members, vehicles, and emergency contacts." },
];

export default function Sitemap() {
  const { role } = useAuth();
  const visible = SITE_MAP.filter((item) => item.roles.includes(role));

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Navigation</p>
        <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Sitemap</h1>
        <p className="mt-1.5 text-[15px] text-ink-faint">Every page available to your role ({role}) in SmartSociety</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group flex flex-col rounded-xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-transparent hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink/[0.06] text-ink-dim transition group-hover:scale-105">
              <item.icon className="h-[18px] w-[18px]" />
            </span>
            <h3 className="mt-3.5 text-base font-semibold text-ink">{item.label}</h3>
            <p className="mt-1 text-sm text-ink-faint">{item.desc}</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
