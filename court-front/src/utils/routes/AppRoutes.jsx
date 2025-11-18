// src/utils/routes/AppRoutes.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const HomePage = lazy(() => import("../../pages/home/HomePage"));
const AnalyzePage = lazy(() => import("../../pages/AnalyzePage"));
const CaseDetailPage = lazy(() => import("../../pages/CaseDetailPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/case/:id" element={<CaseDetailPage />} />
        <Route path="*" element={<div>404 — Страница не найдена</div>} />
      </Routes>
    </Suspense>
  );
}