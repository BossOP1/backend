import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";


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
   
export {registerUser}