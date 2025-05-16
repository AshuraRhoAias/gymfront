import { useState } from 'react';

export default function Inscripciones() {
    const [formData, setFormData] = useState({
        nombre: '',
        inscripcion: '',
        folio: '',
        mes: 'Mayo',
        año: new Date().getFullYear(),
        forma_pago: 'Efectivo',
        estatus: 'Pendiente',
        horario: '',
        fecha_ingreso: '',
        hora: '',
        numero_telefonico: '',
        es_bacho: false,
        atendido_por: '',
        editor_id: '',
        documentos: {
            cedula: false,
            certificado_medico: false,
            curp: false,
            ine: false,
            comprobante_domicilio: false,
            donativo: false,
        },
        comentarios: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            documentos: {
                ...prev.documentos,
                [name]: checked,
            },
        }));
    };

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.inscripcion || !formData.folio || !formData.atendido_por || !formData.editor_id) {
            alert('Por favor llena todos los campos obligatorios: Nombre, Inscripción, Folio, Atendido por y Editor ID.');
            return;
        }

        const payload = {
            ...formData,
            año: Number(formData.año),
            hora: formData.hora ? `${formData.hora}:00` : '',
            documentos: {
                ...formData.documentos,
                comentarios: formData.comentarios
            }
        };

        try {
            const response = await fetch('http://localhost:5000/api/inscripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error en la respuesta del servidor');

            const data = await response.json();
            alert('Inscripción guardada exitosamente!');
            console.log('Respuesta del servidor:', data);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar la inscripción');
        }
    };

    return (
        <div className="inscripciones-container DASH">
            <div className="header">
                <h1>Inscripciones</h1>
                <p>Registra una nueva inscripción en el sistema.</p>
            </div>

            <div className="form-container">
                <div className="form-header">
                    <h2>Nueva Inscripción</h2>
                    <p>Complete todos los campos para registrar una nueva inscripción.</p>
                </div>

                <div className="form-content">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="inscripcion">Inscripción *</label>
                            <input
                                type="text"
                                id="inscripcion"
                                name="inscripcion"
                                value={formData.inscripcion}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="folio">Folio *</label>
                            <input
                                type="text"
                                id="folio"
                                name="folio"
                                value={formData.folio}
                                onChange={handleChange}
                                className="form-control"
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
                                className="form-control"
                            >
                                {[
                                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                                ].map((month) => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="año">Año *</label>
                            <input
                                type="number"
                                id="año"
                                name="año"
                                value={formData.año}
                                onChange={handleChange}
                                className="form-control"
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
                                className="form-control"
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="estatus">Estatus</label>
                            <select
                                id="estatus"
                                name="estatus"
                                value={formData.estatus}
                                onChange={handleChange}
                                className="form-control"
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Pagado">Pagado</option>
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
                                className="form-control"
                                placeholder="Ej: 9:00 - 12:00"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha_ingreso">Fecha de Ingreso</label>
                            <input
                                type="date"
                                id="fecha_ingreso"
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso}
                                onChange={handleChange}
                                className="form-control"
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
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="numero_telefonico">Número Telefónico</label>
                            <input
                                type="tel"
                                id="numero_telefonico"
                                name="numero_telefonico"
                                value={formData.numero_telefonico}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Ej: +52 123 456 7890"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="es_bacho">¿Es bachillerato?</label>
                            <input
                                type="checkbox"
                                id="es_bacho"
                                name="es_bacho"
                                checked={formData.es_bacho}
                                onChange={(e) => setFormData(prev => ({ ...prev, es_bacho: e.target.checked }))}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="atendido_por">Atendido por *</label>
                            <input
                                type="text"
                                id="atendido_por"
                                name="atendido_por"
                                value={formData.atendido_por}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editor_id">Editor ID *</label>
                            <input
                                type="text"
                                id="editor_id"
                                name="editor_id"
                                value={formData.editor_id}
                                onChange={handleChange}
                                className="form-control"
                                required
                            />
                        </div>
                    </div>

                    <div className="documentos-section">
                        <h3>Documentos Entregados</h3>
                        <p>Selecciona los documentos que el usuario ha entregado. Los no seleccionados se considerarán como faltantes.</p>

                        <div className="documentos-grid">
                            <div className="documentos-column">
                                {['cedula', 'curp', 'comprobante_domicilio'].map((doc) => (
                                    <div key={doc} className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id={doc}
                                            name={doc}
                                            checked={formData.documentos[doc]}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label htmlFor={doc}>
                                            {doc === 'cedula' ? 'Cédula' :
                                                doc === 'curp' ? 'CURP' :
                                                    'Comprobante de Domicilio'}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="documentos-column">
                                {['certificado_medico', 'ine', 'donativo'].map((doc) => (
                                    <div key={doc} className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id={doc}
                                            name={doc}
                                            checked={formData.documentos[doc]}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label htmlFor={doc}>
                                            {doc === 'certificado_medico' ? 'Certificado Médico' :
                                                doc === 'ine' ? 'INE' :
                                                    'Donativo'}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group comentarios">
                            <label htmlFor="comentarios">Comentarios sobre documentos</label>
                            <textarea
                                id="comentarios"
                                name="comentarios"
                                value={formData.comentarios}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Observaciones adicionales sobre los documentos"
                                rows="4"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-guardar" onClick={handleSubmit}>
                            Guardar Inscripción
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .inscripciones-container {
          font-family: Arial, sans-serif;
          background-color: #000;
          color: #fff;
          padding: 20px;
          min-height: 100vh;
        }
        
        .header {
          margin-bottom: 20px;
        }
        
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #fff;
        }
        
        .header p {
          margin: 5px 0 0;
          color: #ccc;
          font-size: 14px;
        }
        
        .form-container {
          background-color: #111;
          border-radius: 5px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .form-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
        }
        
        .form-header h2 {
          margin: 0;
          font-size: 18px;
          color: #fff;
        }
        
        .form-header p {
          margin: 5px 0 0;
          color: #ccc;
          font-size: 12px;
        }
        
        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .form-group {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        label {
          margin-bottom: 5px;
          font-size: 14px;
          color: #ccc;
        }
        
        .form-control {
          padding: 8px 10px;
          border: 1px solid #333;
          border-radius: 4px;
          background-color: #1a1a1a;
          color: #fff;
          font-size: 14px;
          height: 40px;
        }
        
        select.form-control {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M6 9L1 4h10L6 9z' fill='%23888'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 30px;
        }
        
        .documentos-section {
          margin-top: 20px;
          border-top: 1px solid #333;
          padding-top: 20px;
        }
        
        .documentos-section h3 {
          margin: 0 0 5px;
          font-size: 16px;
          color: #fff;
        }
        
        .documentos-section p {
          margin: 0 0 15px;
          color: #ccc;
          font-size: 12px;
        }
        
        .documentos-grid {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
        }
        
        .documentos-column {
          flex: 1;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .checkbox-group input[type="checkbox"] {
          margin-right: 10px;
          width: 16px;
          height: 16px;
          appearance: none;
          border: 1px solid #555;
          border-radius: 3px;
          background-color: #1a1a1a;
          position: relative;
          cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"]:checked {
          background-color: #10B981;
          border-color: #10B981;
        }
        
        .checkbox-group input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 5px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        
        .comentarios textarea {
          height: 100px;
          resize: vertical;
        }
        
        .form-actions {
          margin-top: 20px;
          display: flex;
          justify-content: flex-end;
        }
        
        .btn-guardar {
          background-color: #10B981;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .btn-guardar:hover {
          background-color: #0D9668;
        }
        
        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 15px;
          }
          
          .documentos-grid {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
        </div>
    );
}