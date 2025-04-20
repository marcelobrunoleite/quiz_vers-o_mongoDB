import React, { useState } from 'react';
import styles from './Login.module.css';

interface LoginProps {
  onClose?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de login
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.loginButton}>
            Entrar
          </button>
          <div className={styles.links}>
            Não tem uma conta? <a href="#cadastro">Cadastre-se</a>
          </div>
        </form>
      </div>
    </div>
  );
}; 