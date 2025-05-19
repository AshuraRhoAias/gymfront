import React, { useState, useEffect, useCallback, useMemo } from 'react';

const Renovaciones = () => {
    const [, setUser] = useState(null); // <- Estado para usuario inicializado como null
    const [selectedMes, setSelectedMes] = useState('Mayo');
    const [prevMonth, setPrevMonth] = useState('Abril');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [, setSelectedResult] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);


    const [formData, setFormData] = useState({
        atendidoPor: '', // <- inicializamos con valor vacío
        nombre: '',
        folioPrevio: '',
        folioMensual: '',
        formaPago: 'Efectivo',
        otraFormaPago: '',
        estatus: 'Pendiente',
        fechaHoraIngreso: '',
        total: 0,
        horario: '',
        telefono: '',
        comentarios: '',
        es_bacho: false // Valor para checkbox (false = no marcado, true = marcado)
    });

    // Cargar usuario desde localStorage al inicio y actualizar formData
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setFormData(prev => ({
                ...prev,
                atendidoPor: storedUser.nombre || storedUser.username || ''
            }));
        }
    }, []);

    // Array de meses con useMemo para evitar recreaciones en cada render
    const meses = useMemo(() => ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'], []);

    const getAnteriorMes = useCallback((mes) => {
        const index = meses.indexOf(mes);
        return index <= 0 ? 'Diciembre' : meses[index - 1];
    }, [meses]);

    const getSiguienteMes = useCallback((mes) => {
        const index = meses.indexOf(mes);
        return index >= meses.length - 1 ? 'Enero' : meses[index + 1];
    }, [meses]);

    useEffect(() => {
        setPrevMonth(getAnteriorMes(selectedMes));
    }, [selectedMes, getAnteriorMes]);

    // Función que realiza la búsqueda en la API
    const searchUser = useCallback(async (isAutocomplete = false) => {
        if (!searchTerm.trim() || searchTerm.trim().length < 2) return;

        setIsSearching(true);

        try {
            // Enviar el mismo término de búsqueda para los tres criterios
            // para que la API busque en todos los campos
            const searchData = {
                nombre: searchTerm,
                folio: searchTerm,
                telefono: searchTerm
            };

            // Obtener el token de autenticación
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No hay token de autenticación disponible');
            }

            const response = await fetch('http://localhost:5000/api/buscar-ultimo-registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(searchData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación no válido o expirado');
                }
                throw new Error('Error en la búsqueda');
            }

            const data = await response.json();

            if (data && data.registro) {
                if (isAutocomplete) {
                    // Si es autocompletado, mostrar los resultados
                    setSearchResults([data.registro]);
                } else {
                    // Si es búsqueda directa, actualizar el formulario
                    setFormData({
                        ...formData,
                        nombre: data.registro.nombre || '',
                        folioPrevio: data.registro.folio || '',
                        horario: data.registro.horario || '',
                        telefono: data.registro.telefono || data.registro.numero_telefonico || ''
                    });

                    // Si viene un mes en la respuesta, seleccionar el mes siguiente
                    if (data.registro.mes) {
                        const mesSiguiente = getSiguienteMes(data.registro.mes);
                        setSelectedMes(mesSiguiente);
                    }

                    // Limpiar resultados de búsqueda
                    setSearchResults([]);
                }
            } else if (!isAutocomplete) {
                alert("No se encontraron registros con esos datos.");
            }
        } catch (error) {
            console.error("Error al buscar usuario:", error);
            if (!isAutocomplete) {
                alert(error.message || "Error al buscar usuario. Intente nuevamente.");
            }
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm, formData, getSiguienteMes]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim().length >= 2) {
                searchUser(true);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchUser]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Manejar checkbox de manera especial (es_bacho)
        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: checked
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        if (name === 'mes') {
            setSelectedMes(value);
        }

        if (name === 'atendidoPor') return;
    };

    // Manejar cambios en el campo de búsqueda
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Seleccionar un resultado de la búsqueda
    const handleSelectResult = (result) => {
        setSelectedResult(result);

        // Actualizar el formulario con los datos del resultado seleccionado
        setFormData({
            ...formData,
            nombre: result.nombre || '',
            folioPrevio: result.folio || '',
            horario: result.horario || '',
            telefono: result.telefono || result.numero_telefonico || ''
        });

        // Si viene un mes en el resultado, seleccionar el mes siguiente
        if (result.mes) {
            // Seleccionar el mes siguiente al que viene en el resultado
            const mesSiguiente = getSiguienteMes(result.mes);
            setSelectedMes(mesSiguiente);
        }

        // Limpiar los resultados de búsqueda
        setSearchResults([]);
        setSearchTerm('');
    };

    // Nueva función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Resetear estados de error y éxito
        setSaveError('');
        setSaveSuccess(false);
        setIsSaving(true);

        try {
            // Obtener token de autenticación
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No hay token de autenticación disponible');
            }

            // Mapear formData al formato requerido por la API
            const apiData = {
                nombre: formData.nombre,
                folio: formData.folioMensual,
                mes: selectedMes,
                estatus: formData.estatus,
                forma_pago: formData.formaPago,
                especificar: formData.formaPago === 'Otras' ? formData.otraFormaPago : '',
                monto: parseFloat(formData.total) || 0,
                horario: formData.horario,
                atendido_por: formData.atendidoPor,
                fecha_ingreso: formData.fechaHoraIngreso,
                telefono: formData.telefono,
                es_bacho: formData.es_bacho,
                comentarios: formData.comentarios
            };

            console.log(apiData);

            // Enviar datos a la API
            const response = await fetch('http://localhost:5000/api/renovaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Token de autenticación no válido o expirado');
                }

                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar la renovación');
            }

            const data = await response.json();

            // Mostrar mensaje de éxito
            setSaveSuccess(true);
            alert('Renovación guardada exitosamente');

            // Opcional: Limpiar formulario o redirigir a otra página
            setFormData({
                atendidoPor: formData.atendidoPor, // Mantener el usuario actual
                nombre: '',
                folioPrevio: '',
                folioMensual: '',
                formaPago: 'Efectivo',
                otraFormaPago: '',
                estatus: 'Pendiente',
                fechaHoraIngreso: '',
                total: 0,
                horario: '',
                telefono: '',
                comentarios: '',
                es_bacho: false
            });

        } catch (error) {
            console.error("Error al guardar renovación:", error);
            setSaveError(error.message || "Error al guardar la renovación. Intente nuevamente.");
            alert(error.message || "Error al guardar la renovación. Intente nuevamente.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="DASH renovaciones-container">

            <div className="form-container">
                <div className="form-header">
                    <h3>Nueva Renovación</h3>
                    <p>Busque al usuario por nombre, folio o número telefónico para completar automáticamente los datos.</p>
                </div>

                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, folio o teléfono..."
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    {isSearching && (
                        <div className="search-loading">Buscando...</div>
                    )}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="search-result-item"
                                    onClick={() => handleSelectResult(result)}
                                >
                                    <div className="result-name">{result.nombre || 'Sin nombre'}</div>
                                    <div className="result-details">
                                        <span className="result-folio">Folio: {result.folio || 'N/A'}</span>
                                        <span className="result-telefono">Tel: {result.telefono || result.numero_telefonico || 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="form-content">
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="atendidoPor">Atendido por</label>
                            <input
                                type="text"
                                id="atendidoPor"
                                name="atendidoPor"
                                value={formData.atendidoPor}
                                readOnly
                                disabled
                                className="input-disabled"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="folioPrevio">Folio {prevMonth}</label>
                            <input
                                type="text"
                                id="folioPrevio"
                                name="folioPrevio"
                                value={formData.folioPrevio}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="folioMensual">Folio {selectedMes}</label>
                            <input
                                type="text"
                                id="folioMensual"
                                name="folioMensual"
                                value={formData.folioMensual}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mes">Mes</label>
                            <div className="select-wrapper">
                                <select id="mes" name="mes" value={selectedMes} onChange={handleInputChange}>
                                    <option value="Mayo">Mayo</option>
                                    <option value="Junio">Junio</option>
                                    <option value="Julio">Julio</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="formaPago">Forma de Pago</label>
                            <div className="select-wrapper">
                                <select id="formaPago" name="formaPago" value={formData.formaPago} onChange={handleInputChange}>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Otras">Otras</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                            {formData.formaPago === 'Otras' && (
                                <div className="other-payment-input">
                                    <input
                                        type="text"
                                        id="otraFormaPago"
                                        name="otraFormaPago"
                                        placeholder="Especificar forma de pago..."
                                        value={formData.otraFormaPago}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="total">Total</label>
                            <div className="currency-input">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    id="total"
                                    name="total"
                                    value={formData.total}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="estatus">Estatus</label>
                            <div className="select-wrapper">
                                <select id="estatus" name="estatus" value={formData.estatus} onChange={handleInputChange}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Completado">Completado</option>
                                    <option value="Cancelado">Cancelado</option>
                                    <option value="Entregado">Entregado</option>
                                    <option value="Tramitar hoja">Tramitar hoja</option>
                                    <option value="Faltan doc.">Faltan doc.</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="horario">Horario</label>
                            <input
                                type="text"
                                id="horario"
                                name="horario"
                                value={formData.horario}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="fechaHoraIngreso">Fecha y Hora de Ingreso</label>
                            <div className="datetime-input-wrapper">
                                <input
                                    type="datetime-local"
                                    id="fechaHoraIngreso"
                                    name="fechaHoraIngreso"
                                    value={formData.fechaHoraIngreso}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="telefono">Número Telefónico</label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    id="es_bacho"
                                    name="es_bacho"
                                    checked={formData.es_bacho}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="es_bacho" className="checkbox-label">Bachillerato</label>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="comentarios">Comentarios</label>
                            <textarea
                                id="comentarios"
                                name="comentarios"
                                value={formData.comentarios}
                                onChange={handleInputChange}
                                rows="4"
                            ></textarea>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar renovación'}
                        </button>
                    </div>

                    {saveError && (
                        <div className="error-message">
                            {saveError}
                        </div>
                    )}

                    {saveSuccess && (
                        <div className="success-message">
                            Renovación guardada exitosamente.
                        </div>
                    )}
                </form>
            </div>
            <style jsx>{`
        .renovaciones-container {
          font-family: Arial, sans-serif;
          background-color: #000;
          color: #fff;
          min-height: 100vh;
          padding: 20px;
        }

        .DASH {
            margin-top: 70px;
        }

        .form-container {
          background-color: #121212;
          border-radius: 8px;
          overflow: hidden;
        }

        .form-header {
          padding: 15px 20px;
          border-bottom: 1px solid #333;
        }

        .form-header h3 {
          margin: 0;
          color: #fff;
          font-size: 18px;
        }

        .form-header p {
          margin: 5px 0 0;
          color: #666;
          font-size: 12px;
        }

        .search-bar {
          position: relative;
          padding: 10px 20px;
        }

        .search-icon {
          position: absolute;
          left: 30px;
          top: 20px;
          color: #666;
        }

        .search-input {
          width: 100%;
          padding: 10px 10px 10px 30px;
          border-radius: 4px;
          border: none;
          background-color: #222;
          color: #fff;
          font-size: 14px;
        }
        
        .search-loading {
          position: absolute;
          right: 30px;
          top: 20px;
          color: #aaa;
          font-size: 12px;
        }
        
        .search-results {
          position: absolute;
          top: 100%;
          left: 20px;
          right: 20px;
          background-color: #333;
          border-radius: 4px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          z-index: 10;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .search-result-item {
          padding: 12px 15px;
          border-bottom: 1px solid #444;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .search-result-item:last-child {
          border-bottom: none;
        }
        
        .search-result-item:hover {
          background-color: #444;
        }
        
        .result-name {
          font-weight: bold;
          margin-bottom: 5px;
          color: #fff;
        }
        
        .result-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #aaa;
        }
        
        .result-folio, .result-telefono {
          font-size: 11px;
        }

        .form-content {
          padding: 20px;
        }

        .form-row {
          display: flex;
          margin-bottom: 15px;
          gap: 20px;
        }

        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .full-width {
          width: 100%;
        }

        label {
          font-size: 14px;
          margin-bottom: 5px;
          color: #aaa;
        }

        input, select, textarea {
          padding: 10px;
          border-radius: 4px;
          border: none;
          background-color: #222;
          color: #fff;
          font-size: 14px;
        }

        textarea {
          resize: vertical;
          min-height: 80px;
        }

        .select-wrapper {
          position: relative;
        }

        select {
          appearance: none;
          width: 100%;
        }

        .select-wrapper select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 184, 212, 0.5);
        }

        /* Estilo para el dropdown abierto */
        .select-wrapper select option {
          background-color: #333;
          color: white;
          padding: 10px;
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          top: 10px;
          color: #666;
          pointer-events: none;
          font-size: 12px;
        }

        .other-payment-input {
          margin-top: 10px;
          animation: fadeIn 0.3s ease;
        }

        .other-payment-input input {
          width: 100%;
          border: 1px solid #333;
          background-color: #1a1a1a;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .currency-input {
          position: relative;
        }

        .currency-symbol {
          position: absolute;
          left: 10px;
          top: 10px;
          color: #666;
        }

        .currency-input input {
          padding-left: 20px;
        }

        .datetime-input-wrapper {
          position: relative;
        }

        .datetime-input-wrapper input {
          width: 100%;
          padding-right: 40px; /* Espacio para el icono */
        }

        /* Estilos para el input de datetime-local */
        input[type="datetime-local"] {
          color: #fff;
          background-color: #222;
          border: none;
          padding: 10px;
        }

        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8); /* Hace el icono del calendario más claro */
          opacity: 0.6;
        }

        .input-disabled {
            background-color: #1a1a1a;
            color: #888;
            cursor: not-allowed;
        }

        .checkbox-container {
            display: flex;
            align-items: center;
            margin: 10px 0;
        }

        .checkbox-container input[type="checkbox"] {
            margin-right: 10px;
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: #00B8D4;
        }

        .checkbox-label {
            color: #fff;
            cursor: pointer;
            user-select: none;
            font-size: 14px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .submit-button {
          background-color: #00B8D4;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .submit-button:hover {
          background-color: #00A5C0;
        }

        /* Media Queries para responsividad */
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
        </div>
    );
};

export default Renovaciones;