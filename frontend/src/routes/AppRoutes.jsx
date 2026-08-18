import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import RequireAuth from "@/routes/RequireAuth";
import HomePage from "@/pages/HomePage";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Complaints from "@/pages/Complaints";
import Users from "@/pages/Users";
import Flats from "@/pages/Flats";
import Visitors from "@/pages/Visitors";
import Billing from "@/pages/Billing";
import Notices from "@/pages/Notices";
import Amenities from "@/pages/Amenities";
import Emergency from "@/pages/Emergency";
import Guidelines from "@/pages/Guidelines";
import AuditLog from "@/pages/AuditLog";
import Profile from "@/pages/Profile";
import Sitemap from "@/pages/Sitemap";
import NotFound from "@/pages/NotFound";
import { ROUTES } from "@/constants";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.COMPLAINTS} element={<Complaints />} />
          <Route path={ROUTES.USERS} element={<Users />} />
          <Route path={ROUTES.FLATS} element={<Flats />} />
          <Route path={ROUTES.VISITORS} element={<Visitors />} />
          <Route path={ROUTES.BILLING} element={<Billing />} />
          <Route path={ROUTES.NOTICES} element={<Notices />} />
          <Route path={ROUTES.AMENITIES} element={<Amenities />} />
          <Route path={ROUTES.EMERGENCY} element={<Emergency />} />
          <Route path={ROUTES.GUIDELINES} element={<Guidelines />} />
          <Route path={ROUTES.AUDIT_LOGS} element={<AuditLog />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.SITEMAP} element={<Sitemap />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
