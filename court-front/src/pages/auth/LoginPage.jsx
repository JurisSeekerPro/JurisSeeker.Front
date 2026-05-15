import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../../styles/Auth.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email обязателен для заполнения";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен для заполнения";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Вход выполнен:", formData);
      navigate("/");
    } catch (error) {
      setErrors({ submit: "Ошибка при входе. Проверьте данные и попробуйте снова." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: "demo@juris-seeker.ru",
      password: "demopassword"
    });
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon"></span>
            <span className="auth-logo-text">Juris Seeker</span>
          </div>
          <h1 className="auth-title">С возвращением!</h1>
          <p className="auth-subtitle">
            Войдите в свой аккаунт для доступа к системе
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span className="form-label-required"> Email</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <div className="form-error">
                 {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="form-label-required"> Пароль</span>
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder="Введите ваш пароль"
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? "" : ""}
              </button>
            </div>
            {errors.password && (
              <div className="form-error">
                 {errors.password}
              </div>
            )}
          </div>

          <div className="flex-between">
            <label className="flex-center gap-sm cursor-pointer">
              <input type="checkbox" />
              <span className="text-small">Запомнить меня</span>
            </label>
            <Link to="/forgot-password" className="button-link text-small">
              Забыли пароль?
            </Link>
          </div>

          {errors.submit && (
            <div className="form-error">
               {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Вход...
              </>
            ) : (
              " Войти в систему"
            )}
          </button>
        </form>

        <div className="auth-divider">или</div>

        <div className="social-auth">
          <button className="social-button social-button-google" disabled={isLoading}>
            <span></span>
            Google
          </button>
          <button className="social-button social-button-github" disabled={isLoading}>
            <span></span>
            GitHub
          </button>
        </div>

        <button
          onClick={handleDemoLogin}
          className="social-button"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
           Демо вход
        </button>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Еще нет аккаунта?
            <Link to="/register" className="auth-footer-link">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;