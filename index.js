const express = require('express')//simple express server
const mysql = require('mysql')
const cors = require('cors')
const app = express()

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt=require('jsonwebtoken');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:3400"],
        methods: ["GET", "POST","PUT","DELETE"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        key: "userId",
        secret: "vitez",
        resave: false,
        saveUninitialized: false,
        // cookie: {
        //     expires: 1000 * 60 * 25 * 60,
        // },
    })
);

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'gdje_si_veceras?'
});
app.post("/Registration", (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
        }
        db.query("INSERT INTO users(firstName,lastName,email,password) VALUES (?,?,?,?)", [firstName, lastName, email, hash],
            (err, result) => {
                if (err) {
                    console.log(err)
                }
                else {
                    res.send("Values Inserted")
                }
            }
        )
    });
});
// app.post("/Registration", (req, res) => {
//     const email = req.body.email;
//     (db.query(
//         "SELECT* FROM users WHERE email = ?;",
//         [email],
//         (err, result) => {
//             if (err) {
//                 res.send({ err: err });
//             }
//             if (result.length > 0) {
//                 res.send({ message: "Korisnik već postoji postoji, pokušajte ponovno!" });
//             } else {
//                 res.send(result);
//             }
//         }
//     ));
// });
const verifyJWT=(req,res,next)=>{
    const token=req.headers["x-access-token"]
    if(!token){
        res.send("Give us token next time");
    }else{
        jwt.verify(token,"jwtSecret",(err,decoded)=>{
            if(err){
                res.json({auth:false,message:"You failed to euthenticated"});
            }else{
                req.userId=decoded.id;
                next();
            }
        })
    }
}

app.get("/isUserAuth",verifyJWT,(req,res)=>{
    res.send("You are authantucate Congrats!");
})
app.get("/Login", (req, res) => {
    if (req.session.user) {
        res.send({ loggedIn: true, user: req.session.user });
    } else {
        res.send({ loggedIn: false });
    }
});

app.post("/Login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    (db.query(
        "SELECT* FROM users WHERE email = ?;",
        [email],
        (err, result) => {
            if (err) {
                res.send({ err: err });
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (error, response) => {
                    if (response) {

                        const id=result[0].id;
                        const token=jwt.sign({id},"jwtSecret",{
                            expiresIn:300,
                        })
                        req.session.user = result;
                        res.json({auth:true,token:token,result:result});
                    } else {
                        res.json({auth:false,message:"Pogrešan unos"});
                    }
                });
            } else {
                res.json({auth:false,message:"Korisnik ne postoji"});
            }
        }
    ));
});
app.post('/CreateAds',  (req, res) => {
    const user_id=req.body.user_id;
    const content = req.body.content;
    const adress = req.body.adress;
    db.query("INSERT INTO posts(user_id,content,adress) VALUES (?,?,?)", [user_id, content, adress],
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send("Values Inserted")
            }
        }
    );

});
// app.get('/ads/:id', (req, res) => {
//     db.query("SELECT* FROM users WHERE user_id = ?;",[user_id],
//         (err, result) => {
//             if (err) {
//                 console.log(err)
//             }
//             else {
//                 res.send(result)
//             }
//         })
// });
app.get('/showAds', (req, res) => {
    db.query("SELECT* FROM posts",
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send(result)
            }
        })
});

app.put('/Update', (req, res) => {
    const id = req.body.id;
    const likes = req.body.likes;
    db.query("UPDATE posts SET likes=? WHERE id=?", [likes, id],
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send("Values Inserted")
            }
        }
    );
});
app.delete('/Logout', (req, res) => {
    if (req.session) {
        req.session.destroy();
      }
});
app.listen(3001, () => {
    console.log("jej your serveer is running!");
});


