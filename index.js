const express = require('express')//simple express server
const mysql = require('mysql')
const cors = require('cors')
const app = express()

app.use(cors());
app.use(express.json());

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

    (db.query("INSERT INTO users(firstName,lastName,email,password) VALUES (?,?,?,?)", [firstName, lastName, email, password],
        (err, result) => {
            if (err) {
                console.log(err)
            }
            else {
                res.send("Values Inserted")
            }
        }
    ))

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
// app.get("/Login", (req, res) => {
//     if (req.session.user) {
//       res.send({ loggedIn: true, user: req.session.user });
//     } else {
//       res.send({ loggedIn: false });
//     }
//   });

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
                // bcrypt.compare(password, result[0].password, (error, response) => {
                //     if (response) {
                //         req.session.user = result;
                //         console.log(req.session.user);
                res.send(result);
                // } else {
                //     res.send({ message: "Pogrešan unos! Pokušajte ponovo" });
                // }
                // });
            } else {
                res.send({ message: "Korisnik ne postoji" });
            }
        }


    ));
});
app.post('/CreateAds', (req, res) => {
    //const user_id=req.body.user_id;
    const content = req.body.content;
    const adress = req.body.adress;
    db.query("INSERT INTO posts(content,adress) VALUES (?,?)", [content, adress],
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

app.put('/update', (req, res) => {
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
app.listen(3001, () => {
    console.log("jej your serveer is running!");
});


