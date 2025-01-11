import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new apiError(500,"something went wrong in ggenerating tokens")
    }
   
}

const registerUser = asyncHandler(async(req,res)=>{
    const { fullName, password,email,username} = req.body   // req.body  is a express js method
   //  console.log("email :",email)
    // console.log("req.body -------->",req.body)
if(
    [fullName,password,email,username].some((field)=>(field)?.trim === "")   // .some is a js method
)    {
    throw new apiError(400,"all fields are required")
  }
 
  const existedUser = await User.findOne({            // find one is mogo Db method
    $or: [{username},{email}]
  })

  if(existedUser){
    throw new apiError(409,"user with same email or username already existed")
  }
    
       const avatarLocalPath = req.files?.avatar[0].path;           //.files is a milter ethod
       const coverImageLocalPath = req.files?.coverImage[0].path;
    //   console.log("req.files -------->",req.files)

       if(!avatarLocalPath){
          throw new apiError(400,"avatar not exist")
       }

       if(!coverImageLocalPath){
        throw new apiError(400,"coverImage not exist")
     }

     const avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if(!avatar){
        throw new apiError(400,"avatar not exist")
    }

  

   const user = await User.create({                   // .create is a mongoose method
        fullName,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        password,
        username : username.toLowerCase(),

    })
         const createdUser = await User.findById(user._id).select(
            "-password -refreshTokens"
         )

         if (!createdUser) {
            throw new apiError(500,"something went wrong in the user registration")
         }

         return res.status(202).json(
            new ApiResponse(200,createdUser,"user registered successfully")
         )
}
)

const loginUser = asyncHandler(async(req,res)=>{
     
    // data from the user
    const {username,email,password} = req.body

    // checks for user name and email 
    if(!username || !email){
        throw new apiError(404,"username or email is required")
    }
     
      // find the user with same username and email
     const user = await User.findOne({
        $or:[{username},{email}]
    })
      
    // if user does not found
    if(!user){
        throw new apiError(400,"please register the user first")
    }

    // check for password
   const passwordCheck = await user.isPasswordCorrect(password);

   if(!passwordCheck){
    throw new apiError(401,"incorrect password")
   }
     
   // access and refresh token
    const {accessToken , refreshToken} =  await generateAccessAndRefreshToken(user._Id)

    const loggedInUser = User.findById(user._Id).select("-password -refreshTokens")

    // for cookies
    const options = {
        httpOnly: true,
        secure:true
    }
    return res
    .status(202)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshTokens",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:accessToken,refreshToken,loggedInUser
            },
            " user logged in successfully"
        )
    )



})
   
const logoutUser = asyncHandler(async(req,res)=>{
   await  User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            },
            new:true,
        }
     )

     const options = {
        httpOnly: true,
        secure:true
    }

    return res.status(202)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,
        {

        },
        "user loggedout successfully"
        ))

})



export {registerUser , loginUser , logoutUser}