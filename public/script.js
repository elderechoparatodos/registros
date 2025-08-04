// Configuración de la API - Detección automática del entorno
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    PROFILE: '/api/users/profile',
    LOGOUT: '/api/users/logout',
    STATS: '/api/users/stats',
    LISTS: '/api/auth/lists'
};

// Detectar si estamos en producción
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1';

console.log(`🌍 Entorno detectado: ${isProduction ? 'Producción' : 'Desarrollo'}`);
console.log(`🔗 API Base URL: ${API_BASE_URL}`);

// Variables globales
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let departamentos = [];
let nivelesAcademicos = [];

// URLs de redirección (configurables)
const REDIRECT_URLS = {
    DEFAULT: 'https://elprofecharles.framer.website/',
    SCHOOL: 'https://www.khanacademy.org',
    COURSERA: 'https://www.coursera.org',
    UDEMY: 'https://www.udemy.com'
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Función principal de inicialización
function initializeApp() {
    setupEventListeners();
    setupNavigation();
    checkAuthStatus();
    setupFormValidation();
    loadLists();
}

// Configurar event listeners
function setupEventListeners() {
    // Formularios
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Navegación móvil
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }
    
    // Cerrar menú móvil al hacer clic en enlaces
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('show');
            }
        });
    });
    
    // Cerrar modales al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Configurar navegación
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remover clase active de todos los enlaces
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Agregar clase active al enlace clickeado
            link.classList.add('active');
            
            // Scroll suave a la sección
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Verificar estado de autenticación
async function checkAuthStatus() {
    if (!authToken) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.VERIFY}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.data.user;
            showSuccessSection();
        } else {
            // Token inválido, limpiar
            clearAuth();
        }
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        clearAuth();
    }
}

// Configurar validación de formularios
function setupFormValidation() {
    // Validación en tiempo real para campos de registro
    const registerInputs = document.querySelectorAll('#registerForm input');
    const registerSelects = document.querySelectorAll('#registerForm select');
    
    registerInputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });
    
    registerSelects.forEach(select => {
        select.addEventListener('change', () => {
            validateField(select);
        });
        
        select.addEventListener('blur', () => {
            validateField(select);
        });
    });
    
    // Validación en tiempo real para campos de login
    const loginInputs = document.querySelectorAll('#loginForm input');
    
    loginInputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        input.addEventListener('input', () => {
            clearFieldError(input);
        });
    });
}

// Validar campo individual
function validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    const errorElement = document.getElementById(`${input.id}Error`);
    
    if (!errorElement) return;
    
    let isValid = true;
    let errorMessage = '';
    
    switch (fieldName) {
        case 'nombreCompleto':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'El nombre debe tener al menos 2 caracteres';
            } else if (value.length > 100) {
                isValid = false;
                errorMessage = 'El nombre no puede tener más de 100 caracteres';
            }
            break;
            
        case 'documento':
            if (!/^[0-9A-Za-z]{5,20}$/.test(value)) {
                isValid = false;
                errorMessage = 'El documento debe tener entre 5 y 20 caracteres alfanuméricos';
            }
            break;
            
        case 'telefono':
            if (!/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un número de teléfono válido';
            }
            break;
            
        case 'correo':
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Ingrese un correo electrónico válido';
            }
            break;
            
        case 'profesion':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'La profesión debe tener al menos 2 caracteres';
            } else if (value.length > 100) {
                isValid = false;
                errorMessage = 'La profesión no puede tener más de 100 caracteres';
            }
            break;
            
        case 'ciudad':
            if (value.length < 2) {
                isValid = false;
                errorMessage = 'La ciudad debe tener al menos 2 caracteres';
            } else if (value.length > 100) {
                isValid = false;
                errorMessage = 'La ciudad no puede tener más de 100 caracteres';
            }
            break;
            
        case 'departamento':
            if (!value || value === '') {
                isValid = false;
                errorMessage = 'Debe seleccionar un departamento';
            }
            break;
            
        case 'nivelAcademico':
            if (!value || value === '') {
                isValid = false;
                errorMessage = 'Debe seleccionar un nivel académico';
            }
            break;
            
        case 'consentimiento':
            if (!input.checked) {
                isValid = false;
                errorMessage = 'Debe aceptar el consentimiento para continuar';
            }
            break;
    }
    
    if (!isValid) {
        showFieldError(input, errorMessage);
    } else {
        clearFieldError(input);
    }
    
    return isValid;
}

