import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const CreatePlaylist = asyncHandler(async(req,res)=>{
     
    const{name , description} = req.body
    console.log(name,description)

    if(!name || !description){
        throw new apiError(400,"please provide some data")
    }
    const userId = req.user?._id;
    console.log(typeof(userId))

  if (!userId || !mongoose.isValidObjectId(userId)) {
    throw new apiError(400, "Invalid or missing user ID");
  }

    const playlist = await Playlist.create(
        {
            name:name,
            description:description,
            owner:new mongoose.Types.ObjectId(userId)
        }
    )
    if(!playlist){
        throw new apiError(500,"there is some problem in creating the database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"new playlist has been created"))

})

const getUserPlaylists = asyncHandler(async(req,res)=>{

    const{userId} = req.params

    if(!isValidObjectId(userId)){
        throw new apiError(400,"invalid userId")
    }

    const userPlayists = await Playlist.find(
       
           {owner:userId}
    )

    if(!userPlayists){
        throw new apiError(404,"no playlist found")
    }

      return res
      .status(200)
      .json(new ApiResponse(200,userPlayists,"user playlist fetched successsfully"))
})

const getPlaylistById = asyncHandler(async(req,res)=>{

    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"invalid playlistId")
    }

    const playlist = await Playlist.findById(
        {
            _id : playlistId
        }
    )

    if(!playlist){
        throw new apiError(400,"no playlist found!!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlist byb id has been fetched"))
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{

    const{playlistId,videoId} = req.params
   //console.log("playlistId",playlistId)
   // console.log("videoId",videoId)


    if(!isValidObjectId(playlistId)&& !(isValidObjectId(videoId))){
        throw new apiError(404,"invalid videoId or PLaylist iD")
    }

      const findPlaylist = await Playlist.findById(playlistId)

      if(!findPlaylist){
        throw new apiError(400,"no such playlist found please create a nnew playlist")
      }

     // console.log("findPlaylist",findPlaylist)
      if(!(findPlaylist.owner.equals(req.user?._id))){
        throw new apiError(402,"you are not authorized to access this playlist")
      }
     // console.log("req.user?._id)",req.user?._id)

     // console.log("findPlaylist.video",findPlaylist.video.includes(videoId))

      if(findPlaylist.video.includes(videoId)){
        throw new apiError(400,"video is already in the playlist")
      }
          
        await findPlaylist.video.push(videoId)
        const videoAdded = await findPlaylist.save()

     if(!videoAdded){
        throw new apiError(400,"there is some problem i dding video to playlist")
     }

     return res
     .status(200)
     .json(new ApiResponse(200,videoAdded,"video to playlist has been added successfully"))



})

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
     
    const{playlistId,videoId} = req.params

    if(!isValidObjectId(playlistId)&& !(isValidObjectId(videoId))){
        throw new apiError(404,"invalid videoId or PLaylist iD")
    }

    const findPlaylist = await Playlist.findById(playlistId)
    
    if(!findPlaylist){
        throw new apiError(400,"no such playlist found please create a nnew playlist")
      }

      if(!(findPlaylist.owner.equals(req.user?._id))){
        throw new apiError(402,"you are not authorized to access this playlist")
      }

      if(!findPlaylist.video.includes(videoId)){
        throw new apiError(400,"no such video in the playlist")
      }

      await findPlaylist.video.pull(videoId)
      const videodelted = await findPlaylist.save()

      if(!videodelted){
        throw new apiError(400,"there is some problem deleting video from playlist")
     }

     return res
     .status(200)
     .json(new ApiResponse(200,{},"video to playlist has been deleted successfully"))




})

const deletePlaylist = asyncHandler(async(req,res)=>{
      
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new apiError(404,"invalid playlist id")
    }


    
     const playlist = await Playlist.findById(playlistId)

     if(!playlist){
        throw new apiError(500,"there is some error in finding the playlist")
     }

     if(!playlist.owner.equals(req.user?._id)){
        throw new apiError(400,"you are not authorizes to delete the playlist")
     }

     const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

     if(!deletePlaylist){
        throw new apiError(500,"there is some error in delteing the playlist")
     }

    
     res
     .status(200)
     .json(new ApiResponse(200,{},"playlist has been deleted successfully"))
     
})

const updatePlaylist = asyncHandler(async(req,res)=>{
  
    const {playlistId} = req.params
    const {name,description} = req.body

  //  console.log("playlistId",playlistId)
  //  console.log("name",name)
//console.log("description",description)

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"invalid playlistId")
    }

    if(!name || !description){
        throw new apiError(400,"please write something to update")
    }

    const playlist = await Playlist.findById(playlistId)

   // console.log("playlist.owner",playlist.owner)
  //  console.log("req.user?._id",req.user?._id)

    
    if(!playlist.owner.equals(req.user?._id)){
        throw new apiError(400,"you are not authorized to update the playlist")
    }

     
        playlist.name = name|| playlist.name,
      playlist.description= description|| playlist.description
    

        const updatedPlaylist = await playlist.save()

        return res
        .status(200)
        .json(new ApiResponse(200,updatedPlaylist,"playlist has been updated successfully"))

})



export {CreatePlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}