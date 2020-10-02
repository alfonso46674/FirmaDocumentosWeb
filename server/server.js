const express = require('express')
const hbs = require('express-handlebars')
const path = require('path')
const https = require('https')
const fs = require('fs')
const bodyParser = require("body-parser");


const uploadRouter = require('../routes/uploads')
const loginRouter = require('../routes/login')

// const globby = require('globby')

const app = express()
const port = 8080;

//para parsear los request de post
app.use(bodyParser.urlencoded({ extended: true })); // false si no funciona
app.use(bodyParser.json());



app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, '../views/layouts/')
    
}));
app.set('view engine', 'hbs');



app.use(express.static(path.join(__dirname, '../public')))




app.route('/')
    .get((req,res) => {
        // res.send("imageApp")
        res.render('login', {
            title: 'Login',
            condition: false
        })
    })


//uso de routers
app.use(loginRouter); // para el envio de credenciales
app.use(uploadRouter); // para subir y ver archivos guardados en el servidor

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // para evitar errores de certificado




        
    const httpsServer = https.createServer({
        key: fs.readFileSync('localhost-key.pem'),
        cert: fs.readFileSync('localhost.pem')
      }, app);



httpsServer.listen(port, ()=>{
        console.log("HTTPS server running on port 8080");
})

