import mongoose , {schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
    {
        username:{
          type:String,
          unique:true,
          lowercase: true,
          required:true,
          trim:true,
          index:true          // helps in searching on Database
        },
        email:{
            type:String,
            unique:true,
            lowercase: true,
            required:true,
            trim:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,  
            index:true,
        },
        avatar:{
            type:String,       //cloudinary
            required:true,
        },
        coverImage:{
            type:String,       //cloudinary
            required:true,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type:String,
            required: [true, 'Password is required'] 
        },
        refreshTokens:{
            type:String,
        }

    },
    {
        timestamps:true,
    }
    )
     
    // .pre is middleware that is executed just before the save
    // dont use call back function as it willl create more problems later ion so avoid using it
    userSchema.pre("save", async function(next){  
        if(!this.isModified("password")) return next() // this line ensures that the encryption works only when passwoprd is modified

        this.password = await bcrypt.hash(this.password,10)   // this line is encrypting the password .hash is a method and 10 denotes the rounds of encryption
        next()
    })

    // now in order to match the password we are creating a custom method

    userSchema.methods.isPasswordCorrect = async function(password){
       await bcrypt.compare(password , this.password)
    }
    
    userSchema.methods.generateAccessToken = async function(){
        return jwt.sign(
            {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName

        },
          process.env.ACCESS_TOKEN_SECRET,
          {
              expiresIn : process.env.ACCESS_TOKEN_EXPIRY
          }
        )
    }
    userSchema.methods.generateRefreshToken = async function(){
        return jwt.sign(
            {
            _id : this._id,

        },
          process.env.REFRESH_TOKEN_SECRET,
          {
              expiresIn : process.env.REFRESH_TOKEN_EXPIRY
          }
        )
    }

export const User = mongoose.model("User",userSchema)