const multer = require('multer')
const fs = require('fs')
let credencialesBD = require('../../credencialesBD.json')
//Creates a new directory given a filePath
const createDir = (dirPath) => {
    fs.mkdirSync(process.cwd() + dirPath, { recursive: true }, (error) => {
        if (error) {
            console.log('An error ocurred: '.error);
        } else {
            console.log('Folder creado en ruta: ', dirPath);
        }
    });
}

function obtainPathUser() {
    //obtener el usuario activo para obtener la ruta de su carpeta
    let index = credencialesBD.findIndex(c => c.usuarioActivo == 1);
    return '/public/' + credencialesBD[index].correo
}




//Guardar archivos en carpeta files de public de la ruta creada
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let rutaUsuario = obtainPathUser();

        if (file.fieldname == 'fileToUpload') {
            cb(null, path.join(__dirname, (rutaUsuario + '/general')))

        } else if (file.fieldname == 'fileToVerify') {
            cb(null, path.join(__dirname, (rutaUsario + '/verificar')))

        } else if (file.fieldname == 'fileToEncrypt') {
            cb(null, path.join(__dirname, (rutaUsuario + '/encriptado')))

        } else if (file.fieldname == 'fileToDecrypt') {
            cb(null, path.join(__dirname, (rutaUsuario + '/desencriptado')))
        }
    },
    filename: (req, file, cb) => {

        if (file.fieldname == 'fileToUpload') {
            cb(null, file.originalname); //file.originalname

        } else if(file.fieldname == 'fileToVerify') {
            cb(null, 'verificado_'+file.originalname); //file.originalname
        }
        else if(file.fieldname == 'fileToEncrypt'){
            cb(null, 'encriptado_'+file.originalname);
        }
        else if(file.fieldname == 'fileToDecrypt'){
            cb(null, 'desencriptado_'+file.originalname);
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

    

module.exports = { createDir }