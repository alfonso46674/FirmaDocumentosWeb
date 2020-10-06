const router = require('express').Router()
let credencialesBD = require('../credencialesBD.json')


router.post('/usuarios',(req,res)=>{
   
    

    res.render('home',{
        title:"Home",
        condition:false,
        arregloUsuarios: credencialesBD
    })
})

module.exports = router;