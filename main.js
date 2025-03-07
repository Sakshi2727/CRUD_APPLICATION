require("dotenv").config();
const express=require("express")
const session=require("express-session")
const mongoose=require("mongoose")

const app=express();
const PORT=process.env.PORT || 4000

mongoose.connect(process.env.DB_URI,{useNewURLParser: true})
const db=mongoose.connection;
db.on("error",(error)=> console.log(error))
db.once("open",()=>console.log("connected to databse"))

app.use(express.urlencoded({extended:false}))
app.use(express.json());
app.use(
    session({
        secret:"my secret key",
        saveUninitialized:true,
        resave:false
    })
)
app.use((req,res,next)=>{
    res.locals.message=req.session.message
    delete req.session.message
    next()
})
// this converts the uploads folder to static
app.use(express.static("uploads"))
app.set('view engine','ejs')

//   router
app.use("",require("./routes/routes"))

app.listen(PORT,()=>{
    console.log(`Server started at http://localhost:${PORT}`)
})

