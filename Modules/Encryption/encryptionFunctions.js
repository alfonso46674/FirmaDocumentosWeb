'use strict';

const crypto = require('crypto');
const fs = require('fs')
const ENCRYPTION_KEY = 'dke029fjdDAE123fxa31deWEdfrw32dw'; // de 256 bits (32 characters)
const IV_LENGTH = 16; // Para AES es de  16


function encrypt(text) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);

 encrypted = Buffer.concat([encrypted, cipher.final()]);

 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
 let textParts = text.split(':');
 let iv = Buffer.from(textParts.shift(), 'hex');
 let encryptedText = Buffer.from(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);

 decrypted = Buffer.concat([decrypted, decipher.final()]);

 return decrypted.toString();
}


//Reads a file given a filepath and returns its content
function readFile(filePath){ 
    let data =  fs.readFileSync(filePath,'utf8')
    return data;
} 

//Creates or overwrites a file given its filepath
 function writeFile(filePath,text){
    fs.writeFileSync(filePath,text,(err)=>{
        if(err) throw err
        else return 1
    })
}

//Encrypts the data of a file and returns a new file with the encrypted data
function encryptAndReturnFile(filePathOriginalFile, filePathEncryptedFile){
    let dataToEncrypt = readFile(filePathOriginalFile)
    let encryptedData = encrypt(dataToEncrypt)

    if(writeFile(filePathEncryptedFile, encryptedData) == 1) return 1
    else return -1
    
}

//decrypts a file and returns a new file with the original data
function decryptAndReturnFile(filePathEncryptedFile, filePathDecryptedFile){
    let dataToDecrypt = readFile(filePathEncryptedFile)
    let decryptedData = decrypt(dataToDecrypt)

    if(writeFile(filePathDecryptedFile, decryptedData) == 1) return 1
    else return -1
}

module.exports = { encryptAndReturnFile, decryptAndReturnFile };