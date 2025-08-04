const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId);

    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: req.user.toPublicJSON()
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// PUT /api/users/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { nombreCompleto, telefono, correo, profesion } = req.body;
    const updateData = {};

    // Solo permitir actualizar ciertos campos
    if (nombreCompleto) updateData.nombreCompleto = nombreCompleto;
    if (telefono) updateData.telefono = telefono;
    if (correo) updateData.correo = correo;
    if (profesion) updateData.profesion = profesion;

    // Verificar si el correo ya existe (si se está actualizando)
    if (correo && correo !== req.user.correo) {
      const existingUser = await User.findOne({ correo });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con este correo electrónico'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: updatedUser.toPublicJSON()
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// POST /api/users/logout - Cerrar sesión
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // En una implementación más robusta, podrías invalidar el token
    // Por ahora, solo actualizamos el último acceso
    await req.user.actualizarUltimoAcceso();

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/stats - Estadísticas básicas (solo para desarrollo)
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ activo: true });
    const todayUsers = await User.countDocuments({
      fechaRegistro: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        todayUsers,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router; 