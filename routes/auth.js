const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware para validar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', [
  body('nombreCompleto')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre completo debe tener entre 2 y 100 caracteres'),
  
  body('documento')
    .trim()
    .isLength({ min: 5, max: 20 })
    .matches(/^[0-9A-Za-z]{5,20}$/)
    .withMessage('El documento debe tener entre 5 y 20 caracteres alfanuméricos'),
  
  body('telefono')
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{7,15}$/)
    .withMessage('Ingrese un número de teléfono válido'),
  
  body('correo')
    .isEmail()
    .normalizeEmail()
    .withMessage('Ingrese un correo electrónico válido'),
  
  body('profesion')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La profesión debe tener entre 2 y 100 caracteres'),
  
  body('ciudad')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  
  body('departamento')
    .trim()
    .isIn(User.DEPARTAMENTOS)
    .withMessage('Debe seleccionar un departamento válido'),
  
  body('nivelAcademico')
    .trim()
    .isIn(User.NIVELES_ACADEMICOS)
    .withMessage('Debe seleccionar un nivel académico válido'),
  
  body('consentimiento')
    .isBoolean()
    .custom(value => value === true)
    .withMessage('Debe aceptar el consentimiento para continuar'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { 
      nombreCompleto, 
      documento, 
      telefono, 
      correo, 
      profesion, 
      ciudad,
      departamento,
      nivelAcademico,
      consentimiento 
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ documento }, { correo }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.documento === documento 
          ? 'Ya existe un usuario con este documento' 
          : 'Ya existe un usuario con este correo electrónico'
      });
    }

    // Crear nuevo usuario
    const newUser = new User({
      nombreCompleto,
      documento,
      telefono,
      correo,
      profesion,
      ciudad,
      departamento,
      nivelAcademico,
      consentimiento
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { userId: newUser._id, documento: newUser.documento },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: newUser.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/auth/login - Iniciar sesión con documento
router.post('/login', [
  body('documento')
    .trim()
    .isLength({ min: 5, max: 20 })
    .matches(/^[0-9A-Za-z]{5,20}$/)
    .withMessage('El documento debe tener entre 5 y 20 caracteres alfanuméricos'),
  
  handleValidationErrors
], async (req, res) => {
  try {
    const { documento } = req.body;

    // Buscar usuario por documento
    const user = await User.findOne({ documento, activo: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado. Por favor, regístrese primero.'
      });
    }

    // Actualizar último acceso
    await user.actualizarUltimoAcceso();

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, documento: user.documento },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.toPublicJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// GET /api/auth/verify - Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        user: user.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// GET /api/auth/lists - Obtener listas de departamentos y niveles académicos
router.get('/lists', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        departamentos: User.DEPARTAMENTOS,
        nivelesAcademicos: User.NIVELES_ACADEMICOS
      }
    });
  } catch (error) {
    console.error('Error obteniendo listas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router; 