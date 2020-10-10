const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
const fs = require('fs')
const path = require('path')
const dialog = require('dialog')
const argon2 = require('argon2')

//Llevar a pagina de registro de usuario
router.get('/', (req, res) => {
    res.render('registroUsuarios')
});

//Crear nuevo usuario
router.post('/nuevoUsuario', async (req, res) => {
    let { correo, password } = req.body

    //verificar que no exista un usuario dado de alta con el correo
    if (!(credencialesBD.find(c => c.correo == correo))) { // regresa true si existe el usuario, entonces se niega la condicion para que cuando no ecuentre un usuario se pueda entrar

        try {


            //Usar argon2 para encriptar contraseña
            const hash = await argon2.hash(password)

            //meter el nuevo usuario a la BD
            
            credencialesBD.push({
                "id": credencialesBD[credencialesBD.length - 1].id + 1,
                "correo": correo,
                "password": hash,
                "cantidadRegistros": 0,
                "ultimoRegistro": "",
                "usuarioActivo": 0,
                "enProceso2fa": 0
            })

            //Actualizar el json de la BD
            let rutaBD = '../credencialesBD.json'
            const filePathBD = path.join(__dirname, rutaBD);
            fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

            //mandar al login
            res.render('login')
        } catch (err) {
            console.log(err);
        }




    }
    else { // si ya existe un usuario registrado con el correo proporcionado
        dialog.err("Usuario ya existente", "Registro invalido");
        res.render('login')
    }
});


module.exports = router;