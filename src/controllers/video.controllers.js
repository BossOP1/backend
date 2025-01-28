import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import{apiError} from "../utils/apiError.js"


const getAllVideos = asyncHandler(async(req,res)=>{

    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = 1, userId = "" } = req.query
    if(userId && !mongoose.Types.ObjectId.isValid(userId)){
     throw new apiError(400,"userId invalid")
    
    }
    const sortOrder = parseInt(sortType, 10) === -1 ? -1 : 1;
    let pipeline = [
      // Match videos based on query and userId
      {
        $match: {
          $and: [
            {
              $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
              ],
            },
            ...(userId
              ? [
                  {
                    Owner: mongoose.Types.ObjectId.createFromHexString(userId),
                  },
                ]
              : []),
          ],
        },
      },
    
      // Lookup to fetch user details
      {
        $lookup: {
          from: "users",
          localField: "Owner",
          foreignField: "_id",
          as: "Owner",
          pipeline: [
            {
              $project: {
                _id: 1,
                fullName: 1,
                username: 1,
                avatar:1,
              },
            },
          ],
        },
      },
    
      // Extract first user from the Owner array
      {
        $addFields: {
          Owner: {
            $first: "$Owner",
          },
        },
      },
    
      // Sort videos
      {
        $sort: { [sortBy]: sortOrder }, 
          },
    ];
      try {
      
        const options = {  // options for pagination
          page: parseInt( page ),
          limit: parseInt( limit ),
          customLabels: {   // custom labels for pagination
              totalDocs: "totalVideos",
              docs: "videos",
          },
      };
      
      const result = await Video.aggregatePaginate(
        Video.aggregate(pipeline),options)
        console.log("main pipeline is",pipeline)
        console.log("Pipeline result: ", result);
        console.log("Pipeline:", JSON.stringify(pipeline, null, 2));
      if(result?.videos?.length === 0){
        throw new apiError(400,"no video found")
      }

      return res
      .status(200,
        new ApiResponse(200,result,"videos has been fetched successfully"))
   
      } catch (error) {
        throw new apiError(400 ,error.message || "there is inside problem in pagination")
      }

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
        throw new apiError(400,error.message || " problem in upload video method")
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
   try {
     const{videoId} = req.params
 
     const{title,description} = req.body
 
     if(! isValidObjectId(videoId)){
         throw new apiError(404,"video id is invalid")
       }
 
       const video = await Video.findById(videoId)
         
       if(!video){
        throw new apiError(404,"video does not found")
       }

 
       if ( !video.owner.equals( req.user._id ) )
              { throw new apiError( 403, "You are not authorized to update this video" ); }
                

              let thumbnailUrl = video.thumbnail
              const thumbnailLocalPath = req?.file?.path
             if(thumbnailLocalPath){
                const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
 
                if(!uploadThumbnail.url){
                   throw new apiError(500,"updating thumbnail not found")
                }
                thumbnailUrl = uploadThumbnail.url;
             }
            
 
              const videoFile = await Video.findByIdAndUpdate(videoId,{
                   
                 $set:{
                     title:title || video.title,
                     thumbnail : thumbnailUrl,
                     description : description || video.description,
 
                 }
 
              },{new:true}
              )
 
 
               return res
               .status(202)
               .json(new ApiResponse(200,videoFile,"video updated successsfully"))
       
 
 
   } catch (error) {
    throw new apiError(500,"final update not successful")
   }
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

       if(!video){
        throw new apiError(404,"video does not found")
       }
           
    
        // validate the user if user is authorizes to delete the video  (if owner id is equal to user id)    
    
           // console.log("owner id is",req.user?._id)
           // console.log("videosIdis",videoId)
    
            if ( !video.owner.equals( req.user._id ) )
             { throw new apiError( 400, "You are not authorized to delete this video" ); }
    
    
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
        throw new apiError(500,error?.message || "error in deleting the video")
    }

})

const togglePublishStatus = asyncHandler(async(req,res)=>{
    const{videoId} = req.params

    if(!isValidObjectId(videoId)){
      throw new apiError(400,"invalid video id")
    }

    const toggleIsPublished = await Video.findOne(
      {
        owner: req.user?._id,
        _id:videoId,
      }
    )

    if(!toggleIsPublished){
      throw new apiError(400,"video does not found")
    }
    
    toggleIsPublished.isPublished = !toggleIsPublished.isPublished

    await toggleIsPublished.save()

    return res
    .status(200)
    .json(new ApiResponse(200,toggleIsPublished.isPublished,"toggle has been publishes successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

}


