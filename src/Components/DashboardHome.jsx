import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import DetallesModal from './Utils/DetallesModal';
import EditarModal from './Utils/EditarModal';

// Datos de ejemplo para documentos faltantes
const missingDocsData = {
    'INS-001': ['Acta de nacimiento', 'Comprobante de domicilio'],
    'INS-002': ['Acta de nacimiento', 'CURP', 'Certificado médico', 'Fotografías'],
    'INS-003': ['CURP', 'Certificado médico', 'Comprobante de pago', 'Fotografías'],
    'REN-001': ['Certificado médico', 'Comprobante de pago'],
    'REN-002': ['Comprobante de pago', 'Fotografías'],
    'REN-003': ['CURP', 'Certificado médico', 'Fotografías'],
    'INS-B-001': ['Acta de nacimiento', 'Certificado de secundaria'],
    'INS-B-002': ['CURP', 'Certificado de secundaria', 'Comprobante de domicilio'],
    'REN-B-001': ['Comprobante de pago', 'Fotografías'],
    'REN-B-002': ['Certificado médico', 'Comprobante de pago']
};



const DashboardHome = () => {
    const [currentMonth, setCurrentMonth] = useState('Mayo');
    const [currentYear, setCurrentYear] = useState(2025);
    const [activeTab, setActiveTab] = useState('inscripciones');
    const [hoveredDoc, setHoveredDoc] = useState(null);
    const [contadores, setContadores] = useState({
        inscripciones_normales: 0,
        inscripciones_bacho: 0
    });
    const [token, setToken] = useState('');
    // 1. Modificar el estado para almacenar los datos de inscripciones
    const [inscripciones, setInscripciones] = useState([]);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedInscripcion, setSelectedInscripcion] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInscripcionToEdit, setSelectedInscripcionToEdit] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            console.log('Token JWT cargado:', storedToken);
        }
    }, []);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        }
    }, []);


    useEffect(() => {
        // No hacer la petición si el token no está disponible
        if (!token) return;

        const fetchData = async () => {
            try {
                // Petición para obtener contadores
                const contadoresResponse = await fetch('http://localhost:5000/api/inscripciones/contador', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        año: currentYear,
                        mes: currentMonth
                    })
                });

                // Petición para obtener documentos faltantes
                const inscripcionesResponse = await fetch('http://localhost:5000/api/inscripciones/documentos-faltantes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        año: currentYear,
                        mes: currentMonth
                    })
                });

                if (contadoresResponse.ok) {
                    const contadoresData = await contadoresResponse.json();
                    console.log('Respuesta de la API de contadores:', contadoresData);
                    setContadores(contadoresData);
                } else {
                    console.error('Error al obtener contadores:', contadoresResponse.status);
                    const errorText = await contadoresResponse.text();
                    console.error('Detalle del error:', errorText);
                }

                if (inscripcionesResponse.ok) {
                    const inscripcionesData = await inscripcionesResponse.json();
                    console.log('Respuesta de la API de inscripciones:', inscripcionesData);
                    setInscripciones(inscripcionesData.inscripciones || []);
                } else {
                    console.error('Error al obtener inscripciones:', inscripcionesResponse.status);
                    const errorText = await inscripcionesResponse.text();
                    console.error('Detalle del error:', errorText);
                }
            } catch (error) {
                console.error('Error en la petición:', error);
            }
        };

        fetchData();
    }, [currentMonth, currentYear, token]); // Asegúrate de incluir token como dependencia


    // Componentes de tabla según el tipo
    const renderTable = () => {
        // Obtener el rol del usuario (o 'viewer' por defecto)
        const userRole = user?.role || 'viewer';

        // Determinar qué datos usar: resultados de búsqueda o todos los datos
        const displayData = searchTerm.trim() !== '' ? searchResults : inscripciones;

        switch (activeTab) {
            case 'inscripciones':
                return <InscripcionesTable
                    currentMonth={currentMonth}
                    hoveredDoc={hoveredDoc}
                    setHoveredDoc={setHoveredDoc}
                    inscripciones={displayData.filter(insc => !insc.es_bacho)}
                    userRole={userRole}
                    onShowDetails={handleShowDetails}
                    onEditInscripcion={handleEditInscripcion}
                />;
            case 'renovaciones':
                return <RenovacionesTable
                    currentMonth={currentMonth}
                    hoveredDoc={hoveredDoc}
                    setHoveredDoc={setHoveredDoc}
                    inscripciones={displayData}
                    userRole={userRole}
                    onEditInscripcion={handleEditInscripcion}
                />;
            case 'inscripciones-bacho':
                return <InscripcionesBachoTable
                    currentMonth={currentMonth}
                    hoveredDoc={hoveredDoc}
                    setHoveredDoc={setHoveredDoc}
                    inscripciones={displayData.filter(insc => insc.es_bacho)}
                    userRole={userRole}
                    onShowDetails={handleShowDetails}
                    onEditInscripcion={handleEditInscripcion}
                />;
            case 'renovaciones-bacho':
                return <RenovacionesBachoTable
                    currentMonth={currentMonth}
                    hoveredDoc={hoveredDoc}
                    setHoveredDoc={setHoveredDoc}
                    inscripciones={displayData}
                    userRole={userRole}
                    onEditInscripcion={handleEditInscripcion}
                />;
            default:
                return <InscripcionesTable
                    currentMonth={currentMonth}
                    hoveredDoc={hoveredDoc}
                    setHoveredDoc={setHoveredDoc}
                    inscripciones={displayData.filter(insc => !insc.es_bacho)}
                    userRole={userRole}
                    onShowDetails={handleShowDetails}
                    onEditInscripcion={handleEditInscripcion}
                />;
        }
    };

    // Manejador para cambiar de tab sin afectar la navegación
    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Función para manejar la búsqueda
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim() === '') {
            setSearchResults([]);
            return;
        }

        // Buscar en todas las inscripciones
        const results = inscripciones.filter(insc =>
            insc.nombre.toLowerCase().includes(term.toLowerCase()) ||
            (insc.folio && insc.folio.toLowerCase().includes(term.toLowerCase()))
        );

        setSearchResults(results);

        // Si hay resultados, cambiar automáticamente a la sección correspondiente
        if (results.length > 0) {
            // Verificar si el primer resultado es de bachillerato o normal
            const firstResult = results[0];
            setActiveTab(firstResult.es_bacho ? 'inscripciones-bacho' : 'inscripciones');
        }
    };

    // Función para abrir el modal con los detalles de una inscripción
    const handleShowDetails = (inscripcion) => {
        setSelectedInscripcion(inscripcion);
        setIsModalOpen(true);
    };

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedInscripcion(null);
    };

    // Función para cerrar el modal de edición
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedInscripcionToEdit(null);
    };

    // Función para abrir el modal de edición
    const handleEditInscripcion = (inscripcion) => {
        setSelectedInscripcionToEdit(inscripcion);
        setIsEditModalOpen(true);
    };

    // Función para guardar los cambios realizados en el modal de edición
    // Función para guardar los cambios realizados en el modal de edición
    const handleSaveChanges = async (id, updatedData) => {
        try {
            // Agregar el editor_id a los datos a enviar
            const dataToSend = {
                ...updatedData,
                editor_id: user ? user.id : null // Usar el ID del usuario actual
            };

            console.log('Datos a enviar:', dataToSend);

            // Realizar la petición para actualizar los datos
            const response = await fetch(`http://localhost:5000/api/inscripciones/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Respuesta de actualización:', result);

                // Actualizar el estado local con los datos modificados
                const updatedInscripciones = inscripciones.map(insc =>
                    insc.id === id ? { ...insc, ...result.inscripcion } : insc
                );
                setInscripciones(updatedInscripciones);

                // Actualizar también los resultados de búsqueda si es necesario
                if (searchResults.length > 0) {
                    const updatedSearchResults = searchResults.map(insc =>
                        insc.id === id ? { ...insc, ...result.inscripcion } : insc
                    );
                    setSearchResults(updatedSearchResults);
                }

                // Cerrar el modal
                handleCloseEditModal();

                // Mostrar mensaje de éxito
                alert("Registro actualizado correctamente");
            } else {
                let errorMessage = "Error al actualizar el registro";
                try {
                    const errorData = await response.json();
                    errorMessage += ": " + (errorData.message || errorData.error || "");
                } catch (e) {
                    const errorText = await response.text();
                    errorMessage += ": " + errorText;
                }
                console.error('Error al actualizar la inscripción:', errorMessage);
                alert(errorMessage);
            }
        } catch (error) {
            console.error('Error en la petición de actualización:', error);
            alert("Error al actualizar el registro: " + error.message);
        }
    };

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
                        <select value={currentYear} onChange={(e) => setCurrentYear(parseInt(e.target.value))}>
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
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
                <div className={`stat-card ${activeTab === 'inscripciones' ? 'active-stat' : ''}`} onClick={() => handleTabClick('inscripciones')}>
                    <div className="stat-header">
                        <h3>Inscripciones</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">{contadores.inscripciones_normales || 0}</p>
                        <p className="stat-subtitle">en {currentMonth}</p>
                    </div>
                </div>

                {/* Renovaciones */}
                <div className={`stat-card ${activeTab === 'renovaciones' ? 'active-stat' : ''}`} onClick={() => handleTabClick('renovaciones')}>
                    <div className="stat-header">
                        <h3>Renovaciones</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">0</p>
                        <p className="stat-subtitle">en {currentMonth}</p>
                    </div>
                </div>

                {/* Inscripciones Bacho */}
                <div className={`stat-card ${activeTab === 'inscripciones-bacho' ? 'active-stat' : ''}`} onClick={() => handleTabClick('inscripciones-bacho')}>
                    <div className="stat-header">
                        <h3>Inscripciones Bacho</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">{contadores.inscripciones_bacho || 0}</p>
                        <p className="stat-subtitle">en {currentMonth}</p>
                    </div>
                </div>

                {/* Renovaciones Bacho */}
                <div className={`stat-card ${activeTab === 'renovaciones-bacho' ? 'active-stat' : ''}`} onClick={() => handleTabClick('renovaciones-bacho')}>
                    <div className="stat-header">
                        <h3>Renovaciones Bacho</h3>
                        <button className="icon-button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                    <div className="stat-content">
                        <p className="stat-number">0</p>
                        <p className="stat-subtitle">en {currentMonth}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs - MODIFICADO para usar manejo de estados en lugar de navegación */}
            <div className="navigation-tabs">
                <button
                    className={`tab ${activeTab === 'inscripciones' ? 'active' : ''}`}
                    onClick={() => handleTabClick('inscripciones')}
                >
                    Inscripción
                </button>
                <button
                    className={`tab ${activeTab === 'renovaciones' ? 'active' : ''}`}
                    onClick={() => handleTabClick('renovaciones')}
                >
                    Renovación
                </button>
                <button
                    className={`tab ${activeTab === 'inscripciones-bacho' ? 'active' : ''}`}
                    onClick={() => handleTabClick('inscripciones-bacho')}
                >
                    Inscripción Bacho
                </button>
                <button
                    className={`tab ${activeTab === 'renovaciones-bacho' ? 'active' : ''}`}
                    onClick={() => handleTabClick('renovaciones-bacho')}
                >
                    Renovación Bacho
                </button>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, folio..."
                        className="search-input"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {/* Render the appropriate table component based on active tab */}
            {renderTable()}

            {/* Modal de detalles */}
            <DetallesModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                inscripcion={selectedInscripcion}
            />

            {/* Modal de edición */}
            <EditarModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                inscripcion={selectedInscripcionToEdit}
                onSave={handleSaveChanges}
            />
        </div>
    );
};

const DocumentsTooltip = ({ documentosFaltantes, recordId }) => {
    // Si documentosFaltantes es null o undefined, mostramos un mensaje adecuado
    if (!documentosFaltantes) {
        return (
            <div className="documents-tooltip">
                <h4>Documentos faltantes:</h4>
                <p>No hay información de documentos disponible</p>
            </div>
        );
    }

    // Convertir objeto de documentos faltantes a array
    // IMPORTANTE: En documentos_faltantes, los valores 'false' indican documentos faltantes
    // y los valores 'true' indican documentos entregados
    const documentosArray = Object.entries(documentosFaltantes)
        .filter(([key, value]) => {
            // Solo incluir propiedades que son booleanas y son 'false' (documento faltante)
            // Y excluir la propiedad 'comentarios'
            return typeof value === 'boolean' && value === false && key !== 'comentarios';
        })
        .map(([key, _]) => {
            // Convertir snake_case a texto legible
            return key
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        });

    // Extraer comentarios si existen
    const comentarios = documentosFaltantes.comentarios;

    return (
        <div className="documents-tooltip">
            <h4>Documentos faltantes:</h4>
            {documentosArray.length > 0 ? (
                <ul>
                    {documentosArray.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                    ))}
                </ul>
            ) : (
                <p>No hay documentos faltantes</p>
            )}

            {comentarios && (
                <div className="mt-3 pt-2 border-t border-gray-700">
                    <h4>Comentarios</h4>
                    <p className="text-xs text-gray-400 italic">{comentarios}</p>
                </div>
            )}
        </div>
    );
};

// 4. Modificar InscripcionesTable para usar datos dinámicos
const InscripcionesTable = ({ currentMonth, hoveredDoc, setHoveredDoc, inscripciones, userRole, onShowDetails, onEditInscripcion }) => {
    // Filtrar inscripciones que no son de bachillerato
    const inscripcionesNormales = inscripciones.filter(insc => !insc.es_bacho);

    return (
        <div className="registration-section">
            <h2 className="section-title">Inscripción</h2>
            <p className="section-subtitle">Listado de registros de inscripción para {currentMonth}</p>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
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
                    {inscripcionesNormales.length > 0 ? (
                        inscripcionesNormales.map(insc => {
                            // Contar documentos faltantes correctamente
                            const docsFaltantes = insc.documentos_faltantes ?
                                Object.entries(insc.documentos_faltantes)
                                    .filter(([key, value]) =>
                                        typeof value === 'boolean' &&
                                        value === false &&
                                        key !== 'comentarios'
                                    ).length : 0;

                            // Formatear fecha
                            const fecha = new Date(insc.fecha_ingreso);
                            const fechaFormateada = fecha.toLocaleDateString('es-MX');

                            return (
                                <tr key={insc.id}>
                                    <td>{insc.id}</td>
                                    <td>{insc.nombre}</td>
                                    <td>{insc.folio || '-'}</td>
                                    <td><span className={`status ${insc.estatus.toLowerCase()}`}>{insc.estatus}</span></td>
                                    <td>{insc.forma_pago}</td>
                                    <td>
                                        <div className="document-container">
                                            <span
                                                className="document-badge"
                                                onMouseEnter={() => setHoveredDoc(insc.id)}
                                                onMouseLeave={() => setHoveredDoc(null)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {docsFaltantes} faltantes
                                            </span>
                                            {hoveredDoc === insc.id && (
                                                <DocumentsTooltip documentosFaltantes={insc.documentos_faltantes} recordId={insc.id} />
                                            )}
                                        </div>
                                    </td>
                                    <td>{insc.horario}</td>
                                    <td>{insc.atendido_por}</td>
                                    <td>{fechaFormateada}</td>
                                    <td className="actions">
                                        {/* Botón de visualización - visible para todos los roles */}
                                        <button className="action-button" onClick={() => onShowDetails(insc)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        {/* Botón de edición - solo visible para admin o editor */}
                                        {(userRole === 'admin' || userRole === 'editor') && (
                                            <button className="action-button" onClick={() => onEditInscripcion(insc)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center">No hay inscripciones para mostrar</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const RenovacionesTable = ({ currentMonth, hoveredDoc, setHoveredDoc }) => {
    return (
        <div className="registration-section">
            <h2 className="section-title">Renovación</h2>
            <p className="section-subtitle">Listado de registros de renovación para {currentMonth}</p>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
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
                        <td>1</td>
                        <td>Roberto González</td>
                        <td>REN-001</td>
                        <td><span className="status completed">Completado</span></td>
                        <td>Tarjeta</td>
                        <td>
                            <div className="document-container">
                                <span
                                    className="document-badge"
                                    onMouseEnter={() => setHoveredDoc('REN-001')}
                                    onMouseLeave={() => setHoveredDoc(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    2 faltantes
                                </span>
                                {hoveredDoc === 'REN-001' && (
                                    <div className="documents-tooltip">
                                        <h4>Documentos faltantes:</h4>
                                        <ul>
                                            {missingDocsData['REN-001'].map((doc, idx) => (
                                                <li key={idx}>{doc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>12:45</td>
                        <td>Admin</td>
                        <td>15/05/2023</td>
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
                        <td>2</td>
                        <td>Lucía Fernández</td>
                        <td>REN-002</td>
                        <td><span className="status pending">Pendiente</span></td>
                        <td>Transferencia</td>
                        <td>
                            <div className="document-container">
                                <span
                                    className="document-badge"
                                    onMouseEnter={() => setHoveredDoc('REN-002')}
                                    onMouseLeave={() => setHoveredDoc(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    2 faltantes
                                </span>
                                {hoveredDoc === 'REN-002' && (
                                    <div className="documents-tooltip">
                                        <h4>Documentos faltantes:</h4>
                                        <ul>
                                            {missingDocsData['REN-002'].map((doc, idx) => (
                                                <li key={idx}>{doc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>11:15</td>
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
                        <td>3</td>
                        <td>Javier Morales</td>
                        <td>REN-003</td>
                        <td><span className="status completed">Completado</span></td>
                        <td>Efectivo</td>
                        <td>
                            <div className="document-container">
                                <span
                                    className="document-badge"
                                    onMouseEnter={() => setHoveredDoc('REN-003')}
                                    onMouseLeave={() => setHoveredDoc(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    3 faltantes
                                </span>
                                {hoveredDoc === 'REN-003' && (
                                    <div className="documents-tooltip">
                                        <h4>Documentos faltantes:</h4>
                                        <ul>
                                            {missingDocsData['REN-003'].map((doc, idx) => (
                                                <li key={idx}>{doc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </td>
                        <td>09:30</td>
                        <td>Admin</td>
                        <td>16/05/2023</td>
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
    );
};

// 5. Modificar InscripcionesBachoTable para usar datos dinámicos
const InscripcionesBachoTable = ({ currentMonth, hoveredDoc, setHoveredDoc, inscripciones, userRole, onShowDetails, onEditInscripcion }) => {
    // Filtrar inscripciones de bachillerato
    const inscripcionesBacho = inscripciones.filter(insc => insc.es_bacho);

    return (
        <div className="registration-section">
            <h2 className="section-title">Inscripción Bachillerato</h2>
            <p className="section-subtitle">Listado de registros de inscripción bachillerato para {currentMonth}</p>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
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
                    {inscripcionesBacho.length > 0 ? (
                        inscripcionesBacho.map(insc => {
                            // Contar documentos faltantes
                            const docsFaltantes = insc.documentos_faltantes ?
                                Object.values(insc.documentos_faltantes)
                                    .filter((val, key) => typeof val === 'boolean' && val === false).length : 0;

                            // Formatear fecha
                            const fecha = new Date(insc.fecha_ingreso);
                            const fechaFormateada = fecha.toLocaleDateString('es-MX');

                            return (
                                <tr key={insc.id}>
                                    <td>{insc.id}</td>
                                    <td>{insc.nombre}</td>
                                    <td>{insc.folio || '-'}</td>
                                    <td><span className={`status ${insc.estatus.toLowerCase()}`}>{insc.estatus}</span></td>
                                    <td>{insc.forma_pago}</td>
                                    <td>
                                        <div className="document-container">
                                            <span
                                                className="document-badge"
                                                onMouseEnter={() => setHoveredDoc(insc.id)}
                                                onMouseLeave={() => setHoveredDoc(null)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {docsFaltantes} faltantes
                                            </span>
                                            {hoveredDoc === insc.id && (
                                                <DocumentsTooltip documentosFaltantes={insc.documentos_faltantes} recordId={insc.id} />
                                            )}
                                        </div>
                                    </td>
                                    <td>{insc.horario}</td>
                                    <td>{insc.atendido_por}</td>
                                    <td>{fechaFormateada}</td>
                                    <td className="actions">
                                        {/* Botón de visualización - visible para todos los roles */}
                                        <button className="action-button" onClick={() => onShowDetails(insc)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                        {/* Botón de edición - solo visible para admin o editor */}
                                        {(userRole === 'admin' || userRole === 'editor') && (
                                            <button className="action-button" onClick={() => onEditInscripcion(insc)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center">No hay inscripciones de bachillerato para mostrar</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Componente para la tabla de Renovaciones Bachillerato
const RenovacionesBachoTable = ({ currentMonth, hoveredDoc, setHoveredDoc }) => {
    return (
        <div className="registration-section">
            <h2 className="section-title">Renovación Bachillerato</h2>
            <p className="section-subtitle">Listado de registros de renovación bachillerato para {currentMonth}</p>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
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
                        <td>1</td>
                        <td>Daniel Vázquez</td>
                        <td>REN-B-001</td>
                        <td><span className="status completed">Completado</span></td>
                        <td>Efectivo</td>
                        <td>
                            <div className="document-container">
                                <span
                                    className="document-badge"
                                    onMouseEnter={() => setHoveredDoc('REN-B-001')}
                                    onMouseLeave={() => setHoveredDoc(null)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    2 faltantes
                                </span>
                                {hoveredDoc === 'REN-B-001' && (
                                    <DocumentsTooltip missingDocsData={missingDocsData} recordId="REN-B-001" />
                                )}
                            </div>
                        </td>
                        <td>09:15</td>
                        <td>Admin</td>
                        <td>15/05/2023</td>
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
    );
};
export default DashboardHome;