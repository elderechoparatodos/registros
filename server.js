const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad y optimización
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(compression());
// Configuración de CORS para producción
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (aplicaciones móviles, etc.)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir localhost
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En producción, permitir dominios específicos
    const allowedOrigins = [
      'https://elprofecharles.framer.website',
      'https://www.khanacademy.org',
      'https://www.coursera.org',
      'https://www.udemy.com'
    ];
    
    // Si hay CORS_ORIGIN específico, usarlo
    if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
      allowedOrigins.push(process.env.CORS_ORIGIN);
    }
    
    // Permitir cualquier subdominio de railway.app
    if (origin.includes('.railway.app') || origin.includes('.up.railway.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.CORS_ORIGIN === '*') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user_registration_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB exitosamente');
})
.catch((error) => {
  console.error('❌ Error conectando a MongoDB:', error);
});

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de health check para Railway
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta principal - servir la SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para cualquier otra petición - servir la SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : {}
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Aplicación disponible en: http://localhost:${PORT}`);
}); 