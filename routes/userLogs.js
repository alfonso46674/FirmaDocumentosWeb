const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')


router.post('/usuarios',(req,res)=>{
   // console.log(credencialesBD)

    res.render('home',{
        title:"Home",
        condition:false,
        arregloUsuarios: credencialesBD
    })
})

module.exports = router;