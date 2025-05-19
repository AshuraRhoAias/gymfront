import React, { useState, useEffect } from 'react';
import '../../styles/Cuenta.css'; // Importamos los estilos CSS

const Cuenta = () => {
    // Estados para el formulario
    const [user, setUser] = useState(null);
    const [montoTotal, setMontoTotal] = useState('');
    const [tipo, setTipo] = useState('entrada');
    const [concepto, setConcepto] = useState('');
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [token, setToken] = useState('');

    // Cargar usuario desde localStorage (según requerimiento)
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }

        // También cargar el token para la autenticación
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
    }, []);

    // Actualizar la fecha y hora cada segundo
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(timerId);
    }, []);

    // Formatear fecha y hora para mostrar
    const formattedDate = currentDateTime.toLocaleDateString('es-MX');
    const formattedTime = currentDateTime.toLocaleTimeString('es-MX');

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar campos obligatorios
        if (!user || !montoTotal || !tipo) {
            setMessage({ text: 'Todos los campos obligatorios deben estar completos', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await fetch('http://localhost:5000/api/caja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    usuario: user.username,
                    monto_total: parseFloat(montoTotal),
                    tipo,
                    concepto
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ text: 'Movimiento registrado correctamente', type: 'success' });
                // Resetear el formulario
                setMontoTotal('');
                setTipo('entrada');
                setConcepto('');
            } else {
                setMessage({ text: `Error: ${data.message || 'No se pudo registrar el movimiento'}`, type: 'error' });
            }
        } catch (error) {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="caja-form-container">
            <h2>Registro de Movimiento en Caja</h2>

            <div className="datetime-display">
                <div className="datetime-field">
                    <label>Fecha:</label>
                    <span>{formattedDate}</span>
                </div>
                <div className="datetime-field">
                    <label>Hora:</label>
                    <span>{formattedTime}</span>
                </div>
            </div>

            <form className="caja-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="usuario">Usuario:</label>
                    <input
                        type="text"
                        id="usuario"
                        value={user?.username || ''}
                        disabled
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="monto">Monto Total ($):</label>
                    <input
                        type="number"
                        id="monto"
                        value={montoTotal}
                        onChange={(e) => setMontoTotal(e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        className="form-input"
                    />
                </div>

                <div className="form-group">
                    <label>Tipo de Movimiento:</label>
                    <div className="radio-group">
                        <label className={`radio-label ${tipo === 'entrada' ? 'entrada-selected' : ''}`}>
                            <input
                                type="radio"
                                name="tipo"
                                value="entrada"
                                checked={tipo === 'entrada'}
                                onChange={() => setTipo('entrada')}
                            />
                            Entrada
                        </label>
                        <label className={`radio-label ${tipo === 'salida' ? 'salida-selected' : ''}`}>
                            <input
                                type="radio"
                                name="tipo"
                                value="salida"
                                checked={tipo === 'salida'}
                                onChange={() => setTipo('salida')}
                            />
                            Salida
                        </label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="concepto">Concepto (opcional):</label>
                    <textarea
                        id="concepto"
                        value={concepto}
                        onChange={(e) => setConcepto(e.target.value)}
                        placeholder="Detalle del movimiento..."
                        className="form-textarea"
                        rows="3"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className={`submit-button ${tipo === 'entrada' ? 'entrada-style' : 'salida-style'}`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrar Movimiento'}
                    </button>
                </div>
            </form>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default Cuenta;