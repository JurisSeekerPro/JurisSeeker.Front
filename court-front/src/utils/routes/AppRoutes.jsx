import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const HomePage = lazy(() => import("../../pages/home/HomePage"));
const Navigation = lazy(() => import("../../components/Navigation"));
const AnaliticsPage = lazy(() => import("../../pages/AnaliticsPage"));
const CaseDetailPage = lazy(() => import("../../pages/CaseDetailPage"));
const LoginPage = lazy(() => import("../../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../../pages/auth/RegisterPage"));
const NotFoundPage = lazy(() => import("../../pages/NotFoundPage"));

const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <p>Загрузка...</p>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Navigation />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/case/:id" element={<CaseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/analitics" element={<AnaliticsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}