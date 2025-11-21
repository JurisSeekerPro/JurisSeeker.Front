// src/utils/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Ленивая загрузка страниц
const HomePage = lazy(() => import("../../pages/home/HomePage"));
const AnalyzePage = lazy(() => import("../../pages/AnalyzePage"));
const CaseDetailPage = lazy(() => import("../../pages/CaseDetailPage"));
const LoginPage = lazy(() => import("../../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../../pages/auth/RegisterPage"));
const NotFoundPage = lazy(() => import("../../pages/NotFoundPage"));

// Компонент для загрузки
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-spinner"></div>
    <p>Загрузка...</p>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/case/:id" element={<CaseDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}