// Mostrar error de campo
function showFieldError(input, message) {
    const errorElement = document.getElementById(`${input.id}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        input.classList.add('error');
    }
}

// Limpiar error de campo
function clearFieldError(input) {
    const errorElement = document.getElementById(`${input.id}Error`);
    if (errorElement) {
        errorElement.textContent = '';
        input.classList.remove('error');
    }
}

// Validar formulario completo
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required]');
    const selects = form.querySelectorAll('select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    selects.forEach(select => {
        if (!validateField(select)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Mostrar formulario de login
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' });
}

// Mostrar formulario de registro
function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('authSection').scrollIntoView({ behavior: 'smooth' });
}

// Manejar login
async function handleLogin(e) {
    e.preventDefault();
    
    if (!validateForm('loginFormElement')) {
        return;
    }
    
    const formData = new FormData(e.target);
    const loginData = {
        documento: formData.get('documento').trim()
    };
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login exitoso
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('authToken', authToken);
            
            showSuccessMessage('Inicio de sesión exitoso');
            showSuccessSection();
        } else {
            // Error en login
            showErrorMessage(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showErrorMessage('Error de conexión. Intente nuevamente.');
    } finally {
        showLoading(false);
    }
}

// Manejar registro
async function handleRegister(e) {
    e.preventDefault();
    
    if (!validateForm('registerFormElement')) {
        return;
    }
    
    const formData = new FormData(e.target);
    const registerData = {
        nombreCompleto: formData.get('nombreCompleto').trim(),
        documento: formData.get('documento').trim(),
        telefono: formData.get('telefono').trim(),
        correo: formData.get('correo').trim(),
        profesion: formData.get('profesion').trim(),
        ciudad: formData.get('ciudad').trim(),
        departamento: formData.get('departamento'),
        nivelAcademico: formData.get('nivelAcademico'),
        consentimiento: formData.get('consentimiento') === 'on'
    };
    
    showLoading(true);
    
    try {
        console.log('Enviando datos de registro:', registerData);
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });
        
        console.log('Respuesta del servidor:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('Datos de respuesta:', data);
        
        if (response.ok) {
            // Registro exitoso
            authToken = data.data.token;
            currentUser = data.data.user;
            localStorage.setItem('authToken', authToken);
            
            showSuccessMessage('Usuario registrado exitosamente');
            showSuccessSection();
        } else {
            // Error en registro
            console.error('Error en registro:', data);
            if (data.errors && data.errors.length > 0) {
                // Mostrar errores específicos de campos
                data.errors.forEach(error => {
                    const fieldName = error.path;
                    const fieldId = `register${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`;
                    const field = document.getElementById(fieldId);
                    if (field) {
                        showFieldError(field, error.msg);
                    }
                });
            } else {
                showErrorMessage(data.message || 'Error al registrar usuario');
            }
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showErrorMessage('Error de conexión. Intente nuevamente.');
    } finally {
        showLoading(false);
    }
}

// Mostrar sección de éxito
function showSuccessSection() {
    const hero = document.getElementById('hero');
    const authSection = document.getElementById('authSection');
    const successSection = document.getElementById('successSection');
    
    if (hero) hero.style.display = 'none';
    if (authSection) authSection.style.display = 'none';
    if (successSection) successSection.style.display = 'block';
    
    // Mostrar información del usuario
    if (currentUser) {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="user-details">
                    <p><strong>Nombre:</strong> ${currentUser.nombreCompleto}</p>
                    <p><strong>Documento:</strong> ${currentUser.documento}</p>
                    <p><strong>Profesión:</strong> ${currentUser.profesion}</p>
                    <p><strong>Ciudad:</strong> ${currentUser.ciudad || 'No especificada'}</p>
                    <p><strong>Departamento:</strong> ${currentUser.departamento || 'No especificado'}</p>
                    <p><strong>Nivel Académico:</strong> ${currentUser.nivelAcademico || 'No especificado'}</p>
                </div>
            `;
        }
    }
}

