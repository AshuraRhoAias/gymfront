import React from 'react';
import '../../styles/Modal.css'; // Necesitaremos crear este archivo CSS

const DetallesModal = ({ isOpen, onClose, inscripcion }) => {
    if (!isOpen || !inscripcion) return null;

    // Formatear la fecha
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '-';
        const fecha = new Date(fechaStr);
        return fecha.toLocaleString('es-MX', {
            dateStyle: 'short',
            timeStyle: 'medium'
        });
    };


    // Extraer los documentos faltantes
    const documentosFaltantes = inscripcion.documentos_faltantes ?
        Object.entries(inscripcion.documentos_faltantes)
            .filter(([key, value]) => value === false && key !== 'comentarios')
            .map(([key, _]) => {
                return key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }) : [];

    // Comentarios
    const comentarios = inscripcion.documentos_faltantes && inscripcion.documentos_faltantes.comentarios;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Detalles del registro</h3>
                    <button className="close-button" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="detail-row">
                        <div className="detail-label">Nombre:</div>
                        <div className="detail-value">{inscripcion.nombre || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Inscripción:</div>
                        <div className="detail-value">{inscripcion.inscripcion || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Folio:</div>
                        <div className="detail-value">{inscripcion.folio || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Documentos faltantes:</div>
                        <div className="detail-value">
                            {documentosFaltantes.length > 0 ? (
                                <ul className="documents-list">
                                    {documentosFaltantes.map((doc, index) => (
                                        <li key={index}>• {doc}</li>
                                    ))}
                                </ul>
                            ) : (
                                'Ninguno'
                            )}

                            {comentarios && (
                                <div className="comments-section">
                                    <div className="comments-title">Comentarios:</div>
                                    <div className="comments-text">{comentarios}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Mes:</div>
                        <div className="detail-value">{inscripcion.mes || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Forma de pago:</div>
                        <div className="detail-value">{inscripcion.forma_pago || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Estatus:</div>
                        <div className="detail-value status-tag">{inscripcion.estatus || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Atendido por:</div>
                        <div className="detail-value">{inscripcion.atendido_por || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Horario:</div>
                        <div className="detail-value">{inscripcion.horario || '-'}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Fecha de ingreso:</div>
                        <div className="detail-value">{formatearFecha(inscripcion.fecha_ingreso)}</div>
                    </div>

                    <div className="detail-row">
                        <div className="detail-label">Número telefónico:</div>
                        <div className="detail-value">{inscripcion.numero_telefonico || inscripcion.telefono || '-'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetallesModal;