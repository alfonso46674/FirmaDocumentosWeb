const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
let dialog = require('dialog')

router.route('/envioCredenciales')
    .post((req,res) => {
      let {email, password} = req.body;
    //  console.log("email: ", email, " , password:"+password+"\n"); 
      
      //si existe el cliente en la BD, se deja pasar
      if(credencialesBD.find(c => c.correo == email && c.password == password)){
        res.render('home');
      }else{
        dialog.err("Usuario o contraseña no válidos","Login incorrecto");
        res.render('login');
      }
    })

    
module.exports = router;