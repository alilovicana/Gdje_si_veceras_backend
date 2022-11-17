const express = require('express')//simple express server
const app = express()
const mysql = require('mysql')
const cors=require('cors')

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
    db.query("INSERT INTO users(firstName,lastName,email,password) VALUES (?,?,?,?)", [firstName, lastName, email, password],
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
// app.post('/CreatePost', (req, res) => {
//     const user_id=req.body.user_id;
//     const content = req.body.content;
//     const likes = req.body.likes;
//     const created_time = req.body.created_time;
//     const adress = req.body.adress;
//     db.query("INSERT INTO Posts(user_id,content,likes,created_time,adress) VALUES (?,?,?,?,?)",[user_id,content,likes,created_time,adress],
//     (err,result)=>{
//         if(err){
//             console.log(err)
//         }
//         else{
//             res.send("Values Inserted")
//         }
//     }
//     );

// });
app.listen(3001, () => {
    console.log("jej your serveer is running!");
});


