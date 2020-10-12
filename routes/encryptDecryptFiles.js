const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const axios = require('axios')

const encryptionFunctions = require('../EncryptionModule/encryptionFunctions')

let fileNameToEncrypt='';
let fileNameToDecrypt='';


//Guardar archivos en carpeta files de public
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        
        if(file.fieldname == 'fileToEncrypt'){
            cb(null,path.join(__dirname, '../public/files'))
        }else{
            cb(null,path.join(__dirname, '../public/verify'))
        }
    },
     filename: (req, file, cb) => { 

        if(file.fieldname == 'fileToEncrypt'){
            cb(null, 'Encriptado_'+file.originalname); //file.originalname
        }else{
            cb(null, file.originalname); //file.originalname
        }

        
        } 
       })



const fileFilter = (req, file, cb)=>{ 
   //if (file.mimetype.match(/.(jpeg|png|gif)$/))
   if(file.fieldname == 'fileToDecrypt') {
    fileNameToDecrypt  = file.originalname // guardar el nombre del archivo a guardar en una variable global para futuras referencias
   }
             
   else{ fileNameToEncrypt = 'Encriptado_'+file.originalname}
  
   if (file.mimetype === 'text/plain') {
           cb(null, true);
           } else{
               cb(null, false); // false, ignore other files
           }
   }

   


const uploadFile = multer({ 
   storage,
    limits: {fileSize: 1000000},
     fileFilter 
   })


   

  router.get('/encrypt',(req,res)=>{
      let rutaArchivoEncriptar = '../public/files/'+fileNameToEncrypt
    let filePath = path.join(__dirname, rutaArchivoEncriptar);
    //console.log({FilePathGet:filePath})
      res.send(filePath);
  })

   router.post('/encrypt',uploadFile.single('fileToEncrypt'),async(req,res)=>{
  

    //Obtener archivo a encriptar
    let filePath = path.join(__dirname, '../public/files/'+fileNameToEncrypt);
    let filePathEncrypted = path.join(__dirname, '../public/verify/'+fileNameToEncrypt)

    //Encriptar archivo
    encryptionFunctions.encryptAndReturnFile(filePath,filePathEncrypted)

    //Descargar archivo en el navegador
    try{
        if(fs.statSync(filePathEncrypted).isFile()){
            res.download(filePathEncrypted)
        }
    }catch(e){
        console.log(e)
    }


    

    
   })




   router.post('/decrypt',uploadFile.single('fileToDecrypt'),async(req,res)=>{
         //Obtener archivo a desencriptar
    let rutaArchivoDesencriptar = '../public/verify/'+fileNameToDecrypt
    let filePath = path.join(__dirname, rutaArchivoDesencriptar);


    let filePathFinal = path.join(__dirname, '../public/verify/'+fileNameToDecrypt)

    console.log(filePath)
    encryptionFunctions.decryptAndReturnFile(filePath,filePathFinal)
   
    try{
        if(fs.statSync(filePathFinal).isFile()){
            res.download(filePathFinal)
        }
    }catch(e){
        console.log(e)
    }
    

   })
   module.exports = router;