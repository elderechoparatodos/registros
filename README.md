# Plataforma de Registro Educativo

Una aplicación web moderna para capturar datos de usuarios con consentimiento y redirigirlos a plataformas educativas. Desarrollada con Node.js, Express, MongoDB Atlas y una interfaz moderna con HTML, CSS y JavaScript.

## 🚀 Características

- **Registro de Usuarios**: Captura de datos completos con validación
- **Login Simplificado**: Acceso solo con documento de identidad
- **Interfaz Moderna**: Diseño responsivo y atractivo
- **Validación en Tiempo Real**: Feedback inmediato al usuario
- **Consentimiento Informado**: Cumplimiento con regulaciones de datos
- **Redirección Automática**: Integración con plataformas educativas
- **Base de Datos Segura**: MongoDB Atlas con validaciones robustas
- **API RESTful**: Backend escalable y bien estructurado
- **Despliegue en Railway**: Configurado para producción

## 🌐 Despliegue en Producción

Esta aplicación está configurada para desplegarse en **Railway** con **MongoDB Atlas**.

### Variables de Entorno Requeridas:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/user_registration_db
JWT_SECRET=tu_jwt_secret_super_seguro
DEFAULT_REDIRECT_URL=https://elprofecharles.framer.website/
NODE_ENV=production
```

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **MongoDB Atlas** (cuenta gratuita o premium)
- **Railway Account** (plan PRO recomendado)
- **Git** para control de versiones

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd register
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración de MongoDB
MONGODB_URI=mongodb://localhost:27017/user_registration_db

# Puerto del servidor
PORT=3000

# JWT Secret (cambiar en producción)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui

# URL de redirección por defecto
DEFAULT_REDIRECT_URL=https://www.youtube.com

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Configurar MongoDB

#### Opción A: MongoDB Local

1. Instala MongoDB en tu sistema
2. Inicia el servicio de MongoDB
3. Crea la base de datos: `user_registration_db`

#### Opción B: MongoDB Atlas (Recomendado para producción)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster gratuito
3. Obtén la cadena de conexión
4. Reemplaza `MONGODB_URI` en el archivo `.env`

### 5. Ejecutar la aplicación

#### Desarrollo
```bash
npm run dev
```

#### Producción
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 📁 Estructura del Proyecto

```
register/
├── models/
│   └── User.js              # Modelo de usuario con Mongoose
├── routes/
│   ├── auth.js              # Rutas de autenticación
│   └── users.js             # Rutas de usuarios
├── public/
│   ├── index.html           # Página principal
│   ├── styles.css           # Estilos CSS
│   └── script.js            # JavaScript del frontend
├── server.js                # Servidor principal
├── package.json             # Dependencias y scripts
├── env.example              # Variables de entorno de ejemplo
└── README.md                # Este archivo
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGODB_URI` | URL de conexión a MongoDB | `mongodb://localhost:27017/user_registration_db` |
| `PORT` | Puerto del servidor | `3000` |
| `JWT_SECRET` | Clave secreta para JWT | `mi_clave_secreta_super_segura` |
| `DEFAULT_REDIRECT_URL` | URL de redirección por defecto | `https://www.youtube.com` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

### Configuración de Redirección

Puedes modificar las URLs de redirección en el archivo `public/script.js`:

```javascript
const REDIRECT_URLS = {
    DEFAULT: 'https://www.youtube.com',
    SCHOOL: 'https://www.khanacademy.org',
    COURSERA: 'https://www.coursera.org',
    UDEMY: 'https://www.udemy.com'
};
```

## 🌐 Despliegue

### Opción 1: Heroku

1. **Crear cuenta en Heroku**
2. **Instalar Heroku CLI**
3. **Configurar aplicación**:

```bash
# Login a Heroku
heroku login

# Crear aplicación
heroku create tu-app-name

# Configurar variables de entorno
heroku config:set MONGODB_URI=tu_mongodb_atlas_uri
heroku config:set JWT_SECRET=tu_jwt_secret
heroku config:set NODE_ENV=production

# Desplegar
git push heroku main
```

### Opción 2: Vercel

1. **Crear cuenta en Vercel**
2. **Conectar repositorio de GitHub**
3. **Configurar variables de entorno en el dashboard**
4. **Desplegar automáticamente**

### Opción 3: Railway

1. **Crear cuenta en Railway**
2. **Conectar repositorio**
3. **Configurar variables de entorno**
4. **Desplegar automáticamente**

### Opción 4: DigitalOcean App Platform

1. **Crear cuenta en DigitalOcean**
2. **Conectar repositorio**
3. **Configurar variables de entorno**
4. **Desplegar**

