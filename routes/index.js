const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 5;

router.get("/login", (req, res) => {
    res.render("login");
});

router.get("/register", (req, res) => {
    res.render("register");
});

// router.get("/", (req, res) => {
//     db.any("SELECT postid, title, body FROM posts").then((posts) => {
//         res.render("index", { posts: posts });
//     });
// });

// asyn and await function
router.get("/", async (req, res) => {
    let articles = await db.any("SELECT postid, title, body FROM posts");
    res.render("index", { posts: posts });
});

router.get("/hello", (req, res, next) => {
    res.send("Hello World");
});

router.get("/logout", (req, res, next) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                next(error);
            } else {
                res.redirect("/login");
            }
        });
    }
});

router.post("/register", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    db.oneOrNone("SELECT userid FROM users WHERE username = $1", [
        username,
    ]).then((user) => {
        if (user) {
            res.render("register", { message: "Username already exists!" });
        } else {
            // insert user into user table
            bcrypt.hash(password, SALT_ROUNDS, (error, hash) => {
                if (error == null) {
                    db.none(
                        "INSERT INTO users(username, password) VALUES($1, $2)",
                        [username, hash]
                    ).then(() => {
                        res.send("SUCCESS");
                    });
                }
            });
        }
    });
});

router.post("/login", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    db.oneOrNone(
        "SELECT userid, username, password FROM users WHERE username = $1",
        [username]
    ).then((user) => {
        if (user) {
            //check for user's password
            bcrypt.compare(password, user.password, (error, result) => {
                if (result) {
                    // put username and userID in session
                    if (req.session) {
                        req.session.user = {
                            userId: user.userid,
                            username: user.username,
                        };
                    }
                    res.redirect("/users/posts");
                } else {
                    res.render("login", {
                        message: "Invalid username or password!",
                    });
                }
            });
        } else {
            res.render("login", { message: "Invalid username or password!" });
        }
    });
});

module.exports = router;
