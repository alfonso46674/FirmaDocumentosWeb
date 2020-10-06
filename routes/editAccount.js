const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
const fs = require('fs')
const path = require('path')

router.post('/changePassword',(req,res)=>{
    let {password} = req.body
    let index = credencialesBD.findIndex(c => c.usuarioActivo == 1);
   credencialesBD[index].password = password
   
    //hacer un logout manual, poner la bandera de usuario activo en 0 y pasar los cambios a la BD
   credencialesBD[index].usuarioActivo = 0;
   let rutaBD = '../credencialesBD.json'
   const filePathBD = path.join(__dirname, rutaBD);
   fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

   res.render('login')

})


module.exports = router;