import {
  IconGrid,
  IconBuilding,
  IconAlertCircle,
  IconUsers,
  IconUserPlus,
  IconCreditCard,
  IconMegaphone,
  IconCalendar,
  IconShield,
  IconMap,
  IconUser,
  IconBook,
  IconHistory,
} from "@/components/ui/icons";

const ALL_ROLES = ["Admin", "Resident", "Guard", "Staff"];

export const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { label: "Overview", to: "/dashboard", icon: IconGrid, end: true, roles: ALL_ROLES },
      { label: "My Profile", to: "/profile", icon: IconUser, roles: ALL_ROLES },
      { label: "Sitemap", to: "/sitemap", icon: IconMap, roles: ALL_ROLES },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Users", to: "/users", icon: IconUserPlus, roles: ["Admin"] },
      { label: "Flats & Residents", to: "/flats", icon: IconBuilding, roles: ["Admin"] },
      { label: "Complaints", to: "/complaints", icon: IconAlertCircle, roles: ["Admin", "Resident", "Staff"] },
      { label: "Visitors", to: "/visitors", icon: IconUsers, roles: ["Admin", "Resident", "Guard"] },
      { label: "Billing", to: "/billing", icon: IconCreditCard, roles: ["Admin", "Resident"] },
      { label: "Notices / Polls", to: "/notices", icon: IconMegaphone, roles: ALL_ROLES },
      { label: "Amenities", to: "/amenities", icon: IconCalendar, roles: ["Admin", "Resident"] },
      { label: "Emergency", to: "/emergency", icon: IconShield, roles: ALL_ROLES },
      { label: "Guidelines", to: "/guidelines", icon: IconBook, roles: ALL_ROLES },
      { label: "Audit Log", to: "/audit-logs", icon: IconHistory, roles: ["Admin"] },
    ],
  },
];
