import React, { useState, useRef, useEffect } from 'react';
import '../styles/Scanner.css';

const QRScanner = ({ url }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scannedText, setScannedText] = useState('');
    const [error, setError] = useState('');
    const [isCameraSupported, setIsCameraSupported] = useState(true);
    const [detectionMethod, setDetectionMethod] = useState('');
    const [personData, setPersonData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const scanIntervalRef = useRef(null);

    useEffect(() => {
        // Cargar jsQR si no está disponible BarcodeDetector
        const loadJsQR = () => {
            return new Promise((resolve, reject) => {
                if (window.jsQR) {
                    resolve(window.jsQR);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
                script.onload = () => {
                    if (window.jsQR) {
                        resolve(window.jsQR);
                    } else {
                        reject(new Error('jsQR no se cargó correctamente'));
                    }
                };
                script.onerror = () => reject(new Error('Error al cargar jsQR'));
                document.head.appendChild(script);
            });
        };

        const initializeDetection = async () => {
            // Verificar compatibilidad de cámara
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setIsCameraSupported(false);
                setError('Tu navegador no soporta acceso a la cámara');
                return;
            }

            // Verificar BarcodeDetector nativo
            if (window.BarcodeDetector) {
                try {
                    const formats = await window.BarcodeDetector.getSupportedFormats();
                    if (formats.includes('qr_code')) {
                        setDetectionMethod('native');
                        return;
                    }
                } catch (err) {
                    console.log('BarcodeDetector no disponible, usando jsQR');
                }
            }

            // Cargar jsQR como fallback
            try {
                await loadJsQR();
                setDetectionMethod('jsqr');
            } catch (err) {
                setError('Error al cargar el detector de QR: ' + err.message);
            }
        };

        initializeDetection();

        return () => {
            stopScanning();
        };
    }, []);

    const searchPersonById = async (id) => {
        if (!url) {
            setError('URL de la API no proporcionada');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            // Usar el ID tal como viene (cadena de caracteres)
            const idToSend = id.trim();

            console.log('Enviando petición:', {
                url: `http://${url}/api/consulta`,
                id: idToSend,
                token: token ? 'Token presente' : 'Sin token'
            });

            const response = await fetch(`http://${url}/api/consulta`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ id: idToSend })
            });

            console.log('Respuesta status:', response.status);

            if (!response.ok) {
                // Leer el cuerpo de la respuesta para obtener más detalles
                const errorText = await response.text();
                console.log('Error response body:', errorText);

                if (response.status === 401) {
                    throw new Error('No autorizado. Verifica tu token de acceso.');
                } else if (response.status === 403) {
                    throw new Error('Sin permisos. Requiere rol de admin o editor.');
                } else if (response.status === 404) {
                    throw new Error(`Persona no encontrada con ID: ${idToSend}`);
                } else {
                    throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
                }
            }

            const data = await response.json();
            console.log('Datos recibidos:', data);

            // Adaptar la estructura de datos recibida
            const adaptedData = {
                ...data.datos,
                origen: data.tipo, // usar 'tipo' como 'origen'
                numero_telefonico: data.datos.numero_telefonico || data.datos.telefono, // mapear telefono
            };

            setPersonData(adaptedData);

        } catch (err) {
            console.error('Error completo:', err);
            setError('Error al buscar persona: ' + err.message);
            setPersonData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQRDetected = async (qrData) => {
        setScannedText(qrData);

        console.log('=== DEBUG QR ===');
        console.log('QR detectado RAW:', qrData);
        console.log('Tipo de QR:', typeof qrData);

        // Limpiar espacios y usar el QR completo como ID
        const idToSend = qrData.trim();

        console.log('ID que se enviará a la API:', idToSend);
        console.log('=======================');

        if (idToSend) {
            await searchPersonById(idToSend);
            // Opcionalmente detener el escaneo después de encontrar un QR
            stopScanning();
        } else {
            setError(`El código QR está vacío`);
        }
    };

    const startScanning = async () => {
        try {
            setError('');
            setScannedText('');
            setPersonData(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsScanning(true);

                videoRef.current.onloadedmetadata = () => {
                    startQRDetection();
                };
            }
        } catch (err) {
            setError('Error al acceder a la cámara: ' + err.message);
        }
    };

    const stopScanning = () => {
        setIsScanning(false);

        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startQRDetection = async () => {
        if (detectionMethod === 'native') {
            await startNativeDetection();
        } else if (detectionMethod === 'jsqr') {
            startJsQRDetection();
        } else {
            setError('No hay método de detección disponible');
        }
    };

    const startNativeDetection = async () => {
        try {
            const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });

            scanIntervalRef.current = setInterval(async () => {
                if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');

                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                    try {
                        const barcodes = await barcodeDetector.detect(canvas);
                        if (barcodes.length > 0) {
                            const qrCode = barcodes.find(barcode => barcode.format === 'qr_code');
                            if (qrCode) {
                                await handleQRDetected(qrCode.rawValue);
                            }
                        }
                    } catch (detectionError) {
                        console.error('Error en detección nativa:', detectionError);
                    }
                }
            }, 100);

        } catch (err) {
            setError('Error al inicializar detector nativo: ' + err.message);
        }
    };

    const startJsQRDetection = () => {
        scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                canvas.width = videoRef.current.videoWidth;
                canvas.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

                try {
                    const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code) {
                        await handleQRDetected(code.data);
                    }
                } catch (detectionError) {
                    console.error('Error en detección jsQR:', detectionError);
                }
            }
        }, 100);
    };

    const clearResults = () => {
        setScannedText('');
        setPersonData(null);
        setError('');
    };

    const formatDocumentoStatus = (status) => {
        return status === 1 ? 'Entregado' : 'No entregado';
    };

    const formatMonto = (monto) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);
    };

    if (!isCameraSupported) {
        return (
            <div className="scanner-container">
                <div className="scanner-error-message">
                    <h3>Cámara no disponible</h3>
                    <p>Tu navegador no soporta acceso a la cámara o estás en un contexto no seguro (HTTP).</p>
                    <p>Prueba usando HTTPS o un navegador más moderno.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="scanner-container">
            <div className="scanner-header">
                <h2>Escáner de Códigos QR</h2>
                <div className="scanner-detection-info">
                    {detectionMethod === 'native' && (
                        <span className="scanner-detection-badge scanner-native">✨ Detección Nativa</span>
                    )}
                    {detectionMethod === 'jsqr' && (
                        <span className="scanner-detection-badge scanner-jsqr">🔧 Detección Universal</span>
                    )}
                    {!detectionMethod && (
                        <span className="scanner-detection-badge scanner-loading">⏳ Cargando detector...</span>
                    )}
                </div>
            </div>

            <div className="scanner-camera-container">
                <video
                    ref={videoRef}
                    className={`scanner-camera-video ${isScanning ? 'scanner-active' : ''}`}
                    playsInline
                    muted
                />
                <canvas
                    ref={canvasRef}
                    className="scanner-detection-canvas"
                    style={{ display: 'none' }}
                />

                {isScanning && (
                    <div className="scanner-scanning-overlay">
                        <div className="scanner-scan-area">
                            <div className="scanner-corner scanner-top-left"></div>
                            <div className="scanner-corner scanner-top-right"></div>
                            <div className="scanner-corner scanner-bottom-left"></div>
                            <div className="scanner-corner scanner-bottom-right"></div>
                            <div className="scanner-scanning-line"></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="scanner-controls">
                {!isScanning ? (
                    <button
                        onClick={startScanning}
                        className="scanner-scan-button"
                        disabled={!detectionMethod}
                    >
                        📷 Iniciar Escaneo
                    </button>
                ) : (
                    <button onClick={stopScanning} className="scanner-stop-button">
                        ⏹️ Detener Escaneo
                    </button>
                )}

                {(scannedText || personData) && (
                    <button onClick={clearResults} className="scanner-clear-button">
                        🗑️ Limpiar Resultados
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="scanner-loading">
                    <div className="scanner-spinner"></div>
                    <p>Buscando información...</p>
                </div>
            )}

            {error && (
                <div className="scanner-error-message">
                    <p>❌ {error}</p>
                </div>
            )}

            {scannedText && (
                <div className="scanner-qr-result">
                    <h3>QR Escaneado:</h3>
                    <div className="scanner-scanned-text">
                        <p>{scannedText}</p>
                    </div>
                </div>
            )}

            {personData && (
                <div className="scanner-person-data">
                    <h3>Información de la Persona</h3>

                    <div className="scanner-person-card">
                        <div className="scanner-person-header">
                            <h4 className="scanner-person-name">{personData.nombre}</h4>
                            <span className={`scanner-status-badge scanner-status-${personData.estatus?.toLowerCase().replace(' ', '-')}`}>
                                {personData.estatus}
                            </span>
                        </div>

                        <div className="scanner-person-details">
                            <div className="scanner-detail-row">
                                <span className="scanner-detail-label">ID:</span>
                                <span className="scanner-detail-value">{personData.id}</span>
                            </div>

                            <div className="scanner-detail-row">
                                <span className="scanner-detail-label">Folio:</span>
                                <span className="scanner-detail-value">{personData.folio || 'Sin asignar'}</span>
                            </div>

                            {personData.folio_anterior && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Folio Anterior:</span>
                                    <span className="scanner-detail-value">{personData.folio_anterior}</span>
                                </div>
                            )}

                            <div className="scanner-detail-row">
                                <span className="scanner-detail-label">Mes:</span>
                                <span className="scanner-detail-value">{personData.mes}</span>
                            </div>

                            {personData.año && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Año:</span>
                                    <span className="scanner-detail-value">{personData.año}</span>
                                </div>
                            )}

                            <div className="scanner-detail-row">
                                <span className="scanner-detail-label">Tipo:</span>
                                <span className={`scanner-origin-badge scanner-origin-${personData.origen}`}>
                                    {personData.origen}
                                </span>
                            </div>

                            {/* Mostrar sección de documentos solo para inscripciones */}
                            {personData.origen === 'inscripcion' && (
                                <>
                                    <div className="scanner-documents-section">
                                        <h5 className="scanner-documents-title">📄 Estado de Documentos</h5>

                                        <div className="scanner-documents-grid">
                                            <div className="scanner-document-item">
                                                <span className="scanner-document-label">Cédula:</span>
                                                <span className={`scanner-document-status ${personData.cedula === 1 ? 'scanner-delivered' : 'scanner-pending'}`}>
                                                    {formatDocumentoStatus(personData.cedula)}
                                                </span>
                                            </div>

                                            <div className="scanner-document-item">
                                                <span className="scanner-document-label">Certificado Médico:</span>
                                                <span className={`scanner-document-status ${personData.certificado_medico === 1 ? 'scanner-delivered' : 'scanner-pending'}`}>
                                                    {formatDocumentoStatus(personData.certificado_medico)}
                                                </span>
                                            </div>

                                            <div className="scanner-document-item">
                                                <span className="scanner-document-label">CURP:</span>
                                                <span className={`scanner-document-status ${personData.curp === 1 ? 'scanner-delivered' : 'scanner-pending'}`}>
                                                    {formatDocumentoStatus(personData.curp)}
                                                </span>
                                            </div>

                                            <div className="scanner-document-item">
                                                <span className="scanner-document-label">INE:</span>
                                                <span className={`scanner-document-status ${personData.ine === 1 ? 'scanner-delivered' : 'scanner-pending'}`}>
                                                    {formatDocumentoStatus(personData.ine)}
                                                </span>
                                            </div>

                                            <div className="scanner-document-item">
                                                <span className="scanner-document-label">Comprobante Domicilio:</span>
                                                <span className={`scanner-document-status ${personData.comprobante_domicilio === 1 ? 'scanner-delivered' : 'scanner-pending'}`}>
                                                    {formatDocumentoStatus(personData.comprobante_domicilio)}
                                                </span>
                                            </div>

                                            <div className="scanner-document-item">
                                                <span className="scanner-document-label">Donativo:</span>
                                                <span className={`scanner-document-status ${personData.donativo === 1 ? 'scanner-delivered' : 'scanner-pending'}`}>
                                                    {formatDocumentoStatus(personData.donativo)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {personData.horario && personData.horario.trim() !== '' && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Horario:</span>
                                    <span className="scanner-detail-value">{personData.horario}</span>
                                </div>
                            )}

                            {personData.monto && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Monto:</span>
                                    <span className="scanner-detail-value scanner-amount">
                                        {formatMonto(personData.monto)}
                                    </span>
                                </div>
                            )}

                            {personData.forma_pago && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Forma de Pago:</span>
                                    <span className="scanner-detail-value">{personData.forma_pago}</span>
                                </div>
                            )}

                            {(personData.numero_telefonico || personData.telefono) && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Teléfono:</span>
                                    <span className="scanner-detail-value">
                                        <a href={`tel:${personData.numero_telefonico || personData.telefono}`} className="scanner-phone-link">
                                            {personData.numero_telefonico || personData.telefono}
                                        </a>
                                    </span>
                                </div>
                            )}

                            {personData.fecha_ingreso && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Fecha Ingreso:</span>
                                    <span className="scanner-detail-value">
                                        {new Date(personData.fecha_ingreso).toLocaleDateString('es-MX')}
                                    </span>
                                </div>
                            )}

                            {personData.atendido_por && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Atendido por:</span>
                                    <span className="scanner-detail-value">{personData.atendido_por}</span>
                                </div>
                            )}

                            {personData.es_bacho !== null && personData.es_bacho !== undefined && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Es Bacho:</span>
                                    <span className={`scanner-bacho-badge ${personData.es_bacho ? 'scanner-bacho-yes' : 'scanner-bacho-no'}`}>
                                        {personData.es_bacho ? 'Sí' : 'No'}
                                    </span>
                                </div>
                            )}

                            {personData.documentos_id && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Documentos ID:</span>
                                    <span className="scanner-detail-value">{personData.documentos_id}</span>
                                </div>
                            )}

                            {personData.inscripcion && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Tipo Inscripción:</span>
                                    <span className="scanner-detail-value">{personData.inscripcion}</span>
                                </div>
                            )}

                            {personData.editor_id && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Editor ID:</span>
                                    <span className="scanner-detail-value">{personData.editor_id}</span>
                                </div>
                            )}

                            {personData.comentarios && (
                                <div className="scanner-detail-row scanner-comments">
                                    <span className="scanner-detail-label">Comentarios:</span>
                                    <span className="scanner-detail-value">{personData.comentarios}</span>
                                </div>
                            )}

                            {personData.created_at && (
                                <div className="scanner-detail-row">
                                    <span className="scanner-detail-label">Fecha Creación:</span>
                                    <span className="scanner-detail-value">
                                        {new Date(personData.created_at).toLocaleDateString('es-MX')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QRScanner;