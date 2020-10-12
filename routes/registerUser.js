const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
const fs = require('fs')
const path = require('path')
const dialog = require('dialog')
const argon2 = require('argon2')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')

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

            //obtener el nuevo id del usuario a ingresar dependiendo si esta vacia la BD o no
            let id = 0;
            if (credencialesBD.length == 0) id = 0;
            else id = credencialesBD[credencialesBD.length - 1].id + 1


            //Generar secret para verificacion de doble factor
            let date = new Date();
            let secret = speakeasy.generateSecret({
                name: "ProyectoSeguridad_" + date.getMinutes() + date.getSeconds()
            })

            //Generar codigo QR
            qrcode.toDataURL(secret.otpauth_url, (err, data) => {
                if (err) throw err;
                else {

                    //meter el nuevo usuario a la BD
                    credencialesBD.push({
                        "id": id,
                        "correo": correo,
                        "password": hash,
                        "cantidadRegistros": 0,
                        "ultimoRegistro": "",
                        "usuarioActivo": 0,
                        "enProceso2fa": 0,
                        "secretQR": secret.ascii
                    })

                    //Actualizar el json de la BD
                    let rutaBD = '../credencialesBD.json'
                    const filePathBD = path.join(__dirname, rutaBD);
                    fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));





                    //mandar al login
                    res.render('login',{
                        title:"Login with QR",
                        condition:false,
                        qrcode:[{url:data}] // pasarle la url del codigo qr a login
                    })
                }
            })


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