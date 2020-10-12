const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
const speakeasy = require('speakeasy')
const fs = require('fs')
const path = require('path')
const dialog = require('dialog')

router.post('/',(req,res)=>{

    //obtener el usuario con su bandera enProceso2fa en 1
    let index = credencialesBD.findIndex(c => c.enProceso2fa == 1);

    let {token} = req.body
    let verified = speakeasy.totp.verify({
        secret: credencialesBD[index].secretQR,
        encoding: 'ascii',
        token: token
    })

    if(verified){ // fue exitosa al autenticación multifactor

        //Actualizar el contador de registros y el dia del registro
        let today = new Date();

        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        let dateTime = date+' '+time;

        credencialesBD[index].cantidadRegistros += 1;
        credencialesBD[index].ultimoRegistro = dateTime;
        credencialesBD[index].usuarioActivo = 1; // poner en 1 para saber que es el usuario que se logueo
        credencialesBD[index].enProceso2fa = 0;

        // sobrescribir la base de datos con el nuevo registro
        let rutaBD = '../credencialesBD.json'
        const filePathBD = path.join(__dirname, rutaBD);
        fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

        res.render('home')
    }
    
    else{ // no funciono la autenticacion

        //poner su bandera de verificacion en 0 y regresar a login
        let index = credencialesBD.findIndex(c => c.enProceso2fa == 1);
        credencialesBD[index].enProceso2fa = 0;
        let rutaBD = '../credencialesBD.json'
        const filePathBD = path.join(__dirname, rutaBD);
        fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));
        
        dialog.err("Token Incorrecto");
        res.render('login')
    }
})

module.exports = router;