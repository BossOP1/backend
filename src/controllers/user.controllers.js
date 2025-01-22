import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/users.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, { Mongoose } from "mongoose";


const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        console.log("user 2 is--->",user)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
       console.log("refresh token is ^^^^^--->",refreshToken)
       console.log("Access token is ^^^^^--->",accessToken)

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        throw new apiError(500,"something went wrong in generating tokens")
    }
   
}

const registerUser = asyncHandler(async(req,res)=>{
    const { fullName, password,email,username} = req.body   // req.body  is a express js method
   //  console.log("email :",email)
    // console.log("req.body -------->",req.body)
if(
    [fullName,password,email,username].some((field)=>(field)?.trim() === "")   // .some is a js method
)    {
    throw new apiError(400,"all fields are required")
  }
     
  const existedUser = await User.findOne({            // find one is mogo Db method
    $or: [{username},{email}]
  })

  if(existedUser){
    throw new apiError(409,"user with same email or username already existed")
  }
    //  console.log("fullName-->",fullName)
    //  console.log("password--->",password)
   //   console.log("email",email)
     // console.log("username",username)



       const avatarLocalPath = req.files?.avatar[0]?.path;           //.files is a milter ethod
     //  console.log("fnkfkjd",avatarLocalPath)
    //    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
      //  console.log("req.files -------->",req.files)
     //   console.log("req.files?.avatar[0]",req.files?.avatar[0])
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
    if(!(username || email)){
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
    const {accessToken , refreshToken} =  await generateAccessAndRefreshTokens(user._id)
     //  console.log("accesstoken in login,",accessToken)
    //   console.log("refreshtoken in login",refreshToken)
    const loggedInUser = await User.findById(user._id).select("-password -refreshTokens")
    // console.log("logged in user details are **yuyuyuyuyuy*******",loggedInUser)
    // for cookies
    const options = {
        httpOnly: true,
        secure:true
    }
    return res
    .status(202)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: accessToken,refreshToken,loggedInUser
            },
            " user logged in successfully"
        )
    )



})
   
const logoutUser = asyncHandler(async(req,res)=>{
   await  User.findByIdAndUpdate(
        req.user._id,{
            $unset:{
                refreshToken:1
            }
        },
            {
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
        {},
        "user loggedout successfully"
        ))

})

const refreshAccessTokens = asyncHandler(async (req,res)=>{

    // incomingfreshtoken sent by user
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
     console.log("refresh token is--->",incomingRefreshToken)
    if(!incomingRefreshToken){
        throw new apiError(401,"user unauthorized")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )

        console.log("%%%%%%%%%",decodedToken)
         
        const user = await User.findById(decodedToken?._id)
        if (!decodedToken?._id) {
            throw new apiError(401, "Invalid token or missing user ID");
          }
          
        console.log("user  is---->",user)

        console.log("id from the user is--&&7",user._id)
        if(!user){
            throw new apiError(401,"invalid refresh token")
        }
         console.log("hbcskbckhdbvbhd--->",user?.refreshToken)
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(500,"refresh token is expired or used")
        }
    
        const options = {
            httpOnly:true,
            secure:true
        }
        
        const {accessToken,newRefreshToken} = 
        await generateAccessAndRefreshTokens(user._id)
        
        return res.status(202)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken: newRefreshToken},
                "accesss token refreshed successfully"
            )
        )
    
    
    } catch (error) {
        throw  new apiError(error,error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>
    {
     const {oldPassword,newPassword} = req.body

     const user = await User.findById(req.user?._id)

     const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

     if(!isPasswordCorrect){
        return new apiError(402,"oldPassword does not match")
     }
       user.password = newPassword
       await user.save({validateBeforeSave:false})

       return res
       .status(202)
       .json(new ApiResponse(
         200,
         {},
         "password has been changed successfully"

       ))

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(202)
    .json(new ApiResponse(202,req.user,"current user set successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
     // lets change email. and fullname
     const{email , fullName} = req.body

     if(!email || !fullName){
        throw new apiError(401,"all fields are required")
     }

      const user = await User.findByIdAndUpdate(req?.user._id,
            {
               $set:{
                email:email,
                fullName,
               
               }
            },{new:true}
      ).select("-password")

      return res
      .status(202)
      .json(new ApiResponse(200,user,"account details updated successfully"))

})

const updateAvatarDetails = asyncHandler(async(req,res)=>{

    const avatarFilePath = req.file.path

    if(!avatarFilePath){
        throw new apiError(400,"while updating avatar is missing")
    }

    const avatar = await uploadOnCloudinary(avatarFilePath)

    if(!avatar.url){
        throw new apiError(400,"avatar url not found while uploading")
    }

           const user = await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $set:{
                            avatar : avatar.url
                        }
                    }
                        ,{new:true}
                ).select("-password")

         return res
         .status(200)
         .json( 
            new ApiResponse( 200,user,"avatar changes successfully")
         )
})

const updateCoverImageDetails = asyncHandler(async(req,res)=>{

    const coverImageFilePath = req.file.path

    if(!coverImageFilePath){
        throw new apiError(400,"while updating avatar is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageFilePath)

    if(!coverImage.url){
        throw new apiError(400,"coverImage url not found while uploading")
    }

          const user = await User.findByIdAndUpdate(
                    req.user?._id,
                    {
                        $set:{
                            coverImage : coverImage.url
                        }
                    }
                        ,{new:true}
                ).select("-password")

         return res
         .status(200)
         .json(
            new ApiResponse(200,user,"coverImage changes successfully"
           )     
        )

})

const getUserCurrentProfile = asyncHandler(async(req,res)=>{

    const{username} = req.params

    if(!username?.trim()){
        throw new apiError(401,"username is missing")
    }

     const channel = User.aggregate([
          {
            $match:{
                username:username?.toLowerCase()
            }
          },
          {
            $lookup:{
                from:"subscriptions",   
                localField:"_id",
                foreignField:"channel",      
                as:"subscribers"
            }
          },
          {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
          },
          {
              $addFields:{
                subscriberCount:{
                    $size:"$subscribers"
                },
               channelIsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }   
              }
          },
        {
            $project : {
                fullName:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                channelIsSubscribedToCount:1,
                isSubscribed:1,
                email:1,

            }
          }
      ])

      if(!channel?.length){
        throw new apiError(400,"channel does not exists")
      }

      return res.
      status(200)
      .json(
        new ApiResponse(202,
          channel[0]  ,
         "channel fetched successfully"   )
        )
})

const getWatchHistory = asyncHandler(async(req,res)=>{
      
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.createFromHexString(req.user._id) // here we use this instead of only req.user?.id
                                                                          // coz we get string not correct id
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                    $lookup:{
                        from:"users",
                        localField:"owners",
                        foreignField:"_id",
                        as:"owners",
                        pipeline:[
                            {
                                $project:{
                                    fullName:1,
                                    username:1,
                                    avatar:1,
                                }
                        }
                    ]
                    }
                },
                {
                    $addFields:{
                        owner:{
                            $first:"owner"
                        }
                    }
                }
            ]
            }
        }
    ])
       
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetched successfully"
        ))
})


export {registerUser , loginUser , logoutUser , refreshAccessTokens , 
    changeCurrentPassword, getCurrentUser , updateAccountDetails ,
    updateAvatarDetails,updateCoverImageDetails,getUserCurrentProfile,
    getWatchHistory
}