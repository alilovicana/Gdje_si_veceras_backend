require("babel-polyfill");
const express = require('express')//simple express server
const mysql = require('mysql')
const cors = require('cors')
const app = express();

const router = express.Router();
const multer = require('multer');
const path = require('path');

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require('jsonwebtoken');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { read } = require('fs');

app.use(express.json());
app.use(
    cors({
        origin: ["http://localhost:3400"],
        methods: ["GET", "POST", "PUT", "DELETE"],
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
// const db= process.env.REACT_APP_LOCALHOST_KEY;
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
const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"]
    if (!token) {
        res.send("Give us token next time");
    } else {
        jwt.verify(token, "jwtSecret", (err, decoded) => {
            if (err) {
                res.json({ auth: false, message: "You failed to euthenticated" });
            } else {
                req.userId = decoded.id;
                next();
            }
        })
    }
}

app.get("/isUserAuth", verifyJWT, (req, res) => {
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

                        const id = result[0].id;
                        const token = jwt.sign({ id }, "jwtSecret", {
                            expiresIn: 300,
                        })
                        req.session.user = result;
                        res.json({ auth: true, token: token, result: result });
                    } else {
                        res.json({ auth: false, message: "Pogrešan unos" });
                    }
                });
            } else {
                res.json({ auth: false, message: "Korisnik ne postoji" });
            }
        }
    ));
});
app.post('/CreateAds/:id', (req, res) => {
    const user_id = req.body.user_id;
    const content = req.body.content;
    const adress = req.body.adress;
    const category = req.body.category;
    const city = req.body.city;
    const date = req.body.date;
    const picture = req.body.picture;
    db.query("INSERT INTO posts(user_id,content,adress,category,city,dateOfEvent,picture) VALUES (?,?,?,?,?,DATE(?),?)", [user_id, content, adress, category, city, date, picture],
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
/////////UPLOAD A PHOTO DOWN//////////////////////
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
app.post('/upload', upload.single("image"), (req, res) => {
    if (!req.file) {
        console.log("No file received");
        return res.send({
            success: false
        });

    } else {
        console.log('file received');
        // return res.status(200).header({
        //     'Content-Type': 'multipart/form-data',
        //     'Content-Encoding': 'base64'
        // }).send({
        //     success: true,
        //     image: new Buffer.from(req.file.buffer).toString('base64')
        // })
        return res.send({
            success: true
        });
    }
});
/////////SHOW THE POSTS//////////////////////
app.get('/showAds', (req, res) => {
    db.query("SELECT users.firstName,posts.*,profile.* FROM users INNER JOIN posts ON users.id=posts.user_id INNER JOIN profile ON users.id=profile.user_id",
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send(result)
            }
        })
});
app.put('/filter', (req, res) => {
    const category = req.body.category;
    const city = req.body.city;
    const date = req.body.date;
    db.query("SELECT * FROM posts WHERE city = (?) AND category = (?) AND DATE(dateOfEvent)=DATE(?)", [city, category, date],
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send(result)
            }
        })
});
/////////PROFILE//////////////////////
app.post('/Profile/:id', (req, res) => {
    const user_id = req.body.user_id;
    // const profile_image = req.body.profile_image;
    // const first_and_last_name = req.body.first_and_last_name;
    const costum_email = req.body.costum_email;
    const phone_number = req.body.phone_number;
    const about_me = req.body.about_me;
    // const rating = req.body.rating;

    db.query("INSERT INTO profile(user_id,costum_email,phone_number, about_me) VALUES (?,?,?,?)", [user_id, costum_email, phone_number, about_me],
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
app.put('/UpdateProfile/:id', (req, res) => {
    const user_id = req.body.user_id;
    // const profile_image = req.body.profile_image;
    // const first_and_last_name = req.body.first_and_last_name;
    const costum_email = req.body.costum_email;
    const phone_number = req.body.phone_number;
    const about_me = req.body.about_me;

    db.query("UPDATE profile SET phone_number=?, costum_email=?, about_me=? WHERE user_id=?", [phone_number,costum_email, about_me, user_id],
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
app.get('/Profile/:id', (req, res) => {
    const user_id = req.params.id;
    db.query("SELECT costum_email,phone_number,about_me FROM profile WHERE user_id=?", [user_id],
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send(result)
            }
        }
    );
});
/////////PROFILE UP//////////////////////
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
// app.post('/api/like', (req, res) => {
//     // Increment likes count in database
//     // ...


//     // Send response indicating success
//     res.send({ message: 'Successfully liked' });
//   });
//  app.post('/api/unlike', (req, res) => {
//     // Decrement likes count in database
//     // ...

//     // Send response indicating success
//     res.send({ message: 'Successfully unliked' });
//   });

app.delete('/Logout', (req, res) => {
    if (req.session) {
        req.session.destroy();
    }
});
app.listen(3001, () => {
    console.log("jej your server is running!");
});


