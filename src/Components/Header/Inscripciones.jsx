import { useState, useEffect } from 'react';

export default function Inscripciones() {
    const [user, setUser] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        inscripcion: '',
        folio: '',
        mes: 'Mayo',
        año: new Date().getFullYear(),
        forma_pago: 'Efectivo',
        monto: '', // Agregado campo monto
        estatus: 'Pendiente',
        horario: '',
        fecha_ingreso: '',
        hora: '',
        numero_telefonico: '',
        es_bacho: false,
        atendido_por: '',
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


    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
            setFormData(prev => ({
                ...prev,
                atendido_por: storedUser.nombre || storedUser.username || ''
            }));
        }
    }, []);

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
        if (!formData.nombre || !formData.inscripcion || !formData.atendido_por) {
            alert('Por favor llena todos los campos obligatorios: Nombre, Inscripción, Folio, Atendido por.');
            return;
        }

        if (formData.forma_pago === 'Efectivo' && !formData.monto) {
            alert('Por favor ingresa el monto para pagos en efectivo.');
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
            // Obtener el token de autenticación del localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No se encontró token de autenticación. Por favor inicia sesión nuevamente.');
                return;
            }


            const response = await fetch('http://localhost:5000/api/inscripciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Agregar el token en el encabezado
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error en la respuesta del servidor: ${response.status}`);
            }

            const data = await response.json();
            alert('Inscripción guardada exitosamente!');
            console.log('Respuesta del servidor:', data);

            // Opcional: limpiar el formulario después de guardar exitosamente
            setFormData(prev => ({
                ...prev,
                nombre: '',
                inscripcion: '',
                folio: '',
                monto: '',
                horario: '',
                fecha_ingreso: '',
                hora: '',
                numero_telefonico: '',
                es_bacho: false,
                documentos: {
                    cedula: false,
                    certificado_medico: false,
                    curp: false,
                    ine: false,
                    comprobante_domicilio: false,
                    donativo: false,
                },
                comentarios: '',
            }));
        } catch (error) {
            console.error('Error:', error);
            alert(`Error al guardar la inscripción: ${error.message}`);
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
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                            </select>
                        </div>
                    </div>

                    {/* Campo de monto que aparece cuando la forma de pago es efectivo */}
                    {formData.forma_pago === 'Efectivo' && (
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="monto">Monto *</label>
                                <input
                                    type="number"
                                    id="monto"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    placeholder="Ingrese el monto"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="estatus">Estatus</label>
                            <select
                                id="estatus"
                                name="estatus"
                                value={formData.estatus}
                                onChange={handleChange}
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
                                placeholder="Ej: 9:00 - 12:00"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha_ingreso">Fecha y Hora de Ingreso</label>
                            <input
                                type="datetime-local"
                                id="fecha_ingreso"
                                name="fecha_ingreso"
                                value={formData.fecha_ingreso}
                                onChange={handleChange}
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
                                placeholder="Ej: +52 123 456 7890"
                            />
                        </div>
                        <div className="form-group documento-item ">
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
                        <div className="form-group ">
                            <label htmlFor="atendido_por">Atendido por *</label>
                            <input
                                type="text"
                                id="atendido_por"
                                name="atendido_por"
                                value={formData.atendido_por}
                                readOnly
                            />
                        </div>
                    </div>

                    <div className="form-group documentos-container">
                        <h4>Documentos entregados</h4>
                        <div className="documentos-grid">
                            {Object.keys(formData.documentos).map((doc) => (
                                <div key={doc} className="documento-item ">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name={doc}
                                            checked={formData.documentos[doc]}
                                            onChange={handleCheckboxChange}
                                        />
                                        {doc.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="comentarios">Comentarios</label>
                        <textarea
                            id="comentarios"
                            name="comentarios"
                            value={formData.comentarios}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="button" onClick={handleSubmit}>
                        Guardar Inscripción
                    </button>
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
        
        input, select, textarea {
            padding: 8px 10px;
            border: 1px solid #333;
            border-radius: 4px;
            background-color: #1a1a1a;
            color: #fff;
            font-size: 14px;
        }
        
        textarea {
            height: 100px;
            resize: vertical;
        }
        
        select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M6 9L1 4h10L6 9z' fill='%23888'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 10px center;
            padding-right: 30px;
        }
        
        button {
            background-color: #10B981;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 10px 20px;
            font-size: 14px;
            cursor: pointer;
            transition: background-color 0.2s;
            margin-top: 20px;
        }
        
        button:hover {
            background-color: #0D9668;
        }
        
        @media (max-width: 768px) {
            .form-row {
                flex-direction: column;
                gap: 15px;
            }
        }

        .documentos-container {
        margin-top: 15px;
        margin-bottom: 20px;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 15px;
        background-color: #1a1a1a;
        }

        .documentos-container h4 {
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 14px;
        color: #ccc;
        border-bottom: 1px solid #333;
        padding-bottom: 8px;
        }

        .documentos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        }

        .documento-item {
        display: flex;
        align-items: center;
        padding: 8px 10px;
        border-radius: 4px;
        transition: background-color 0.2s;
        }

        .documento-item:hover {
        background-color: #252525;
        }

        .documento-item label {
            display: flex;
            align-items: center;
            cursor: pointer;
            width: 100%;
            font-size: 13px;
            margin: 0;
            color: #fff;
        }

        .documento-item input[type="checkbox"] {
        margin-right: 10px;
        appearance: none;
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        background-color: #252525;
        border: 1px solid #444;
        border-radius: 3px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
        flex-shrink: 0;
        }

        .documento-item input[type="checkbox"]:checked {
        background-color: #10B981;
        border-color: #10B981;
        }

        .documento-item input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
        }

        .documento-item input[type="checkbox"]:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
        }

        /* Para pantallas pequeñas */
        @media (max-width: 768px) {
        .documentos-grid {
            grid-template-columns: 1fr;
        }
        }

      `}</style>
        </div>
    );
}