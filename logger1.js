function log1(req, res, next) {
    console.log('logging1...');
    next(); // Llama al siguiente middleware o ruta
}   

// Exportamos el middleware para que pueda ser usado en otros archivos
module.exports = log1;