// Redirigir a plataforma
function redirectToPlatform() {
    const redirectUrl = REDIRECT_URLS.DEFAULT;
    // Abrir en nueva pestaña
    window.open(redirectUrl, '_blank');
}

// Redirigir ahora (botón manual)
function redirectNow() {
    redirectToPlatform();
}

// Mostrar mensaje de éxito
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
    }
}

// Mostrar mensaje de error
function showErrorMessage(message) {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Remover automáticamente después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Mostrar loading
function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

// Limpiar autenticación
function clearAuth() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
}

// Mostrar modal de consentimiento
function showConsentimiento() {
    const modal = document.getElementById('consentimientoModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Cerrar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Mostrar política de privacidad (placeholder)
function showPrivacyPolicy() {
    alert('Política de Privacidad: Esta funcionalidad se implementará próximamente.');
}

// Mostrar términos de servicio (placeholder)
function showTerms() {
    alert('Términos de Servicio: Esta funcionalidad se implementará próximamente.');
}

// Función para hacer logout
async function logout() {
    if (!authToken) return;
    
    try {
        await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error en logout:', error);
    } finally {
        clearAuth();
        window.location.reload();
    }
}

// Función para obtener estadísticas (solo para desarrollo)
async function getStats() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.STATS}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('Estadísticas:', data.data);
        }
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
    }
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para validar documento
function isValidDocument(document) {
    const documentRegex = /^[0-9A-Za-z]{5,20}$/;
    return documentRegex.test(document);
}

// Función para validar teléfono
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone);
}

// Función para formatear teléfono
function formatPhone(phone) {
    // Remover todos los caracteres no numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formatear según la longitud
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
        return `+${cleaned.slice(0,1)} (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
}

// Función para capitalizar texto
function capitalizeText(text) {
    return text
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Función para generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Función para detectar dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función para detectar conexión lenta
function isSlowConnection() {
    return navigator.connection && 
           (navigator.connection.effectiveType === 'slow-2g' || 
            navigator.connection.effectiveType === '2g');
}

// Función para optimizar imágenes en conexiones lentas
function optimizeImages() {
    if (isSlowConnection()) {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });
    }
}

// Función para manejar errores de red
function handleNetworkError(error) {
    console.error('Error de red:', error);
    
    if (!navigator.onLine) {
        showErrorMessage('Sin conexión a internet. Verifique su conexión.');
    } else {
        showErrorMessage('Error de conexión. Intente nuevamente.');
    }
}

// Función para guardar datos en localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
    }
}

// Función para obtener datos de localStorage
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error obteniendo de localStorage:', error);
        return null;
    }
}

// Función para limpiar localStorage
function clearLocalStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error limpiando localStorage:', error);
    }
}

// Función para resetear la aplicación al estado inicial
function resetApp() {
    // Limpiar datos
    clearAuth();
    clearLocalStorage();
    
    // Mostrar sección inicial
    const hero = document.getElementById('hero');
    const authSection = document.getElementById('authSection');
    const successSection = document.getElementById('successSection');
    
    if (hero) hero.style.display = 'block';
    if (authSection) authSection.style.display = 'block';
    if (successSection) successSection.style.display = 'none';
    
    // Limpiar formularios
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    
    // Limpiar errores
    document.querySelectorAll('.form-error').forEach(error => {
        error.textContent = '';
    });
    
    // Mostrar formulario de login por defecto
    showLoginForm();
}

// Función para copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccessMessage('Copiado al portapapeles');
    } catch (error) {
        console.error('Error copiando al portapapeles:', error);
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSuccessMessage('Copiado al portapapeles');
    }
}

// Función para descargar archivo
function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Función para obtener parámetros de URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Función para establecer parámetros de URL
function setUrlParams(params) {
    const url = new URL(window.location);
    Object.keys(params).forEach(key => {
        url.searchParams.set(key, params[key]);
    });
    window.history.pushState({}, '', url);
}

// Función para remover parámetros de URL
function removeUrlParams(keys) {
    const url = new URL(window.location);
    keys.forEach(key => {
        url.searchParams.delete(key);
    });
    window.history.pushState({}, '', url);
}

// Función para cargar listas de departamentos y niveles académicos
async function loadLists() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LISTS}`);
        if (response.ok) {
            const data = await response.json();
            departamentos = data.data.departamentos;
            nivelesAcademicos = data.data.nivelesAcademicos;
            
            // Poblar los selects
            populateSelect('registerDepartamento', departamentos, 'Selecciona un departamento');
            populateSelect('registerNivelAcademico', nivelesAcademicos, 'Selecciona tu nivel académico');
        } else {
            console.error('Error cargando listas:', response.statusText);
        }
    } catch (error) {
        console.error('Error cargando listas:', error);
        // Usar listas por defecto en caso de error
        loadDefaultLists();
    }
}

