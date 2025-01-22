import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.models.js";
import { Tweet } from "../models/tweet.models.js";

const createTweet = asyncHandler(async(req,res)=>{
       
    // 1. content from user
      const{content} = req.body

      if(!content){
        throw new apiError(400,"tweet content does not found")
      }
    // creating posttweet on database
      const postTweet = await Tweet.create({
        owner:req.user?._id,
        content:content
       } )

       if(!postTweet){
        throw new apiError(400,"tweet does not create")
       }
       // returning response
       return res
       .status(200)
        .json(new ApiResponse(
            202,
            content,
            "tweet posted successfully"
        ))
})

const getUserTweet = asyncHandler(async(req,res)=>{
   try {
         // taking user id from params URL
     const {userId }= req.params
 
     if(!isValidObjectId(userId)){
        throw new apiError(400,"userID does not found")
     }
 
     //2. getting user tweets (this gives tweets done by same userId)
     const userTweet = await Tweet.find(
         {
             owner:userId
         }
     )
 
     //3. providing user tweets
 
     return res
     .status(200)
     .json(new ApiResponse(200,
         {
             totalTweets: userTweet.length,
             userTweet : userTweet
         },
         "tweets found")
         )
   } catch (error) {
    throw  new apiError(error,error?.message || "problem in fetching tweets")
}

})

const updateTweet = asyncHandler(async(req,res)=>{
          
      try {
          // 1, taking user id from params URL and tweet id from params
          const {tweetId} = req.params
          const{content} = req.body
  
          if(!isValidObjectId(tweetId)){
             throw new apiError(400,"userID does not found")
          }
          if(!content){
              throw new apiError(400,"please write some content")
          }
  
          //2. verifying user id and tweet id are both from same user
            
            const tweet =  await Tweet.findOne({
                      owner: req.user?._id,
                      _id:tweetId
              }
               )
               if(!tweet){
                  throw new apiError(400,"unauthorized user")
               }
  
               tweet.content = content
               
               await tweet.save();
  
               return res
               .status(200)
               .json( new ApiResponse(
                  200,
                  tweet,
                  "tweet has been updated successfully"
               ))
      } catch (error) {
        throw new apiError(400,"unable to update tweet")
      }
            

})

const deleteTweet = asyncHandler(async(req,res)=>{
     
    
  try {
      // 1. finding tweet id
     const {tweetId} = req.params
       
     if(!tweetId){
      throw new apiError(404,"tweet id doesnot found")
     }
      
     // 2. verifying user id and tweet Id
       console.log("tweet owner id is",req.user?._id)
       console.log("tweet id is",tweetId)
     const validateTweet = await Tweet.findOne(
     {
           owner: req.user?._id,
          _id:tweetId
     }
     )
     if(!validateTweet){
      throw new apiError(400,"only author can delete the tweet")
     }
  
       const delTweet= await Tweet.findByIdAndDelete(tweetId)
        
       return res
       .status(200)
       .json(new ApiResponse(200,
         delTweet ,"tweet has been deleted succcessfully"))
  
  } catch (error) {
      throw new apiError(404,error.message || "cant delete tweet")
  }
})

export {
    createTweet,getUserTweet,updateTweet,deleteTweet
}