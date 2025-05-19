import React, { useState, useEffect } from 'react';
import '../../styles/Modal.css';

const EditarModal = ({ isOpen, onClose, inscripcion, onSave }) => {
    // Estado local para los datos editables
    const [formData, setFormData] = useState({
        nombre: '',
        folio: '',
        mes: '',
        año: new Date().getFullYear(),
        estatus: '',
        forma_pago: '',
        monto: '',
        horario: '',
        fecha_ingreso: '',
        numero_telefonico: '',
        es_bacho: false,
        documentos: {
            cedula: false,
            curp: false,
            comprobante_domicilio: false,
            certificado_medico: false,
            ine: false,
            donativo: false,
            comentarios: ''
        }
    });

    // Estado para determinar si estamos editando una renovación o una inscripción
    const [esRenovacion, setEsRenovacion] = useState(false);

    // Estado para rastrear si los datos vienen de InscripcionesTable
    const [esDesdeInscripcionesTable, setEsDesdeInscripcionesTable] = useState(false);

    // Actualizar el estado cuando cambia la inscripción seleccionada
    useEffect(() => {
        if (!inscripcion) return;

        // Agregar log para diagnóstico
        console.log('Datos recibidos en EditarModal:', inscripcion);
        console.log('Es bachillerato:', inscripcion.es_bacho);
        console.log('Source:', inscripcion._source);

        // Detectar si los datos vienen de InscripcionesTable
        const esDesdeInscripcionesTableDetectado =
            inscripcion._source === 'inscripcionesTable' &&
            !inscripcion.es_bacho;

        setEsDesdeInscripcionesTable(esDesdeInscripcionesTableDetectado);
        console.log('¿Es desde InscripcionesTable?', esDesdeInscripcionesTableDetectado);

        // 1. Mejorar detección si es renovación
        const esRenovacionDetectada =
            (inscripcion.folio && inscripcion.folio.startsWith('REN-')) ||
            (inscripcion.documentos_faltantes === undefined && inscripcion.monto !== undefined) ||
            (inscripcion._source && inscripcion._source.includes('renovaciones'));

        setEsRenovacion(esRenovacionDetectada);
        console.log('Es renovación:', esRenovacionDetectada);

        // 2. Extraer comentarios (pueden venir en diferentes ubicaciones)
        let comentarios = '';
        if (inscripcion.documentos_faltantes && inscripcion.documentos_faltantes.comentarios) {
            comentarios = inscripcion.documentos_faltantes.comentarios;
        } else if (inscripcion.documentos && inscripcion.documentos.comentarios) {
            comentarios = inscripcion.documentos.comentarios;
        } else if (inscripcion.comentarios) {
            comentarios = inscripcion.comentarios;
        }

        // 3. Construir objeto default de documentos (todos MARCADOS por defecto)
        const defaultDocs = {
            cedula: true,
            curp: true,
            comprobante_domicilio: true,
            certificado_medico: true,
            ine: true,
            donativo: true,
            comentarios: comentarios
        };

        // Primero, añade más información de depuración
        console.log('Original documentos o documentos_faltantes:',
            inscripcion.documentos || inscripcion.documentos_faltantes);

        // 4. Determinar la fuente y aplicar la lógica adecuada
        if (inscripcion.documentos) {
            // Si los datos vienen como 'documentos' (mantener como está)
            Object.entries(inscripcion.documentos).forEach(([key, value]) => {
                if (key !== 'comentarios' && key !== 'id' && key in defaultDocs) {
                    defaultDocs[key] = value; // Usar directamente
                }
            });
        } else if (inscripcion.documentos_faltantes) {
            // Procesar los documentos_faltantes con una lógica clara
            Object.entries(inscripcion.documentos_faltantes).forEach(([key, value]) => {
                if (key !== 'comentarios' && key in defaultDocs) {
                    console.log(`Procesando documento ${key}:`, value,
                        'Fuente:', inscripcion._source);

                    // Lógica específica basada en documentos_faltantes:
                    // - Si value es true (documento faltante), checkbox debe estar desmarcado
                    // - Si value es false (documento no faltante), checkbox debe estar marcado
                    // - Si value es undefined (no hay dato), checkbox debe estar marcado por defecto

                    if (value === true) {
                        defaultDocs[key] = true; // Documento faltante -> checkbox desmarcado
                    } else {
                        defaultDocs[key] = false;  // Documento no faltante o sin datos -> checkbox marcado
                    }

                    console.log(`${key} después de procesar:`, defaultDocs[key]);
                }
            });
        }

        // Añadir log de los documentos finales
        console.log('Documentos finales para checkboxes:', defaultDocs);

        // 5. Formatear fecha de ingreso para el input type="date"
        let fechaFormateada = '';
        if (inscripcion.fecha_ingreso) {
            try {
                const fecha = new Date(inscripcion.fecha_ingreso);
                fechaFormateada = fecha.toISOString().split('T')[0];
            } catch (error) {
                console.error('Error al formatear fecha:', error);
                fechaFormateada = '';
            }
        }

        // 6. Detectar número telefónico en cualquiera de sus variantes
        const telefono =
            inscripcion.numero_telefonico ||
            inscripcion.telefono ||
            inscripcion.numero_telefono ||
            inscripcion.num_telefono ||
            inscripcion.num_telefonico ||
            '';

        // 7. Poblar el estado del formulario
        setFormData({
            nombre: inscripcion.nombre || '',
            folio: inscripcion.folio || '',
            mes: inscripcion.mes || '',
            año: inscripcion.año || new Date().getFullYear(),
            estatus: inscripcion.estatus || '',
            forma_pago: inscripcion.forma_pago || '',
            monto: inscripcion.monto || '',
            horario: inscripcion.horario || '',
            fecha_ingreso: fechaFormateada,
            numero_telefonico: telefono,
            es_bacho: inscripcion.es_bacho || false,
            documentos: defaultDocs
        });
    }, [inscripcion]);

    if (!isOpen || !inscripcion) return null;

    // Manejar cambios en los campos de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambios en los checkboxes de documentos
    const handleDocumentoChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            documentos: {
                ...prev.documentos,
                [name]: checked
            }
        }));
    };

    // Manejar cambios en el campo de monto (validar que sea un número)
    const handleMontoChange = (e) => {
        const value = e.target.value;
        // Permitir solo números con hasta 2 decimales
        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                monto: value
            }));
        }
    };

    // Manejar cambios en checkbox de es_bacho
    const handleBachoChange = (e) => {
        setFormData(prev => ({
            ...prev,
            es_bacho: e.target.checked
        }));
    };

    // Manejar cambios en los comentarios de documentos
    const handleComentariosChange = (e) => {
        setFormData(prev => ({
            ...prev,
            documentos: {
                ...prev.documentos,
                comentarios: e.target.value
            }
        }));
    };

    // Enviar el formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        // Preparar los datos para guardar
        const dataToSave = { ...formData };

        console.log('Datos del formulario antes de guardar:', formData);

        // Manejar la estructura de datos diferente según si es renovación o inscripción
        if (!esRenovacion && formData.documentos) {
            // Para inscripciones: convertir formato de documentos
            const documentosFaltantes = {};

            // Extraer comentarios para manejarlos por separado
            let comentarios = formData.documentos.comentarios || '';

            // Tratar documentos según la tabla de origen
            Object.entries(formData.documentos).forEach(([key, value]) => {
                if (key !== 'comentarios') {
                    if (esDesdeInscripcionesTable) {
                        // Para InscripcionesTable, invertimos los valores al guardar
                        documentosFaltantes[key] = !value;
                    } else {
                        // Para otras tablas, mantenemos la lógica estándar
                        documentosFaltantes[key] = !value;
                    }
                }
            });

            console.log('Documentos faltantes a guardar:', documentosFaltantes);

            // Agregar comentarios al objeto documentos_faltantes
            documentosFaltantes.comentarios = comentarios;

            // Asignar al dataToSave
            dataToSave.documentos_faltantes = documentosFaltantes;
            // También incluir comentarios a nivel superior
            dataToSave.comentarios = comentarios;
        } else {
            // Para renovaciones: extraer comentarios y asignarlos directamente
            if (formData.documentos && formData.documentos.comentarios !== undefined) {
                dataToSave.comentarios = formData.documentos.comentarios;
            }
        }

        // Eliminar la propiedad documentos del objeto a enviar 
        delete dataToSave.documentos;

        // Agregar una marca para identificar la fuente del registro (para usarla en el endpoint)
        dataToSave._source = esRenovacion ? 'renovacionesTable' : 'inscripcionesTable';

        console.log('Datos finales a guardar:', dataToSave);
        onSave(inscripcion.id, dataToSave);
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content edit-modal">
                <div className="modal-header">
                    <h3>Editar registro</h3>
                    <p className="modal-subtitle">Modifica los datos del registro. Los cambios se guardarán automáticamente.</p>
                    <button className="close-button" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="folio">Folio</label>
                            <input
                                type="text"
                                id="folio"
                                name="folio"
                                value={formData.folio}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="mes">Mes</label>
                            <select
                                id="mes"
                                name="mes"
                                value={formData.mes}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="Enero">Enero</option>
                                <option value="Febrero">Febrero</option>
                                <option value="Marzo">Marzo</option>
                                <option value="Abril">Abril</option>
                                <option value="Mayo">Mayo</option>
                                <option value="Junio">Junio</option>
                                <option value="Julio">Julio</option>
                                <option value="Agosto">Agosto</option>
                                <option value="Septiembre">Septiembre</option>
                                <option value="Octubre">Octubre</option>
                                <option value="Noviembre">Noviembre</option>
                                <option value="Diciembre">Diciembre</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="año">Año</label>
                            <input
                                type="number"
                                id="año"
                                name="año"
                                value={formData.año}
                                onChange={handleChange}
                                className="form-input"
                                min="2020"
                                max="2030"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="forma_pago">Forma de Pago</label>
                            <select
                                id="forma_pago"
                                name="forma_pago"
                                value={formData.forma_pago}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="monto">Monto</label>
                            <input
                                type="text"
                                id="monto"
                                name="monto"
                                value={formData.monto}
                                onChange={handleMontoChange}
                                className="form-input"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="estatus">Estatus</label>
                            <select
                                id="estatus"
                                name="estatus"
                                value={formData.estatus}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="">Seleccione</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Completado">Completado</option>
                                <option value="Cancelado">Cancelado</option>
                                <option value="Entregado">Entregado</option>
                                <option value="Tramitar hoja">Tramitar hoja</option>
                                <option value="Faltan doc.">Faltan doc.</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="horario">Horario</label>
                            <input
                                type="text"
                                id="horario"
                                name="horario"
                                value={formData.horario}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
                            <input
                                type="date"
                                id="fecha_ingreso"
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="numero_telefonico">Número Telefónico</label>
                            <input
                                type="text"
                                id="numero_telefonico"
                                name="numero_telefonico"
                                value={formData.numero_telefonico}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px',
                            padding: '8px',
                            borderRadius: '6px',
                            backgroundColor: '#252525'
                        }}>
                            <label htmlFor="es_bacho" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                color: 'white',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    id="es_bacho"
                                    name="es_bacho"
                                    checked={formData.es_bacho}
                                    onChange={handleBachoChange}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        accentColor: '#10B981',
                                        cursor: 'pointer',
                                        marginRight: '6px'
                                    }}
                                />
                                Bachillerato
                            </label>
                        </div>

                    </div>

                    {/* Solo mostrar la sección de documentos si NO es una renovación */}
                    {!esRenovacion && (
                        <div className="form-section">
                            <h4>Documentos Entregados</h4>
                            <div className="documentos-grid">
                                <div className="documento-item">
                                    <input
                                        type="checkbox"
                                        id="cedula"
                                        name="cedula"
                                        checked={formData.documentos?.cedula || false}
                                        onChange={handleDocumentoChange}
                                    />
                                    <label htmlFor="cedula">Cédula</label>
                                </div>
                                <div className="documento-item">
                                    <input
                                        type="checkbox"
                                        id="certificado_medico"
                                        name="certificado_medico"
                                        checked={formData.documentos?.certificado_medico || false}
                                        onChange={handleDocumentoChange}
                                    />
                                    <label htmlFor="certificado_medico">Certificado Médico</label>
                                </div>
                                <div className="documento-item">
                                    <input
                                        type="checkbox"
                                        id="curp"
                                        name="curp"
                                        checked={formData.documentos?.curp || false}
                                        onChange={handleDocumentoChange}
                                    />
                                    <label htmlFor="curp">CURP</label>
                                </div>
                                <div className="documento-item">
                                    <input
                                        type="checkbox"
                                        id="ine"
                                        name="ine"
                                        checked={formData.documentos?.ine || false}
                                        onChange={handleDocumentoChange}
                                    />
                                    <label htmlFor="ine">INE</label>
                                </div>
                                <div className="documento-item">
                                    <input
                                        type="checkbox"
                                        id="comprobante_domicilio"
                                        name="comprobante_domicilio"
                                        checked={formData.documentos?.comprobante_domicilio || false}
                                        onChange={handleDocumentoChange}
                                    />
                                    <label htmlFor="comprobante_domicilio">Comprobante de Domicilio</label>
                                </div>
                                <div className="documento-item">
                                    <input
                                        type="checkbox"
                                        id="donativo"
                                        name="donativo"
                                        checked={formData.documentos?.donativo || false}
                                        onChange={handleDocumentoChange}
                                    />
                                    <label htmlFor="donativo">Donativo</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección de comentarios para todos los tipos de registros */}
                    <div className="form-section">
                        <h4>Comentarios</h4>
                        <textarea
                            id="comentarios"
                            name="comentarios"
                            value={formData.documentos?.comentarios || ''}
                            onChange={handleComentariosChange}
                            className="form-textarea"
                            rows="3"
                            placeholder={esRenovacion ?
                                "Información adicional sobre esta renovación..." :
                                "Comentarios sobre documentos o información adicional..."}
                        ></textarea>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="cancel-button" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="save-button">Guardar cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarModal;