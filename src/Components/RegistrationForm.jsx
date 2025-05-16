import React, { useState } from 'react';
import '../styles/registration.css';

function RegistrationForm() {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    const [form, setForm] = useState({
        nombre: '',
        folio: '',
        año: currentYear,
        mes: currentMonthIndex,
        formaPago: 'Efectivo',
        estatus: 'Pendiente',
        horario: '',
        fechaIngreso: '',
        hora: '',
        telefono: '',
        documentos: [],
        comentarios: ''
    });

    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const documentosDisponibles = [
        'Cédula', 'CURP', 'Comprobante de Domicilio', 'Certificado Médico', 'INE', 'Donativo'
    ];

    const toggleDocumento = (doc) => {
        setForm((prev) => {
            const docs = prev.documentos.includes(doc)
                ? prev.documentos.filter(d => d !== doc)
                : [...prev.documentos, doc];
            return { ...prev, documentos: docs };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        alert("Inscripción guardada correctamente.");
    };

    return (
        <div className="form-wrapper">
            <h2>Inscripciones</h2>
            <p>Registra una nueva inscripción en el sistema.</p>

            <form className="form-box" onSubmit={handleSubmit}>
                <h3>Nueva Inscripción</h3>

                <label>Nombre</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required />

                <label>Folio</label>
                <input type="text" name="folio" value={form.folio} onChange={handleChange} required />

                <div className="row">
                    <div>
                        <label>Mes</label>
                        <select name="mes" value={form.mes} onChange={handleChange}>
                            {meses.map((mes, i) => (
                                <option key={i} value={i}>{mes}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label>Año</label>
                        <input type="number" name="año" value={form.año} onChange={handleChange} min="2020" />
                    </div>
                </div>

                <label>Forma de Pago</label>
                <select name="formaPago" value={form.formaPago} onChange={handleChange}>
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                    <option>Transferencia</option>
                    <option>Otras</option>
                </select>

                <label>Estatus</label>
                <select name="estatus" value={form.estatus} onChange={handleChange}>
                    <option>Pendiente</option>
                    <option>Pagado</option>
                    <option>Cancelado</option>
                </select>

                <label>Horario</label>
                <input type="text" name="horario" value={form.horario} onChange={handleChange} />

                <label>Fecha de Ingreso</label>
                <input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} />

                <label>Hora</label>
                <input type="time" name="hora" value={form.hora} onChange={handleChange} />

                <label>Número Telefónico</label>
                <input type="tel" name="telefono" value={form.telefono} onChange={handleChange} />

                <fieldset>
                    <legend>Documentos Entregados</legend>
                    <div className="checkbox-group">
                        {documentosDisponibles.map((doc, idx) => (
                            <label key={idx}>
                                <input
                                    type="checkbox"
                                    checked={form.documentos.includes(doc)}
                                    onChange={() => toggleDocumento(doc)}
                                />
                                {doc}
                            </label>
                        ))}
                    </div>
                    <textarea
                        placeholder="Observaciones adicionales sobre los documentos"
                        name="comentarios"
                        value={form.comentarios}
                        onChange={handleChange}
                    />
                </fieldset>

                <button type="submit" className="btn-guardar">Guardar Inscripción</button>
            </form>
        </div>
    );
}

export default RegistrationForm;
