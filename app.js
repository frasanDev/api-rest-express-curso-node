// Importamos el módulo debug para depuración:
const debug = require('debug')('app:inicio'); 

// depuración de base de datos:
//const dbDbug = require('debug')('app:db'); 

const express = require('express');

// Importamos el middleware de logger:
//const log1 = require('./logger1');
//const log2 = require('./logger2'); 

// importamos morgan para el logging de peticiones HTTP:
const morgan = require('morgan');


// importamos joi para validaciones:
const Joi = require('@hapi/joi');
//const { logger } = require('update/lib/utils');

const app = express();
const config = require('config');


// usando Middleware urlencoded:
// permite que express pueda leer los datos del body de una petición POST
// y los convierta en un objeto JavaScript accesible a través de req.body
// extended: true permite que se puedan enviar objetos anidados en el body
// extended: false permite que se envíen datos simples (no anidados)
 app.use(express.urlencoded({ extended: true })); 
 // usando middleware static:
// permite servir archivos estáticos (como HTML, CSS, JS) desde un directorio 
// específico
// app.use(express.static('public')); // descomentarlo si se quiere 
// usar archivos estáticos 
app.use(express.static('public')); // descomentarlo si se quiere usar archivos estáticos

// Uso de middleware de tercero, con morgan:
//'dev' es un formato predefinido que muestra información concisa de las 
// peticiones HTTP    
// 'tiny' es un formato más compacto que muestra menos información
if(app.get('env') === 'development') {
    app.use(morgan('tiny')); // Usamos el formato 'dev' para desarrollo
    //console.log('Middleware de morgan cargado en modo desarrollo.');  
    debug('Morgan está habilitado en modo desarrollo.');
}
 
//Trabajando con la base de datos:
debug('Conectando con la base de datos...');



// Configuración de entornos:
console.log('Aplicacion: '+ config.get('name'));
console.log('DB Server: '+ config.get('configDB.host'));

// Usando un middleware:
app.use(express.json());

// Middleware para manejar errores de validación
// usamos el middleware de logger:
//app.use(log1);
//app.use(log2);



// data para trabajar con http:
const usuarios = [
    {id: 1, nombre: 'Grover'}, 
    {id: 2, nombre: 'Pablo'}, 
    {id: 3, nombre: 'Ana'}
];  

// Definimos las rutas de la aplicación
// Ruta raíz:
app.get('/', (req, res) => {
    res.send('Hola Mundo desde Express.');
}); 

// Ruta para obtener la lista de usuarios:
app.get('/api/usuarios', (req, res) => {
   //res.send(['grover', 'luis', 'ana']);
   res.json(usuarios); // devuelve la lista de usuarios en formato JSON
});


//Valores tipo Query Strings;
// se llama: http://localhost:3000/api/usuarios/1958/10/?sexo=M
// solo devuelve el query: ?sexo=M
app.get('/api/usuarios/:year/:month', (req, res) => {
    res.send(req.query);
});

// Trabajando con http y la data usuarios.
// http://localhost:3000/api/usuarios/3
// devuelve: {id: 3, nombre: 'Ana'}
app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if (!usuario) {
        res.status(404).json({error: 'Usuario no encontrado'});
        res.send(usuario);
    }
}); 

// usando peticiones de tipo post con middleware y body:
app.post('/api/usuarios', (req, res) => {

    // Validación con Joi:
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    // Vamos a aplicar la validacion joi:
    // destructurando el error y el value:
    // si hay error, se devuelve un 400 y el mensaje de error.
    // si no hay error, se crea el usuario y se devuelve.
    // value es el objeto validado.
    // req.body.nombre es el nombre que viene del body de la peticion.
    // req.body es el objeto que viene del body de la peticion.
    const {error, value} = validarUsuario(req.body.nombre);

    if (!error) {
       const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario); 
        
    }  else {
        const mensajeError = error.details[0].message;
        return res.status(400).json({mensajeError});
    }   

});

// Manejo de solicitudes PUT, item 64
app.put('/api/usuarios/:id', (req, res) => {
    //valido el usuario:
   
    let usuario = existeUsuario(req.params.id);

    if (!usuario) {
        return res.status(404).json({error: 'Usuario no encontrado'});
    }

    const { error, value } = validarUsuario(req.body.nombre);

    if (error) {
        const mensaje = error.details[0].message;
        return res.status(400).json({mensaje});
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
});

// Manejo de solicitudes DELETE:
app.delete('/api/usuarios/:id', (req, res) => {
    //valido el usuario:
    let usuario = existeUsuario(req.params.id);

    if (!usuario) {
        return res.status(404).json({error: 'Usuario no encontrado'});
    }

    // si el usuario existe, lo eliminamos:
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index, 1);
    
    res.send(usuario); // devolvemos el usuario eliminado
}); 



// creando el listening del servidor
// variable de entorno PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`escuchando en http://localhost: ${PORT}`);
}); 



function existeUsuario(id) {
    return usuarios.find(u => u.id === parseInt(id));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({ nombre: nom }));  
}


// Esta función verifica si un usuario con el ID dado existe en el array de usuarios.
/*
 voy por, item 73, recursos estaticos.
*/

