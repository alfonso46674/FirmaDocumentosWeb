const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
let multifactorAuth = require('../multifactorAuth/secret.json')
const fs = require('fs')
const path = require('path')
let dialog = require('dialog')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')
const  argon2 = require('argon2')



router.route('/envioCredenciales')
  .post(async (req, res) => {
    let { email, password } = req.body;


    //si existe el usuario en la BD, se deja pasar
    if (credencialesBD.find(c => c.correo == email)) {


      try {

        //Obtener el indice del usuario
        let index = credencialesBD.findIndex(c => c.correo == email);
  
        //Verificar contraseña con argon2
        if(await argon2.verify(credencialesBD[index].password, password)){ // si entra la contraseña es verificada

          //Generar codigo qrcode para verificacion de doble factor
        let date = new Date();
        let secret = speakeasy.generateSecret({
          name: "ProyectoSeguridad_" + date.getMinutes() + date.getSeconds()
        })


        //generar qrcode
        qrcode.toDataURL(secret.otpauth_url, (err, data) => {

          if (err) throw err;

          else { // si se genero la url para el codigo qr se avanza, y se pasa dicha url como argumento

            //Guardar el secret ascii para futuras referencias
            multifactorAuth[0].idAscii = secret.ascii
            let rutaSecret = '../multifactorAuth/secret.json'
            const filePathSecret = path.join(__dirname, rutaSecret);
            fs.writeFileSync(filePathSecret, JSON.stringify(multifactorAuth));


            //poner la bandera del usuario de "enProceso2fa" en 1 para decir que se va a pasar a la verificacion
            let index = credencialesBD.findIndex(c => c.correo == email);
            credencialesBD[index].enProceso2fa = 1;

            let rutaBD = '../credencialesBD.json'
            const filePathBD = path.join(__dirname, rutaBD);
            fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

            //renderizar la siguiente pagina de verificacion
            res.render('verifyGoogleAuth', {
              title: "Google Authenticator",
              condition: false,
              qrcode: [{ url: data }]
            });
          }

        })



        }else{ //contraseña incorrecta
          dialog.err("Usuario o contraseña no válidos", "Login incorrecto");
           res.render('login');
        }


        


      } catch (err) {
        console.log(err)
      }



    }

    else {
      dialog.err("Usuario o contraseña no válidos", "Login incorrecto");
      res.render('login');
    }
  })

router.route('/logout')
  .post((req, res) => {

    //Encontrar usuario activo en la base de datos y pasarlo a inactivo
    let index = credencialesBD.findIndex(c => c.usuarioActivo == 1 || c.enProceso2fa == 1);
    credencialesBD[index].usuarioActivo = 0;
    credencialesBD[index].enProceso2fa = 0;
    let rutaBD = '../credencialesBD.json'
    const filePathBD = path.join(__dirname, rutaBD);
    fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

    res.render('login')
  })
module.exports = router;