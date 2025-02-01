import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Video } from "../models/video.models.js"
import { apiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { getAllVideos } from "./video.controllers.js"




const getChannelStats = asyncHandler(async(req,res)=>{
    
    const{userId} = req.params
    console.log("userid ==>",userId)

    if(!isValidObjectId(userId)){
        throw new apiError(400,"user Id does not found")
    }
   
  
         const videoCount = await Video.aggregate ([
          {
            $match: {
              owner: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $group: {
              _id: "$views",
              totalViews: {
                $sum: "$views",
              },
              totalVideos: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalVideos: 1,
              totalViews: 1,
            },
          },
        ]
      
      )
  

  
        const findSub = await Subscription.aggregate(
            [
                {
                  $match: {
                    channel: new mongoose.Types.ObjectId(userId)
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalSubscriberCount: {
                      $sum: 1,
                    },
                  },
                },
                {
                  $project: {
                    _id :0,
                    totalSubscriberCount:1
                  }
                }
              ]
        )



    const likedCount = await Like.aggregate(
        [
            {
              $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "Videoinfo",
              },
            },
            {
              $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetInfo",
              },
            },
            {
              $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "commentInfo",
              },
            },
            {
              $unwind: {
                path: "$Videoinfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$tweetInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$commentInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $match: {
                $or: [
                  {
                    "Videoinfo.owner": new mongoose.Types.ObjectId(userId

                    ),
                  },
                  {
                    "tweetInfo.owner": new mongoose.Types.ObjectId(userId),
                  },
                  {
                    "commentInfo.owner": new mongoose.Types.ObjectId(userId),
                  },
                ],
              },
              
            },
            {
                       $group: {
                           _id: null,
                           totalLikes: { $sum: 1 }
                       }
                   },
                   {
                       $project: {
                           _id: 0,
                           totalLikes: 1
                       }
                   }
          ]

    )
    
   
    const info = {
        views: videoCount?.[0]?.totalViews || 0,
        videos: videoCount?.[0]?.totalVideos || 0,
        totalSubs: findSub?.[0]?.totalSubscriberCount || 0,
        totalLike: likedCount?.[0]?.totalLikes || 0,
      };

    return res
     .status(200)
     .json(
         new ApiResponse(
             200,
             info,
             "Fetched data"
         )
     )
 })

    const getChannelVideos = asyncHandler(async(req,res)=>{
        const {channelId} = req.params
        if(!isValidObjectId){
            throw new apiError(400,"invalid channel id")
        }
        const allVideos = await Video.aggregate(
        
            [
                {
                    $match:{
                        owner:new mongoose.Types.ObjectId(channelId)
                    }
                },
                {
                    $project:{
                        videoFile:1,
                        thumbnail:1,
                        title:1,
                        duration:1,
                        views:1,
                        isPublished:1,
                        owner:1,
                        createdAt:1,
                        updatedAt:1
                    }
                }
            ]
        )

        return res
        .status(200)
        .json(new ApiResponse(200,allVideos,"videos fetched successfully"))

   
         
    })


 export {getChannelStats,getChannelVideos}

