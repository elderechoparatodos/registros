# 🚨 CHECKLIST PRE-DESPLIEGUE

## Variables de Entorno que DEBES configurar en Railway:

### 🔐 SEGURIDAD
- [ ] JWT_SECRET: Cambiar por una clave fuerte de 32+ caracteres
- [ ] NODE_ENV: production

### 🗄️ BASE DE DATOS
- [ ] MONGODB_URI: Tu connection string de MongoDB Atlas
- [ ] Verificar que el usuario de DB tiene permisos de lectura/escritura
- [ ] Verificar que Railway está en la whitelist de MongoDB Atlas

### 🌐 CONFIGURACIÓN WEB
- [ ] DEFAULT_REDIRECT_URL: URL de redirección principal
- [ ] CORS_ORIGIN: "*" o dominios específicos

## 🔧 Comandos para conectar con GitHub:

1. Crear repositorio en GitHub
2. Ejecutar:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

## 📊 Verificación Post-Despliegue:

- [ ] Aplicación despliega sin errores
- [ ] Health check responde en /health
- [ ] Conexión a MongoDB funciona
- [ ] Registro de usuarios funciona
- [ ] Login funciona
- [ ] Redirecciones funcionan

## 🔗 URLs importantes:
- Railway Dashboard: https://railway.app/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- Tu aplicación estará en: https://tu-proyecto.up.railway.app
