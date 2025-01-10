import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler(async(req,res)=>{
    const { fullname , firstName , lastName , password,email} = req.body   // req.body  is a express js method
     console.log("email :",email)
if(
    [fullname,firstName,lastName,password,email].some((field)=>(field)?.trim === "")   // .some is a js method
)    {
    throw new apiError(400,"all fields are required")
  }
 
  const existedUser = User.findOne({            // find one is mogo Db method
    $or: [{userName},{email}]
  })

  if(existedUser){
    throw new apiError(409,"user with same email or userName already existed")
  }
    
       const avatarLocalPath = req.files?.avatar[0].path;           //.files is a milter ethod
       const coverImageLocalPath = req.files?.coverImage[0].path;

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
        fullname,
        email,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        password: userName.lowerCase(),

    })
         const createdUser = await findUseeById(user._id).select(
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