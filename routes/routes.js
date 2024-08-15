const express = require("express")
const router = express.Router()
const User = require("../models/users")
const multer = require("multer")

const fs = require('fs')
// router.get("/users",(req,res)=>{
//     res.send("All users")
// })

// image upload 

// The disk storage engine gives you full control on storing files to disk.
// There are two options available, destination and filename. They are both functions that determine where the file should be stored.

// destination is used to determine within which folder the uploaded files should be stored. This can also be given as a string (e.g. '/tmp/uploads'). If no destination is given, the operating system’s default directory for temporary files is used.

// Note: You are responsible for creating the directory when providing destination as a function. When passing a string, multer will make sure that the directory is created for you.

// filename is used to determine what the file should be named inside the folder. If no filename is given, each file will be given a random name that doesn’t include any file extension.

// Note: Multer will not append any file extension for you, your function should return a filename complete with an file extension.
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    },
})
// Middleware (function or array of functions): Middleware functions that will be executed before the final route handler. These functions can perform operations such as authentication, logging, and validation. Middleware can be optional, and you can pass one or more middleware functions.
var upload = multer({
    storage: storage,
}).single("image")

// insert user intp database

router.post('/add', upload, (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    })
    user.save().then(() => {

        req.session.message = {
            type: 'success',
            message: 'User added!'
        }
        res.redirect('/')
    }).catch((err) => {
        res.json({ message: err.message, type: 'danger' })
    })
})
// .exec(): This method executes the query and returns a promise. Using exec() is optional, but it allows for more flexible handling of the query results, especially in modern JavaScript, where promises and async/await syntax are commonly used.If you omit .exec(), Mongoose returns a query object instead of a promise directly. You can still execute the query and handle the result using a callback function or by converting the query to a promise manually.
router.get("/", (req, res) => {
    User.find().exec()
        .then(users => {
            res.render('index', {
                title: 'Home page',
                users: users
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
})

router.get("/add", (req, res) => {
    res.render("addusers", { title: 'Add Users' })
})

// edit an user route
// get id from url
router.get("/edit/:id", (req, res) => {
    let id = req.params.id
    User.findById(req.params.id)
        .then(user => {
            if (!user) {
                return res.redirect('/');
            }
            res.render('edit_users', { title: 'Edit Users', user: user });
        })
        .catch(err => {
            res.redirect('/');
        });

})

// update user route
// sync means synchronously
// fs method unlinksync is used to remove old image
router.post('/update/:id', upload, (req, res) => {
    let id = req.params.id;
    let new_image = '';
    if (req.file) {
        new_image = req.file.filename
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image)
        } catch (err) {
            console.log(err)
        }
    } else {
        new_image = req.body.old_image
    }
    // now update in database also
    User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.bodyemail,
        phone: req.bodyphone,
        image: new_image
    })
        .then(result => {
            if (result) {
                req.session.message = {
                    type: 'success',
                    message: 'User updated successfully!'
                };
            }
            res.redirect('/');
        })
        .catch(err => {
            res.json({ message: err.message, type: 'danger' });
        });
})

// delete user route
router.get('/delete/:id', (req, res) => {
    let id = req.params.id
    User.findByIdAndDelete(id)
    .then(result => {
        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image); // Corrected function name and path separator
            } catch (err) {
                return res.json({ message: err.message });
            }
        }

        req.session.message = {
            type: 'success',
            message: 'User deleted successfully!'
        };
        res.redirect('/');
    })
    .catch(err => {
        res.json({ message: err.message });
    });

})
module.exports = router