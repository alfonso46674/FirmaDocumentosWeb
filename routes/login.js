const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
let multifactorAuth = require('../multifactorAuth/secret.json')
const fs = require('fs')
const path = require('path')
let dialog = require('dialog')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')



router.route('/envioCredenciales')
    .post((req,res) => {
      let {email, password} = req.body;
    //  console.log("email: ", email, " , password:"+password+"\n"); 
      
      //si existe el cliente en la BD, se deja pasar
      if(credencialesBD.find(c => c.correo == email && c.password == password)){

        //Generar codigo qrcode para verificacion de doble factor
        let date = new Date();
        let secret = speakeasy.generateSecret({
          name:"ProyectoSeguridad_"+date.getMinutes()+date.getSeconds()
        })

        
        //generar qrcode
         qrcode.toDataURL(secret.otpauth_url, (err,data)=> {

          if(err) throw err;

          else{ // si se genero la url para el codigo qr se avanza, y se pasa dicha url como argumento
           
            //Guardar el secret ascii para futuras referencias
           multifactorAuth[0].idAscii = secret.ascii
            let rutaSecret = '../multifactorAuth/secret.json'
            const filePathSecret = path.join(__dirname, rutaSecret);
            fs.writeFileSync(filePathSecret, JSON.stringify(multifactorAuth));


            //poner la bandera del usuario de "enProceso2fa" en 1 para decir que se va a pasar a la verificacion
            let index = credencialesBD.findIndex(c => c.correo == email && c.password == password);
            credencialesBD[index].enProceso2fa = 1;

            let rutaBD = '../credencialesBD.json'
           const filePathBD = path.join(__dirname, rutaBD);
            fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

            //renderizar la siguiente pagina de verificacion
            res.render('verifyGoogleAuth',{
              title:"Google Authenticator",
              condition: false,
              qrcode : [{url:data}]
            });
          }
          
         })
      }
      
      else{
        dialog.err("Usuario o contraseña no válidos","Login incorrecto");
        res.render('login');
      }
    })

router.route('/logout')
    .post((req,res)=>{

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