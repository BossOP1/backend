import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.models.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";




const getVideoComments = asyncHandler(async(req,res)=>{

})

const addComment = asyncHandler(async(req,res)=>{
    
    try {
        const{content} = req.body
        const{videoId} = req.params
        console.log("req.params", req.params);  // This will show all params

        console.log("videoId",videoId)
        if(!content){
            throw new apiError(404,"write something to comment")
        }
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            throw new apiError(400, "Invalid video ID");
        }
    
    
        const comment = await Comment.create({
            content,
            video:videoId,
            owner: new mongoose.Types.ObjectId( req.user?._id )
          }   
        )
        if ( !comment ) { throw new apiError( 500, "Comment not Saved to Db" ) }
        
       return res
        .status(200)
        .json( new ApiResponse(200,comment,"comment successful"))
    
    
    } catch (error) {
        throw new apiError(500, error.message || "there is some error in adding a comment")
    }

})

const updateComment = asyncHandler(async(req,res)=>{

    try {
        const{content} = req.body
        const{commentId}=req.params
       console.log("content",content)
       console.log("commentID",commentId)
        if(!content){
            throw new apiError(400,"please write something")
        }
        
          
        if(!isValidObjectId(commentId)){
            throw new apiError(400,"invalid comment id")
        }

    
       
       console.log("--->",req.owner)
       console.log("==>",req.user?._id)

       const comment = await Comment.findOne( {
        _id: commentId,    // find comment by commentId
        owner: req.user._id   // find owner of comment by req.user._id
    } )
        
    if(!comment){
        throw new apiError(400,"comment does not found")
    }

       comment.content = content
        
        return res
        .status(200)
        .json(new ApiResponse(200,comment,"the comment has been updated successfully"))
    
         
      }  catch (error) {
        throw new apiError(500,error.message || "there is some error in updating comment")
    }
  }
)

const deleteComment = asyncHandler(async(req,res)=>{
   
    try {
        const{commentId} = req.params
    
        if(!isValidObjectId(commentId)){
            throw new apiError(404,"comment does not found")
        }
         
        const comment = await Comment.findOne( {
            _id: commentId,    // find comment by commentId
            owner: req.user._id   // find owner of comment by req.user._id
        } )

        if(!comment){
            throw new apiError(400,"you are not authorizes to delete the data")
        }
      
        const delComment = await Comment.findOneAndDelete(commentId)
    
        return res
        .status(200)
        .json( new ApiResponse(202,delComment,"comment has been deleted successfully"))
    
    } catch (error) {
        throw new apiError(500,error.message || "there is some error in deleting comment")
    }
})

export {
    getVideoComments,addComment,updateComment,deleteComment
}