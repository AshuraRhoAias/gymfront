import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const DashboardHome = () => {
    const [currentMonth, setCurrentMonth] = useState('Mayo');

    return (
        <div className="dashboard-container">
            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="welcome-text">Bienvenido, Admin. Gestiona inscripciones y renovaciones.</p>
                    </div>
                    <div className="month-selector">
                        <span className="calendar-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <select value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)}>
                            <option>Mayo</option>
                            <option>Junio</option>
                            <option>Julio</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="stats-grid">
                {/* Inscripciones */}
                <Link to="/dashboard/inscripciones" className="stat-card">
                    <div className="stat-header">
                        <h3>Inscripciones</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">3</p>
                        <p className="stat-subtitle">en Mayo</p>
                    </div>
                </Link>

                {/* Renovaciones */}
                <Link to="/dashboard/renovaciones" className="stat-card">
                    <div className="stat-header">
                        <h3>Renovaciones</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">3</p>
                        <p className="stat-subtitle">en Mayo</p>
                    </div>
                </Link>

                {/* Inscripciones Bacho */}
                <Link to="/dashboard/inscripciones-bacho" className="stat-card">
                    <div className="stat-header">
                        <h3>Inscripciones Bacho</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">2</p>
                        <p className="stat-subtitle">en Mayo</p>
                    </div>
                </Link>

                {/* Renovaciones Bacho */}
                <Link to="/dashboard/renovaciones-bacho" className="stat-card">
                    <div className="stat-header">
                        <h3>Renovaciones Bacho</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">2</p>
                        <p className="stat-subtitle">en Mayo</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Tabs */}
            <div className="navigation-tabs">
                <Link to="/dashboard/inscripciones" className="tab">Inscripción</Link>
                <Link to="/dashboard/renovaciones" className="tab">Renovación</Link>
                <Link to="/dashboard/inscripciones-bacho" className="tab">Inscripción Bacho</Link>
                <Link to="/dashboard/renovaciones-bacho" className="tab">Renovación Bacho</Link>
                <div className="search-container">
                    <input type="text" placeholder="Buscar por nombre, folio..." className="search-input" />
                </div>
            </div>

            {/* Registration Table */}
            <div className="registration-section">
                <h2 className="section-title">Inscripción</h2>
                <p className="section-subtitle">Listado de registros de inscripción para Mayo</p>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Folio</th>
                            <th>Estatus</th>
                            <th>Forma de Pago</th>
                            <th>Documentos</th>
                            <th>Hora</th>
                            <th>Atendido por</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Juan Pérez</td>
                            <td>INS-001</td>
                            <td><span className="status completed">Completado</span></td>
                            <td>Efectivo</td>
                            <td>
                                <span className="document-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    2 faltantes
                                </span>
                            </td>
                            <td>10:30</td>
                            <td>Admin</td>
                            <td>14/05/2023</td>
                            <td className="actions">
                                <button className="action-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button className="action-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>María López</td>
                            <td>INS-002</td>
                            <td><span className="status pending">Pendiente</span></td>
                            <td>Efectivo</td>
                            <td>
                                <span className="document-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    4 faltantes
                                </span>
                            </td>
                            <td>10:30</td>
                            <td>Admin</td>
                            <td>14/05/2023</td>
                            <td className="actions">
                                <button className="action-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button className="action-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                        <tr>
                            <td>Carlos Rodríguez</td>
                            <td>INS-003</td>
                            <td><span className="status completed">Completado</span></td>
                            <td>Efectivo</td>
                            <td>
                                <span className="document-badge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    4 faltantes
                                </span>
                            </td>
                            <td>10:30</td>
                            <td>Admin</td>
                            <td>14/05/2023</td>
                            <td className="actions">
                                <button className="action-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button className="action-button">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardHome;