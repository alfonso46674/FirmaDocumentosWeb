const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const globby = require('globby')
const fs = require('fs')
const axios = require('axios')
const crypto = require('crypto');
const { CLIENT_RENEG_LIMIT } = require('tls')

let fileNameToUpload='';
let fileNameToVerify='';

//Guardar archivos en carpeta files de public
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        
        if(file.fieldname == 'fileToUpload'){
            cb(null,path.join(__dirname, '../public/files'))
        }else{
            cb(null,path.join(__dirname, '../public/verify'))
        }
    },
     filename: (req, file, cb) => { 

        if(file.fieldname == 'fileToUpload'){
            cb(null, 'Firmado_'+file.originalname); //file.originalname
        }else{
            cb(null, file.originalname); //file.originalname
        }

        
        } 
       })



const fileFilter = (req, file, cb)=>{ 
   //if (file.mimetype.match(/.(jpeg|png|gif)$/))
   if(file.fieldname == 'fileToVerify') {
    fileNameToVerify  = file.originalname // guardar el nombre del archivo a guardar en una variable global para futuras referencias
   }
   else{ fileNameToUpload = 'Firmado_'+file.originalname
             }
  
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


   


//mostrar los archivos subidos
router.get('/upload', async (req,res)=>{
    const paths = await globby(['**/public/files/*']);
    // console.log(paths);
    const pathsNew = paths.map(function(x){
        return x.replace("public/files/",'')
    })
    res.send(pathsNew)
    // res.send('En upload')
})

//Subir archivos al servidor, firmarlos y luego regresarlos 
router.post('/upload',uploadFile.single('fileToUpload'), async (req, res) => {
     // console.log(req.file);
     
    //console.log({filenameUpload:fileNameToUpload})

    //Firmar el archivo con las llaves en la carepta keysFirma

    let rutaLlavePrivada = '../keysFirma/privateKey.pem'
    const filePathPrivateKey = path.join(__dirname, rutaLlavePrivada);
    const private_key = fs.readFileSync(filePathPrivateKey, 'utf-8');

    // File/Document to be signed
    let rutaArchivo = '../public/files/'+fileNameToUpload
    let filePath = path.join(__dirname, rutaArchivo);
   // console.log(fs.statSync(filePath).isFile())
    const doc = fs.readFileSync(filePath);

    // Signing
    const signer = crypto.createSign('RSA-SHA256');
    signer.write(doc);
    signer.end();

    // Returns the signature in output_format which can be 'binary', 'hex' or 'base64'
    const signature = signer.sign(private_key, 'base64')

   // console.log('Digital Signature: ', signature);

    // Write signature to the file `signature.txt`
    let rutaSignature = '../keysFirma/signature'
    const filePathSignature = path.join(__dirname, rutaSignature);
    fs.writeFileSync(filePathSignature, signature);

    

    //Descargar el archivo firmado en el navegador
    rutaArchivo = '../public/files/'+fileNameToUpload
    filePath = path.join(__dirname, rutaArchivo);

    try{
        if(fs.statSync(filePath).isFile()){
            res.download(filePath)

        }
    }catch(e){
        console.log("Archivo no existente")
    }

     });



//muestra los archivos guardados en el servidor
router.post('/archivosSubidos',(req,res)=>{

    let archivosArreglo;
    axios('https://localhost:8080/firmaDocumentos/upload') // hace una peticion get a upload para obtener el nombre de todos los archivos guardados
        .then(response => {
            
            //Mapear el response.data a un arreglo de objetos para imprimirlo en el html
            archivosArreglo = response.data.map(archivo => {return {nombre: archivo}})            
            
           // enviar el arreglo al html
            res.render('home',{
                title: "Home",
                condition:false,
                pathsNew : archivosArreglo
            })

        })
});

router.post('/verify',uploadFile.single('fileToVerify'),(req,res)=>{
   // console.log({filenameVerify:fileNameToVerify})

   let rutaLlavePublica = '../keysFirma/publicKey.pem'
   const filePathPublicKey = path.join(__dirname, rutaLlavePublica);
   const public_key = fs.readFileSync(filePathPublicKey, 'utf-8');
    
   // Signature from sign.js
    let rutaSignature = '../keysFirma/signature'
    const filePathSignature = path.join(__dirname, rutaSignature);
    const signature = fs.readFileSync(filePathSignature, 'utf-8');

    // File to be signed
    let rutaArchivo = '../public/verify/'+fileNameToVerify
    const filePath = path.join(__dirname, rutaArchivo);
    const doc = fs.readFileSync(filePath);  

    // Signing
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.write(doc);
    verifier.end();


    // Verify file signature ( support formats 'binary', 'hex' or 'base64')
    const result = verifier.verify(public_key, signature, 'base64');    


    //console.log('Digital Signature Verification : ' + result);



    res.render('home',{
        title:'home',
        condition:false,
        statusSigned : [{status: result,
                        name:fileNameToVerify}]
    })
})


module.exports = router;