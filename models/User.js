const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Lista de departamentos de Colombia
const DEPARTAMENTOS = [
  'AMAZONAS', 'ANTIOQUIA', 'ARAUCA', 'ATLANTICO', 'BOLIVAR', 'BOYACA', 'CALDAS', 
  'CAQUETA', 'CAUCA', 'CASANARE', 'CESAR', 'CHOCO', 'CUNDINAMARCA', 'CORDOBA', 
  'GUAINIA', 'GUAVIARE', 'HUILA', 'LA GUAJIRA', 'MAGDALENA', 'META', 'NARIÑO', 
  'NORTE DE SANTANDER', 'PUTUMAYO', 'QUINDIO', 'RISARALDA', 'SANTAFE DE BOGOTA DC', 
  'SANTANDER', 'SUCRE', 'TOLIMA', 'VALLE DEL CAUCA', 'VAUPES', 'VICHADA', 
  'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA', 'OTRO'
];

// Lista de niveles académicos
const NIVELES_ACADEMICOS = [
  'Bachiller', 'Técnico', 'Tecnólogo', 'Pregrado', 'Profesional', 'Especialización', 
  'Maestría', 'Doctorado', 'Postdoctorado', 'Otro'
];

const userSchema = new mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: [true, 'El nombre completo es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  documento: {
    type: String,
    required: [true, 'El documento es obligatorio'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Validar que sea un documento válido (números y letras)
        return /^[0-9A-Za-z]{5,20}$/.test(v);
      },
      message: 'El documento debe tener entre 5 y 20 caracteres alfanuméricos'
    }
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    validate: {
      validator: function(v) {
        // Validar formato de teléfono
        return /^[\+]?[0-9\s\-\(\)]{7,15}$/.test(v);
      },
      message: 'Ingrese un número de teléfono válido'
    }
  },
  correo: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Ingrese un correo electrónico válido'
    }
  },
  profesion: {
    type: String,
    required: [true, 'La profesión es obligatoria'],
    trim: true,
    maxlength: [100, 'La profesión no puede tener más de 100 caracteres']
  },
  ciudad: {
    type: String,
    required: [true, 'La ciudad es obligatoria'],
    trim: true,
    maxlength: [100, 'La ciudad no puede tener más de 100 caracteres']
  },
  departamento: {
    type: String,
    required: [true, 'El departamento es obligatorio'],
    enum: {
      values: DEPARTAMENTOS,
      message: 'Debe seleccionar un departamento válido'
    }
  },
  nivelAcademico: {
    type: String,
    required: [true, 'El nivel académico es obligatorio'],
    enum: {
      values: NIVELES_ACADEMICOS,
      message: 'Debe seleccionar un nivel académico válido'
    }
  },
  consentimiento: {
    type: Boolean,
    required: [true, 'Debe aceptar el consentimiento'],
    default: false,
    validate: {
      validator: function(v) {
        return v === true;
      },
      message: 'Debe aceptar el consentimiento para continuar'
    }
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  },
  ultimoAcceso: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
userSchema.index({ documento: 1 });
userSchema.index({ correo: 1 });
userSchema.index({ fechaRegistro: -1 });
userSchema.index({ departamento: 1 });
userSchema.index({ ciudad: 1 });
userSchema.index({ nivelAcademico: 1 });

// Método para actualizar último acceso
userSchema.methods.actualizarUltimoAcceso = function() {
  this.ultimoAcceso = new Date();
  return this.save();
};

// Método para obtener datos públicos (sin información sensible)
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  return {
    id: userObject._id,
    nombreCompleto: userObject.nombreCompleto,
    documento: userObject.documento,
    profesion: userObject.profesion,
    ciudad: userObject.ciudad,
    departamento: userObject.departamento,
    nivelAcademico: userObject.nivelAcademico,
    fechaRegistro: userObject.fechaRegistro,
    ultimoAcceso: userObject.ultimoAcceso
  };
};

// Middleware pre-save para validaciones adicionales
userSchema.pre('save', function(next) {
  // Capitalizar nombre completo
  if (this.nombreCompleto) {
    this.nombreCompleto = this.nombreCompleto
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Capitalizar profesión
  if (this.profesion) {
    this.profesion = this.profesion.charAt(0).toUpperCase() + this.profesion.slice(1).toLowerCase();
  }

  // Capitalizar ciudad
  if (this.ciudad) {
    this.ciudad = this.ciudad.charAt(0).toUpperCase() + this.ciudad.slice(1).toLowerCase();
  }
  
  next();
});

// Exportar las listas para uso en otros archivos
userSchema.statics.DEPARTAMENTOS = DEPARTAMENTOS;
userSchema.statics.NIVELES_ACADEMICOS = NIVELES_ACADEMICOS;

module.exports = mongoose.model('User', userSchema); 