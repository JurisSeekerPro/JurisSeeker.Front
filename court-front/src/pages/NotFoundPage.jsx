import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/NotFound.css"; 

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <motion.div
          className="not-found-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="not-found-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
          >
            
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Страница не найдена
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Возможно, страница была перемещена или вы ввели неправильный адрес.
          </motion.p>

          <motion.div
            className="not-found-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link to="/home" className="button button-primary">
               На главную
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="button button-outline"
            >
               Назад
            </button>
          </motion.div>

          <motion.div
            className="not-found-links"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <p>Попробуйте перейти на:</p>
            <div className="quick-links">
              <Link to="/analyze"> Поиск дел</Link>
              <Link to="/login"> Войти</Link>
              <Link to="/register"> Регистрация</Link>
            </div>
          </motion.div>
        </motion.div>

        
      </div>
    </div>
  );
};

export default NotFoundPage;