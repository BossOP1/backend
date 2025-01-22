import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";




const getAllVideos = asyncHandler(async(req,res)=>{

})

const publishAVideo = asyncHandler(async(req,res)=>{
    // from frontend
    const{title,description} = req.body

    try {
        if(
            [title,description].some((field)=>(field?.trim()=== "")) 
            ){
                throw new apiError(400,"all fields are requird")
            }
             /// getting localfilepath from the frontend attached file
            const thumbnailLocalPath = await req.files?.thumbnail[0]?.path
    
            if(!thumbnailLocalPath){
                throw new apiError(404,"thumbnail not found")
            }
              
        
            const videofileLocalPath = await req.files?.videofile[0]?.path
    
            if(!videofileLocalPath){
                throw new apiError(404,"videofile not found")
            }
    
            const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
            const videofile  = await uploadOnCloudinary(videofileLocalPath)
    
            if(!thumbnail){
                throw new apiError(404,"thumbnail not uploading to cloudinary")
            }
    
            if(!videofile){
                throw new apiError(404,"videofile not uploading to cloudinary")
            }
             // creating database
            const video = await Video.create({
                 videofile:videofile?.url || "",
                 thumbnail:thumbnail?.url||"",
                 title,
                 description,
                 duration:videofile.duration,
                 isPublished:true,
                 owner:req.user?._id
            })
    
            if(!video){
                throw new apiError(500,"file not uploaded to databse")
            }
            
            return res
            .status(202)
            .json(new ApiResponse(202,
             video,
            "video has been uploaded successfully"))
    } catch (error) {
        throw new apiError(400,error.message || " problem in uploadvideo method")
    }
    
    

})

const getVideoById = asyncHandler(async(req,res)=>{

   try {
     const{videoId} = req.params
 
     if(!isValidObjectId(videoId)){
         throw apiError(400,"invalid video id")
     }
 
     const video = await Video.findById(videoId);
 
     if(!video){
         throw new apiError(404," video does not found")
     }
 
     return res
     .status(202)
     .json(new ApiResponse(202,
         video,
         "video has been fetched successfully"))
   } catch (error) {
    throw new apiError(400,error?.message || "some problem in getting video")
   }

})

const updateVideo = asyncHandler(async(req,res)=>{
    const{videoId} = req.params

    const{title,description} = req.body

    if(! isValidObjectId(videoId)){
        throw new apiError(404,"video id is invalid")
      }

      const video = await Video.findById(videoId)

      if ( !video.owner.equals( req.user._id ) )
             { throw new apiError( 403, "You are not authorized to update this video" ); }

      


})

const deleteVideo = asyncHandler(async(req,res)=>{
       // extract video id from the params
    try {
          const{videoId} = req.params
    
          if(! isValidObjectId(videoId)){
            throw new apiError(404,"video id is invalid")
          }
       // find the video
       const video = await Video.findById(videoId)
           
    
        // validate the user if user is authorizes to delete the video  (if owner id is equal to user id)    
    
           // console.log("owner id is",req.user?._id)
           // console.log("videosIdis",videoId)
    
            if ( !video.owner.equals( req.user._id ) )
             { throw new apiError( 403, "You are not authorized to delete this video" ); }
    
    
          // find the id and then delete
    
            const deleteVid = await Video.findByIdAndDelete(videoId)  ;   
    
            if(!deleteVid){
                throw new apiError(404,"there is some error in deleting the video")
            }
           
            return res
            .status(202)
            .json( new ApiResponse(202,
                deleteVid,
                "the video has been deleted successfully"))
    
    } catch (error) {
        throw new apiError(202,error?.message || "error in deleting the video")
    }

})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const{videoId} = req.params

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}


