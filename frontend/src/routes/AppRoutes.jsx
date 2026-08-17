import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import RequireAuth from "@/routes/RequireAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Complaints from "@/pages/Complaints";
import NotFound from "@/pages/NotFound";
import { ROUTES } from "@/constants";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.COMPLAINTS} element={<Complaints />} />
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
