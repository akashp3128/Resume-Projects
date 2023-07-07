const express = require('express');
const bodyParser = require('body-parser').json();
const cors = require('cors');
const fileUpload = require('express-fileupload')
const bcrypt = require('bcrypt')
const AWS = require("aws-sdk")
const dotenv = require("dotenv")
const path = require('path')

dotenv.config()

const s3 = new AWS.S3(
    {
        region: process.env.REGION,
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY
    }
)

const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(cors());
app.use(fileUpload())

var mysql = require('mysql');

// create a connection variable with the required details
var con = mysql.createConnection({
    host: process.env.DATABASE_HOSTNAME, // ip address of server running mysql
    user: process.env.DATABASE_USER, // user name to your mysql database
    password: process.env.DATABASE_PASSWORD, // corresponding password
    database: process.env.DATABASE_NAME, // use the specified database
    port: process.env.DATABASE_PORT
});
 
// make to connection to the database.
con.connect(function(err) {
    if (err) throw err;
    // if connection is successful
    console.log('connection successful');
});

if(process.env.REACT_APP_BUCKET_ENV === "prod"){
    app.use(express.static(path.join(__dirname,'build')))
    app.get('/ui*', function(req, res){
        res.sendFile(path.join(__dirname,'build', 'index.html'))
    })
}

app.get('/getAllImages',(req,res)=>{
    con.query("SELECT * FROM gallery ORDER BY id desc", function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
})

app.get('/getImages',(req,res)=>{
    con.query(`SELECT * FROM gallery WHERE name LIKE '%${req.query.searchValue}%' ORDER BY id desc`, function (err, result, fields) {
        if (err) throw err;
        res.json(result);
    });
})

app.get('/downloadImage', bodyParser, (req,res)=>{
	var imageName = req.query.imageName;

	s3.getObject(
        { Bucket: process.env.BUCKET, Key: imageName },
        function (error, data) {
            if (error != null) {
                console.log("Failed to retrieve an object: " + error);
            } else {
                res.status(200).send(data)
            }
        }
    );
})

app.post('/signup', bodyParser, async (req,response)=>{
	var {username, password} = req.body;
    if (username && password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        con.query("INSERT into users (username,password) VALUES (?, ?)",[username, hashedPassword],function(err,res,fields){
            if(err){
                response.status(401).send({
                    "status": 401,
                    "message": err.message
                })
            }else{
                response.status(200).send({
                    "status": 200,
                    "message": "Logged In"
                })
            }
        });
    }else{
        response.status(401).send({
            "status": 401,
            "message": 'Please enter Username and Password!',
        })
        response.end();
    }
})

app.post('/login', bodyParser, (request,response)=>{
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username
        con.query('SELECT * FROM users WHERE username = ?', [username], async function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) {
                console.log(error)
                response.status(401).send({
                    "status": 401,
                    "message": error.message,
                })
            };
            // If the account exists
            if (results.length > 0 && await bcrypt.compare(password, results[0].password)) {
                response.status(200).send({
                    "status": 200,
                    "message": 'Incorrect Username and/or Password!',
                })
            } else {
                response.status(401).send({
                    "status": 401,
                    "message": 'Incorrect Username and/or Password!',
                })
                response.end();
            }			
        });
    } else {
        response.status(401).send({
            "status": 401,
            "message": 'Please enter Username and Password!',
        })
        response.end();
    }
});

app.post('/uploadImage', bodyParser, (req,res)=>{
    const {imageOwner} = req.body
    const {name, mimetype, data, size, encoding} = req.files.imageFile

    const params = {
        ACL: "public-read",
        Bucket: process.env.BUCKET,
        Key: name,
        Body: data,
        Metadata: {
            "Content-Type": mimetype,
            "Content-Length": size.toString(),
            "Content-Encoding": encoding
        }
    }

    s3.upload(params, (err, dataRes) =>{
        if(err){
            console.log(err.message)
            
            res.status(401).send({
                "status": 401,
                "message": err.message,
                "data": dataRes
            })
        }else{
            var records = [[name, dataRes.Location, imageOwner]];
            con.query("INSERT into gallery (name,url,owner) VALUES ?",[records],function(err,res,fields){
                if(err) throw err;
            });
            res.status(200).send({
                "status": 200,
                "message": "successfully Uploaded",
                "data": dataRes
            })
        }
    })
})

app.listen(8080,()=>{
  console.log("Listening on Port 8080");
})
