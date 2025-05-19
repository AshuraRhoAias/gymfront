import React, { useState, useEffect } from 'react';

const CajaHistorial = () => {
    // Estados para almacenar los datos
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);

    // Estado para las estadísticas
    const [stats, setStats] = useState({
        totalEntradas: 0,
        totalSalidas: 0,
        balance: 0,
        cantidadMovimientos: 0
    });

    // Cargar token y usuario desde localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);

    // Cargar los datos cuando el componente se monte
    useEffect(() => {
        if (!token) return;
        fetchMovimientos();
    }, [token]);

    // Función para cargar los movimientos desde la API
    const fetchMovimientos = async () => {
        setLoading(true);
        setError(null);

        try {
            const requestBody = {
                incluir_estadisticas: true,
                orden: 'desc',
                ordenar_por: 'created_at'
            };

            const response = await fetch('http://localhost:5000/api/caja/consultar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Verificar que la respuesta tenga la estructura esperada
            if (data.movimientos) {
                setMovimientos(data.movimientos);

                // Actualizar las estadísticas si están incluidas en la respuesta
                if (data.estadisticas) {
                    setStats({
                        totalEntradas: data.estadisticas.total_entradas || 0,
                        totalSalidas: data.estadisticas.total_salidas || 0,
                        balance: data.estadisticas.balance || 0,
                        cantidadMovimientos: data.estadisticas.total_movimientos || 0
                    });
                }
            } else {
                setMovimientos([]); // Si no hay 'movimientos' en la respuesta, establecer array vacío
                setError("Formato de respuesta inesperado");
            }

        } catch (err) {
            setError(`No se pudieron cargar los datos: ${err.message}`);
            console.error("Error al cargar los movimientos:", err);
        } finally {
            setLoading(false);
        }
    };

    // Función para formatear fecha y hora
    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            fecha: date.toLocaleDateString('es-MX'),
            hora: date.toLocaleTimeString('es-MX')
        };
    };

    // Función para formatear el monto como moneda
    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);
    };

    return (
        <div className="caja-historial-container">
            <h2>Historial de Movimientos de Caja</h2>

            {/* Panel de estadísticas */}
            <div className="stats-panel">
                <div className="stat-card entrada">
                    <h4>Total Entradas</h4>
                    <p>{formatMonto(stats.totalEntradas)}</p>
                </div>

                <div className="stat-card salida">
                    <h4>Total Salidas</h4>
                    <p>{formatMonto(stats.totalSalidas)}</p>
                </div>

                <div className="stat-card balance">
                    <h4>Balance</h4>
                    <p className={stats.balance >= 0 ? 'positivo' : 'negativo'}>
                        {formatMonto(stats.balance)}
                    </p>
                </div>

                <div className="stat-card movimientos">
                    <h4>Movimientos</h4>
                    <p>{stats.cantidadMovimientos}</p>
                </div>
            </div>

            {/* Botón de actualizar */}
            <div className="actualizar-container">
                <button
                    className="btn-actualizar"
                    onClick={fetchMovimientos}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                    </svg>
                    Actualizar datos
                </button>
            </div>

            {/* Tabla de movimientos */}
            <div className="tabla-container">
                {loading ? (
                    <div className="loading-message">Cargando datos...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : movimientos.length === 0 ? (
                    <div className="empty-message">No se encontraron movimientos</div>
                ) : (
                    <table className="tabla-movimientos">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Hora</th>
                                <th>Usuario</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                                <th>Concepto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.map((mov) => {
                                const { fecha, hora } = formatDateTime(mov.created_at);
                                return (
                                    <tr key={mov.id} className={mov.tipo}>
                                        <td>{fecha}</td>
                                        <td>{hora}</td>
                                        <td>{mov.usuario}</td>
                                        <td className={`tipo ${mov.tipo}`}>
                                            {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                        </td>
                                        <td className="monto">{formatMonto(mov.monto_total)}</td>
                                        <td className="concepto">{mov.concepto || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <style jsx>{`
                /* CajaHistorial.css */

                .caja-historial-container {
                    padding: 20px;
                    max-width: 1200px;
                    margin: 0 auto;
                    color: #333;
                }

                h2 {
                    color: #2c3e50;
                    margin-bottom: 24px;
                    text-align: center;
                    font-size: 1.8rem;
                }

                h3 {
                    color: #495057;
                    font-size: 1.2rem;
                    margin-bottom: 16px;
                }

                /* Panel de filtros */
                .filtros-panel {
                    background-color: #f8f9fa;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                }

                .filtros-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                    align-items: end;
                }

                .filtro-group {
                    display: flex;
                    flex-direction: column;
                }

                .filtro-group label {
                    margin-bottom: 6px;
                    font-weight: 500;
                    color: #495057;
                    font-size: 0.9rem;
                }

                .filtro-input {
                    padding: 8px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 4px;
                    font-size: 0.9rem;
                    transition: border-color 0.3s;
                }

                .filtro-input:focus {
                    border-color: #80bdff;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
                }

                .btn-limpiar,
                .btn-actualizar {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .btn-limpiar {
                    background-color: #6c757d;
                    color: white;
                }

                .btn-limpiar:hover {
                    background-color: #5a6268;
                }

                .btn-actualizar {
                    background-color: #007bff;
                    color: white;
                }

                .btn-actualizar:hover {
                    background-color: #0069d9;
                }

                /* Panel de estadísticas */
                .stats-panel {
                    display: none;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                    
                }

                .stat-card {
                    background-color: white;
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    transition: transform 0.3s;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                }

                .stat-card h4 {
                    font-size: 1rem;
                    margin-bottom: 8px;
                    color: #495057;
                }

                .stat-card p {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                }

                .stat-card.entrada {
                    border-top: 4px solid #28a745;
                }

                .stat-card.salida {
                    border-top: 4px solid #dc3545;
                }

                .stat-card.balance {
                    border-top: 4px solid #007bff;
                }

                .stat-card.movimientos {
                    border-top: 4px solid #6610f2;
                }

                p.positivo {
                    color: #28a745;
                }

                p.negativo {
                    color: #dc3545;
                }

                /* Tabla de movimientos */
                .tabla-container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    margin-bottom: 24px;
                }

                .tabla-movimientos {
                    width: 100%;
                    border-collapse: collapse;
                }

                .tabla-movimientos th,
                .tabla-movimientos td {
                    padding: 12px 16px;
                    text-align: left;
                }

                .tabla-movimientos th {
                    background-color: #f8f9fa;
                    font-weight: 600;
                    color: #495057;
                    border-bottom: 2px solid #dee2e6;
                }

                .tabla-movimientos tr {
                    border-bottom: 1px solid #e9ecef;
                }

                .tabla-movimientos tr:last-child {
                    border-bottom: none;
                }

                .tabla-movimientos tr:hover {
                    background-color: #f8f9fa;
                }

                td.tipo {
                    font-weight: 600;
                }

                td.tipo.entrada {
                    color: #28a745;
                }

                td.tipo.salida {
                    color: #dc3545;
                }

                td.monto {
                    font-weight: 600;
                    text-align: right;
                }

                td.concepto {
                    max-width: 300px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Mensajes */
                .loading-message,
                .error-message,
                .empty-message {
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-style: italic;
                }

                .error-message {
                    color: #dc3545;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .filtros-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-panel {
                        grid-template-columns: 1fr 1fr;
                    }

                    .tabla-movimientos {
                        display: block;
                        overflow-x: auto;
                    }

                    .tabla-movimientos th,
                    .tabla-movimientos td {
                        padding: 8px;
                    }
                }

                @media (max-width: 480px) {
                    .stats-panel {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default CajaHistorial;