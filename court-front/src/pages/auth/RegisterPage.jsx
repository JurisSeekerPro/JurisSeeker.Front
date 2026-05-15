import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../../styles/Auth.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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

    if (!formData.fullName.trim()) {
      newErrors.fullName = "ФИО обязательно для заполнения";
    }

    if (!formData.email) {
      newErrors.email = "Email обязателен для заполнения";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен для заполнения";
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Пароль должен содержать буквы в верхнем и нижнем регистре и цифры";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Подтверждение пароля обязательно";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "Необходимо согласие с условиями";
    }

    return newErrors;
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: "", width: "0%" };
    if (password.length < 4) return { strength: "weak", width: "33%" };
    if (password.length < 8) return { strength: "medium", width: "66%" };
    return { strength: "strong", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log("Регистрация:", formData);
      navigate("/login?registered=true");
    } catch (error) {
      setErrors({ submit: "Ошибка при регистрации. Попробуйте снова." });
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="auth-title">Создать аккаунт</h1>
          <p className="auth-subtitle">
            Присоединяйтесь к системе анализа судебной практики
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">
              <span className="form-label-required"> ФИО</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
              placeholder="Иванов Иван Иванович"
              disabled={isLoading}
            />
            {errors.fullName && (
              <div className="form-error">
                 {errors.fullName}
              </div>
            )}
          </div>

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
                placeholder="Придумайте надежный пароль"
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
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill strength-${passwordStrength.strength}`} 
                       style={{ width: passwordStrength.width }}></div>
                </div>
                <div className="strength-text">
                  Надежность пароля: {
                    passwordStrength.strength === "weak" ? "Слабый" :
                    passwordStrength.strength === "medium" ? "Средний" :
                    passwordStrength.strength === "strong" ? "Сильный" : ""
                  }
                </div>
              </div>
            )}
            {errors.password && (
              <div className="form-error">
                 {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <span className="form-label-required"> Подтверждение пароля</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
              placeholder="Повторите пароль"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <div className="form-error">
                 {errors.confirmPassword}
              </div>
            )}
          </div>

          <div className="terms-checkbox">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={isLoading}
            />
            <label htmlFor="agreeToTerms" className="terms-text">
              Я соглашаюсь с{" "}
              <a href="/terms" className="terms-link">условиями использования</a>{" "}
              и{" "}
              <a href="/privacy" className="terms-link">политикой конфиденциальности</a>
            </label>
          </div>
          {errors.agreeToTerms && (
            <div className="form-error">
               {errors.agreeToTerms}
            </div>
          )}

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
                Регистрация...
              </>
            ) : (
              " Создать аккаунт"
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

        <div className="auth-footer">
          <p className="auth-footer-text">
            Уже есть аккаунт?
            <Link to="/login" className="auth-footer-link">
              Войти
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;