import {
  IconGrid,
  IconBuilding,
  IconAlertCircle,
  IconUsers,
  IconCreditCard,
  IconMegaphone,
  IconCalendar,
  IconShield,
} from "@/components/ui/icons";

const ALL_ROLES = ["Admin", "Resident", "Guard", "Staff"];

export const NAV_SECTIONS = [
  {
    label: "Main",
    items: [{ label: "Overview", to: "/dashboard", icon: IconGrid, end: true, roles: ALL_ROLES }],
  },
  {
    label: "Management",
    items: [
      { label: "Flats & Residents", icon: IconBuilding, roles: ["Admin"] },
      { label: "Complaints", to: "/complaints", icon: IconAlertCircle, roles: ["Admin", "Resident", "Staff"] },
      { label: "Visitors", icon: IconUsers, roles: ["Admin", "Resident", "Guard"] },
      { label: "Billing", icon: IconCreditCard, roles: ["Admin", "Resident"] },
      { label: "Notices", icon: IconMegaphone, roles: ALL_ROLES },
      { label: "Amenities", icon: IconCalendar, roles: ["Admin", "Resident"] },
      { label: "Emergency", icon: IconShield, roles: ALL_ROLES },
    ],
  },
];
