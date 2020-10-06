const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')
const fs = require('fs')
const path = require('path')
let dialog = require('dialog')

router.route('/envioCredenciales')
    .post((req,res) => {
      let {email, password} = req.body;
    //  console.log("email: ", email, " , password:"+password+"\n"); 
      
      //si existe el cliente en la BD, se deja pasar
      if(credencialesBD.find(c => c.correo == email && c.password == password)){

        

        //obtener el indice del objeto en el arreglo
        let index = credencialesBD.findIndex(c => c.correo == email && c.password == password);

        //Actualizar el contador de registros y el dia del registro
        let today = new Date();

        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        let dateTime = date+' '+time;

        credencialesBD[index].cantidadRegistros += 1;
        credencialesBD[index].ultimoRegistro = dateTime;
        credencialesBD[index].usuarioActivo = 1; // poner en 1 para saber que es el usuario que se logueo

        // sobrescribir la base de datos con el nuevo registro
        let rutaBD = '../credencialesBD.json'
        const filePathBD = path.join(__dirname, rutaBD);
        fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

        res.render('home');
      }
      
      else{
        dialog.err("Usuario o contraseña no válidos","Login incorrecto");
        res.render('login');
      }
    })

router.route('/logout')
    .post((req,res)=>{

      //Encontrar usuario activo en la base de datos y pasarlo a inactivo
      let index = credencialesBD.findIndex(c => c.usuarioActivo == 1);
      credencialesBD[index].usuarioActivo = 0;
      let rutaBD = '../credencialesBD.json'
      const filePathBD = path.join(__dirname, rutaBD);
      fs.writeFileSync(filePathBD, JSON.stringify(credencialesBD));

      res.render('login')
    })
module.exports = router;