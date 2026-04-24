const express = require('express');
const app = express();
const path = require('path');
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookie = require('cookie')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const connectDb = require("./config/db")
const jwt = require('jsonwebtoken');
const upload = require("./config/multer");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 



const isLoggedIn =  (req, res, next)=>{
    if(!req.cookies.token) return res.send("login first");
    const data = jwt.verify(req.cookies.token,"shhhh");
    req.user = data;
    next();
};

app.get("/",(req,res)=>{
    res.render('index.ejs');
});

app.get("/login",(req, res)=>{
    res.render("login.ejs");
});

app.get("/post",isLoggedIn,async (req, res)=>{
    const user = await userModel.findOne({username:req.user.username});
    const posts = await postModel.find().populate('user');
    res.render("post.ejs",{user , posts});
});

app.get("/like/:postId/:userId", async (req, res)=>{
    const postId = req.params.postId;
    const userId = req.params.userId;
    const post  = await postModel.findOne({_id:postId}).populate('user');
    if(post.likes.indexOf(userId)===-1){
         post.likes.push(userId);
    }else{
        post.likes.splice(post.likes.indexOf(userId), 1);
    }
   
    await post.save();
    res.redirect("/post");
});

app.post("/signup", upload.single("file"), async (req,res)=>{
    const {username, name,password, email, age} = req.body;
    const profilepic = req.file.filename;

    const user  = await userModel.findOne({username});
    if(user) return res.status(400).send("user already exist"); 

    bcrypt.hash(password, 10, async (err,hash)=>{
        const user = await userModel.create({
            username,
            name,
            password:hash,
            email,
            age,
            profilepic:profilepic
        })
        const token = jwt.sign({username},"shhhh");
        res.cookie('token', token );
        res.redirect("/post");        
    })      
});

app.post("/login",async (req,res)=>{
    const {username, password} = req.body;
    const user = await userModel.findOne({username});
    if(!user) return  res.send("something went Wrong");
    bcrypt.compare(password, user.password, (err, result)=>{
        if(result){
            const token = jwt.sign(({username:user.username}), "shhhh");
            res.cookie("token", token);
            res.redirect("/post");        
        }else{
            res.redirect("/login");
        }
    })
});

app.get("/logout",(req, res)=>{
     res.cookie("token", "");
     res.redirect("/login");
});

app.get("/post/edit/:postId", isLoggedIn, async (req, res)=>{
    const postId = req.params.postId;
    const post = await postModel.findOne({_id:postId})
    res.render("editPost.ejs", {post});
})

app.post("/post/edit/:postId",isLoggedIn, async (req, res)=>{
    const content = req.body.content;
    const postId  = req.params.postId;
    const post = await postModel.findOneAndUpdate({_id:postId},{content}, {new:true});
    res.redirect("/post");

})

app.post("/post",isLoggedIn, async (req, res)=>{
  const user = await userModel.findOne({username:req.user.username});
  const post = await postModel.create({
    user:user._id,
    content: req.body.content
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/post");
})

connectDb();
app.listen(3000,()=>{
    console.log("server is rinnning on port 3000");
})