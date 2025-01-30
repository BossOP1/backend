import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";






const toggleVideoLike = asyncHandler(async(req,res)=>{
      const{videoId} = req.params
        
      if(!isValidObjectId(videoId)){
        throw new apiError(400,"invalid VideoId")
      }

      const videoLike = await Like.findOne( {$and :
       [ {
            video:videoId},{
            likedBy:req.user?._id
        }]}
      )

       if(videoLike){
        const unLike = await Like.findByIdAndDelete(videoLike._id)
       

       return res
        .status(200)
       .json(new ApiResponse(200,unLike,"like removed successfully"))
       }

        
       const likedVideos = await Like.create(
           { 
            likedBy : req?.user?._id,
            video : videoId
        }
       )

       return res
       .status(200)
       .json(new ApiResponse(200,likedVideos,"video has been liked successfully"))


})

const toggleCommentLike = asyncHandler(async(req,res)=>{
        const{commentId} = req.params

        if(!isValidObjectId(commentId)){
            throw new apiError(400,"invalid commentId")
        }
      
        const commentLike = await Like.findOne( {$and :
            [ {
                 comment:commentId},{
                 likedBy:req.user?._id
             }]}
           )
     
            if(commentLike){
             const unLike = await Like.findByIdAndDelete(commentLike._id)
            
     
            return res
             .status(200)
            .json(new ApiResponse(200,unLike,"like removed successfully"))
            }
     
             
            const likedComment = await Like.create(
                { 
                 likedBy : req?.user?._id,
                 comment : commentId
             }
            )
     
            return res
            .status(200)
            .json(new ApiResponse(200,likedComment,"comment has been liked successfully"))
     

})

const toggleTweetLike = asyncHandler(async(req,res)=>{
       const{tweetId} = req.params

       if(!isValidObjectId(tweetId)){
        throw new apiError(400,"invalid tweetId")
    }

    const tweetLike = await Like.findOne( {$and :
        [ {
             tweet:tweetId},{
             likedBy:req.user?._id
         }]}
       )
 
        if(tweetLike){
         const unLike = await Like.findByIdAndDelete(tweetLike._id)
        
 
        return res
         .status(200)
        .json(new ApiResponse(200,unLike,"like removed successfully"))
        }
 
         
        const likedTweet = await Like.create(
            { 
             likedBy : req?.user?._id,
             tweet : tweetId
         }
        )
 
        return res
        .status(200)
        .json(new ApiResponse(200,likedTweet,"tweet has been liked successfully"))
 
})

const getLikedVideos = asyncHandler(async(req,res)=>{
      
    const allLikedVid = await Like.find(
        {
            $and:[
      { 
        likedBy:req.user?.id,
          }             ,
     {
           video:{$exists:true}
       }
            ]
              
            }
           
    )

    if(!allLikedVid){
        throw new apiError(400,"no liked videos found")
    }

    return res
    .status(202)
    .json(new ApiResponse(200,{"total_liked_videos =": allLikedVid.length , "videos:":allLikedVid},"videos found!"))
     

})

export  {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}