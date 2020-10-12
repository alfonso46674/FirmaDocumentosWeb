const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
const fs = require('fs')
const path = require('path')
const argon2 = require('argon2')
const dialog = require('dialog')

router.post('/changePassword', async (req, res) => {
    let { oldPassword, newPassword } = req.body

    let index = credencialesBD.findIndex(c => c.usuarioActivo == 1);

    //verificar que la contraseña antigua sea la correcta
    if (await argon2.verify(credencialesBD[index].password, oldPassword)) {

        //encriptar nueva contraseña
        const hash = await argon2.hash(newPassword);
        credencialesBD[index].password = hash
        //hacer un logout manual, poner la bandera de usuario activo en 0 y pasar los cambios a la BD
        credencialesBD[index].usuarioActivo = 0;
        let rutaBD = '../credencialesBD.json'
        const filePathBD = path.join(__dirname, rutaBD);
        fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

        res.render('login')

    } else { // contraseña incorrecta
        dialog.err("Contraseña antigua incorrecta", "Edicion invalida");
    }





})


module.exports = router;