// Función para poblar un select con opciones
function populateSelect(selectId, options, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Limpiar opciones existentes excepto la primera
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Agregar nuevas opciones
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Función para cargar listas por defecto en caso de error
function loadDefaultLists() {
    const defaultDepartamentos = [
        'AMAZONAS', 'ANTIOQUIA', 'ARAUCA', 'ATLANTICO', 'BOLIVAR', 'BOYACA', 'CALDAS', 
        'CAQUETA', 'CAUCA', 'CASANARE', 'CESAR', 'CHOCO', 'CUNDINAMARCA', 'CORDOBA', 
        'GUAINIA', 'GUAVIARE', 'HUILA', 'LA GUAJIRA', 'MAGDALENA', 'META', 'NARIÑO', 
        'NORTE DE SANTANDER', 'PUTUMAYO', 'QUINDIO', 'RISARALDA', 'SANTAFE DE BOGOTA DC', 
        'SANTANDER', 'SUCRE', 'TOLIMA', 'VALLE DEL CAUCA', 'VAUPES', 'VICHADA', 
        'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA', 'OTRO'
    ];
    
    const defaultNivelesAcademicos = [
        'Bachiller', 'Técnico', 'Tecnólogo', 'Pregrado', 'Profesional', 'Especialización', 
        'Maestría', 'Doctorado', 'Postdoctorado', 'Otro'
    ];
    
    populateSelect('registerDepartamento', defaultDepartamentos, 'Selecciona un departamento');
    populateSelect('registerNivelAcademico', defaultNivelesAcademicos, 'Selecciona tu nivel académico');
}

// Función para detectar cambios en el tamaño de ventana
const handleResize = debounce(() => {
    // Ajustar elementos según el tamaño de ventana
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}, 250);

window.addEventListener('resize', handleResize);

// Función para detectar cambios en la conexión
window.addEventListener('online', () => {
    console.log('Conexión restaurada');
    // Aquí podrías reintentar operaciones fallidas
});

window.addEventListener('offline', () => {
    console.log('Conexión perdida');
    showErrorMessage('Sin conexión a internet');
});

// Función para manejar errores no capturados
window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
    showErrorMessage('Ha ocurrido un error inesperado');
});

// Función para manejar promesas rechazadas
window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
    showErrorMessage('Error en la aplicación');
});

// Exportar funciones para uso global
window.app = {
    showLoginForm,
    showRegisterForm,
    logout,
    getStats,
    copyToClipboard,
    downloadFile,
    getUrlParams,
    setUrlParams,
    removeUrlParams
}; 