const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const globby = require('globby')
const fs = require('fs')
const axios = require('axios')

let fileNameToUpload='';

const storage = multer.diskStorage({
     destination: path.join(__dirname, '../public/files'),
      filename: (req, file, cb) => { 
          cb(null, file.originalname); //file.originalname
         } 
        })

const fileFilter = (req, file, cb)=>{ 
    //if (file.mimetype.match(/.(jpeg|png|gif)$/)) 
    fileNameToUpload = file.originalname; // guardar el nombre del archivo a guardar en una variable global para futuras referencias
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

//Subir archivos al servidor, y al momento de subirlos mostrarlos 
router.post('/upload', uploadFile.single('fileToUpload'), async (req, res) => {
     // console.log(req.file);
      res.redirect(303, '/archivoCertificado'); //redirigue a la descarga del archivo
    //  Eliminar(req)
     });


//Regresa el archivo como una descarga en el navegador
router.get('/archivoCertificado',(req,res)=>{
    
    let rutaArchivo = '../public/files/'+fileNameToUpload
    const filePath = path.join(__dirname, rutaArchivo);

    try{
        if(fs.statSync(filePath).isFile()){
            res.download(filePath)

        }
    }catch(e){
        console.log("Archivo no existente")
    }
})


//muestra los archivos guardados en el servidor
router.post('/archivosSubidos',(req,res)=>{

    let archivosArreglo;
    axios('https://localhost:8080/upload') // hace una peticion get a upload para obtener el nombre de todos los archivos guardados
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

// async function Eliminar(req){
//     const borrar = await fs.unlink(req.file.path)
//     console.log(borrar);
// }


module.exports = router;