## 🔒 Seguridad

### Configuraciones Implementadas

- **Helmet.js**: Headers de seguridad
- **CORS**: Configuración de origen cruzado
- **Validación de Entrada**: Sanitización de datos
- **JWT**: Autenticación segura
- **MongoDB**: Validaciones a nivel de base de datos
- **Rate Limiting**: Protección contra ataques de fuerza bruta

### Recomendaciones de Producción

1. **Cambiar JWT_SECRET**: Usa una clave secreta fuerte y única
2. **Configurar HTTPS**: Usa certificados SSL
3. **MongoDB Atlas**: Usa una base de datos en la nube
4. **Variables de Entorno**: Nunca subas credenciales al repositorio
5. **Logs**: Implementa logging para monitoreo
6. **Backup**: Configura backups automáticos de la base de datos

## 📊 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar nuevo usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/verify` | Verificar token |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/profile` | Obtener perfil del usuario |
| PUT | `/api/users/profile` | Actualizar perfil |
| POST | `/api/users/logout` | Cerrar sesión |
| GET | `/api/users/stats` | Estadísticas (solo desarrollo) |

### Ejemplo de Uso

```javascript
// Registrar usuario
const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        nombreCompleto: 'Juan Pérez',
        documento: '12345678',
        telefono: '+1234567890',
        correo: 'juan@ejemplo.com',
        profesion: 'Desarrollador',
        consentimiento: true
    })
});
```

## 🎨 Personalización

### Colores y Estilos

Modifica las variables CSS en `public/styles.css`:

```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #64748b;
    --accent-color: #f59e0b;
    /* ... más variables */
}
```

### Logo y Branding

1. Reemplaza el favicon en `public/favicon.ico`
2. Modifica el logo en `public/index.html`
3. Actualiza la información de contacto

### Textos y Contenido

Edita los textos en `public/index.html` y `public/script.js` según tus necesidades.

## 🧪 Testing

### Pruebas Manuales

1. **Registro de Usuario**:
   - Completa el formulario con datos válidos
   - Verifica validaciones en tiempo real
   - Confirma redirección exitosa

2. **Login de Usuario**:
   - Usa un documento registrado
   - Verifica acceso exitoso
   - Prueba con documento inexistente

3. **Validaciones**:
   - Prueba campos requeridos
   - Verifica formatos de email y teléfono
   - Confirma mensajes de error

### Pruebas de API

```bash
# Usar Postman o curl para probar endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombreCompleto":"Test User","documento":"12345","telefono":"1234567890","correo":"test@test.com","profesion":"Tester","consentimiento":true}'
```

## 📈 Monitoreo y Analytics

### Logs del Servidor

Los logs se muestran en la consola. Para producción, considera usar servicios como:
- **Winston** para logging estructurado
- **Sentry** para monitoreo de errores
- **Google Analytics** para métricas de usuarios

### Métricas de Base de Datos

```javascript
// Obtener estadísticas básicas
GET /api/users/stats
```

## 🔧 Mantenimiento

### Actualizaciones

1. **Dependencias**: `npm update`
2. **Node.js**: Mantén la versión actualizada
3. **MongoDB**: Actualiza según recomendaciones

### Backups

```bash
# Backup de MongoDB
mongodump --uri="tu_mongodb_uri" --out=./backup

# Restaurar backup
mongorestore --uri="tu_mongodb_uri" ./backup
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de conexión a MongoDB**:
   - Verifica la URI de conexión
   - Confirma que MongoDB esté ejecutándose
   - Revisa credenciales de Atlas

2. **Error de CORS**:
   - Verifica `CORS_ORIGIN` en variables de entorno
   - Confirma que el dominio esté permitido

3. **Error de JWT**:
   - Verifica `JWT_SECRET` en variables de entorno
   - Confirma que el token no haya expirado

4. **Error de validación**:
   - Revisa los formatos de entrada
   - Confirma que todos los campos requeridos estén completos

### Logs de Debug

```bash
# Ejecutar con logs detallados
DEBUG=* npm run dev
```

## 📞 Soporte

Para soporte técnico o preguntas:

- **Email**: soporte@tuempresa.com
- **Documentación**: [Wiki del proyecto]
- **Issues**: [GitHub Issues]

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✅ Registro de usuarios con validación completa
- ✅ Login simplificado con documento
- ✅ Interfaz moderna y responsiva
- ✅ Integración con MongoDB
- ✅ API RESTful completa
- ✅ Redirección a plataformas educativas
- ✅ Consentimiento informado
- ✅ Validaciones en tiempo real

---

**¡Gracias por usar nuestra plataforma! 🎉** 