import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

function Login(url) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    console.log(url);
    const handleLogin = async () => {
        try {
            const response = await fetch(`http://${url.url}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });


            if (response.ok) {
                const data = await response.json();

                // Guardar token y datos del usuario
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user)); // <- Aquí guardamos el usuario

                navigate('/dashboard');
            } else {
                const error = await response.json();
                alert(error.message || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error('Error en login:', err);
            alert('Error al conectar con el servidor');
        }
    };

    return (
        <div className="login-container">
            <header className="navbar">
                <div className="logo">💪 GymTech</div>
                <div className="header-buttons">
                    <button className="dark-toggle">🌙</button>
                    <button className="login-btn">Iniciar sesión</button>
                </div>
            </header>

            <main className="login-box">
                <div className="login-form">
                    <div className="icon">💪</div>
                    <h2>Iniciar sesión</h2>
                    <p>Ingresa tus credenciales para acceder al sistema</p>

                    <label>Correo electrónico</label>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <label>Contraseña</label>
                    <input
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button className="submit-btn" onClick={handleLogin}>
                        Iniciar sesión
                    </button>
                </div>
            </main>

            <footer className="footer">
                <span>© 2025 GymTech. Todos los derechos reservados.</span>
                <div className="footer-circle">N</div>
            </footer>
        </div>
    );
}

export default Login;
