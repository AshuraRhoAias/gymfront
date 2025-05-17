import React, { useState, useEffect } from 'react';
import '../../styles/Modal.css';

const EditarModal = ({ isOpen, onClose, inscripcion, onSave }) => {
    // Estado local para los datos editables
    const [formData, setFormData] = useState({
        nombre: '',
        inscripcion: '',
        folio: '',
        mes: '',
        estatus: '',
        forma_pago: '',
        horario: '',
        fecha_ingreso: '',
        hora: '',
        numero_telefonico: '',
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

    // Actualizar el estado cuando cambia la inscripción seleccionada
    useEffect(() => {
        if (inscripcion) {
            // Convertir documentos_faltantes a la estructura que necesitamos
            // (negando los valores porque true=entregado, false=faltante)
            const documentos = {};
            if (inscripcion.documentos_faltantes) {
                Object.entries(inscripcion.documentos_faltantes).forEach(([key, value]) => {
                    if (key === 'comentarios') {
                        documentos.comentarios = value;
                    } else {
                        documentos[key] = !value; // Negar el valor (documentos entregados vs faltantes)
                    }
                });
            }

            setFormData({
                nombre: inscripcion.nombre || '',
                inscripcion: inscripcion.inscripcion || '',
                folio: inscripcion.folio || '',
                mes: inscripcion.mes || '',
                estatus: inscripcion.estatus || '',
                forma_pago: inscripcion.forma_pago || '',
                horario: inscripcion.horario || '',
                fecha_ingreso: inscripcion.fecha_ingreso ? new Date(inscripcion.fecha_ingreso).toISOString().split('T')[0] : '',
                hora: inscripcion.hora || '',
                numero_telefonico: inscripcion.numero_telefonico || '',
                documentos: documentos
            });
        }
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

        // Convertir el formato de los documentos de vuelta al formato original
        const documentosFaltantes = {};
        Object.entries(formData.documentos).forEach(([key, value]) => {
            if (key === 'comentarios') {
                documentosFaltantes.comentarios = value;
            } else {
                documentosFaltantes[key] = !value; // Negamos nuevamente
            }
        });

        const dataToSave = {
            ...formData,
            documentos_faltantes: documentosFaltantes
        };

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
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="inscripcion">Inscripción</label>
                            <select
                                id="inscripcion"
                                name="inscripcion"
                                value={formData.inscripcion}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Regular">Regular</option>
                                <option value="Especial">Especial</option>
                            </select>
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
                            >
                                <option value="Mayo">Mayo</option>
                                <option value="Junio">Junio</option>
                                <option value="Julio">Julio</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="forma_pago">Forma de Pago</label>
                            <select
                                id="forma_pago"
                                name="forma_pago"
                                value={formData.forma_pago}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Transferencia">Transferencia</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="estatus">Estatus</label>
                            <select
                                id="estatus"
                                name="estatus"
                                value={formData.estatus}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Completado">Completado</option>
                                <option value="Pendiente">Pendiente</option>
                                <option value="Cancelado">Cancelado</option>
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
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="hora">Hora</label>
                            <input
                                type="time"
                                id="hora"
                                name="hora"
                                value={formData.hora}
                                onChange={handleChange}
                                className="form-input"
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
                            />
                        </div>
                    </div>

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

                    <div className="form-section">
                        <label htmlFor="comentarios">Comentarios sobre documentos</label>
                        <textarea
                            id="comentarios"
                            name="comentarios"
                            value={formData.documentos?.comentarios || ''}
                            onChange={handleComentariosChange}
                            className="form-textarea"
                            rows="3"
                            placeholder="Prometió traer documentos la próxima semana"
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