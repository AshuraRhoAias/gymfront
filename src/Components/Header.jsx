import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import '../styles/header.css';

function Header() {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const [showAccount, setShowAccount] = useState(false);
    const [user, setUser] = useState({ username: '', role: '' });
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { path: 'dashboard', label: 'Dashboard' },
        { path: 'inscripciones', label: 'Inscripciones' },
        { path: 'renovaciones', label: 'Renovaciones' },
        { path: 'cuenta', label: 'Registrar Caja' },
        { path: 'caja', label: 'Registros Caja' },
        { path: 'scanner', label: 'Scanner' },
    ];

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1000;
            setIsMobile(mobile);
            if (!mobile) setIsMenuOpen(false);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setShowAccount(false);
    };

    const toggleAccount = () => {
        setShowAccount(!showAccount);
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    return (
        <header className="navbar">
            <div className="navbar-left">
                <span className="logo">
                    <strong>🏋️ Gym</strong>Tech
                </span>
                <nav className="nav-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={`/dashboard/${link.path === 'dashboard' ? '' : link.path}`}
                            className={currentPath === `/dashboard/${link.path}` || (link.path === 'dashboard' && currentPath === '/dashboard') ? 'active' : ''}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="navbar-right">
                {isMobile && (
                    <button className="menu-btn" onClick={toggleMenu}>
                        ☰
                    </button>
                )}
                <button onClick={toggleAccount} className="user-button">
                    👤 Usuario
                </button>
                {showAccount && (
                    <div className="account-panel">
                        <p><strong>MI CUENTA</strong></p>
                        <p>Usuario: {user.username}</p>
                        <p>Rol: {user.role}</p>
                        <button className="logout-button" onClick={handleLogout}>
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>

            {/* Menú móvil */}
            <div className={`overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} />
            <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
                <button className="close-btn" onClick={toggleMenu}>×</button>
                <nav className="mobile-nav-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={`/dashboard/${link.path === 'dashboard' ? '' : link.path}`}
                            className={currentPath === `/dashboard/${link.path}` || (link.path === 'dashboard' && currentPath === '/dashboard') ? 'active' : ''}
                            onClick={toggleMenu}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}

export default Header;