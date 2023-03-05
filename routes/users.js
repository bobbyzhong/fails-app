const express = require("express");
const router = express.Router();

router.post("/delete-post", async (req, res) => {
    let postId = req.body.postId;

    await db.none("DELETE FROM posts WHERE postid = $1", [postId]);
    res.redirect("/users/posts");
});

router.get("/add-post", (req, res) => {
    res.render("add-post");
});

router.post("/add-post", (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let userId = req.session.user.userId;

    db.none("INSERT INTO posts(title, body, userid) VALUES($1, $2, $3)", [
        title,
        description,
        userId,
    ]).then(() => {
        res.send("SUCCESS");
    });
});

router.post("/update-post", (req, res) => {
    let title = req.body.title;
    let description = req.body.description;
    let postId = req.body.postId;

    db.none("UPDATE posts SET title = $1, body = $2 WHERE postid = $3", [
        title,
        description,
        postId,
    ]).then(() => {
        res.redirect("/users/posts");
    });
});

router.get("/posts/edit/:postId", (req, res) => {
    let postId = req.params.postId;

    db.one("SELECT postid,title,body FROM posts WHERE postid = $1", [
        postId,
    ]).then((post) => {
        res.render("edit-post", post);
    });
});

router.get("/posts", (req, res) => {
    let userId = req.session.user.userId;

    db.any("SELECT postid, title, body FROM posts WHERE userid = $1", [
        userId,
    ]).then((posts) => {
        res.render("posts", { posts: posts });
    });
});

module.exports = router;
