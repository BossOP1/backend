import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js";
import { apiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const toggleSubscription = asyncHandler(async(req,res)=>{
     const{channelId} = req.params

     if(!isValidObjectId(channelId)){
    throw new apiError(400,"invalid channel id")
    }
       
     const findSub = await Subscription.findOne( {$and:[ {
        subscriber : req.user?._id},
        {channel : channelId
     }]})

     if(!findSub){
        const subscribed = await Subscription.create(
            {
               subscriber:req.user?._id,
               channel:channelId
            }
        )

        if(!subscribed){
            throw new apiError(400,"error while subscribing")
        }
     }

     if(findSub){
        const unSubscribed = await Subscription.findByIdAndDelete(findSub._id)
        if(!unSubscribed){
            throw new apiError(400,"there is some error in unsubsribing the channel")
        }
     }

     return res
     .status(200)
     .json(new ApiResponse(200,{},"channel has been sunscribed/unsubscribed successfully"))

     
})

const getUserChannelSubscriber = asyncHandler(async(req,res)=>{
      const {channelId} = req.params
     // console.log("channelId",channelId)

      if(!isValidObjectId(channelId)){
        throw new apiError(400,"invalid channel Id")
      }

      const channelSubscribers = await Subscription.find({ 
        channel : channelId
      })
     
    //  console.log("fskjdvbkjsbdvkl",channelSubscribers)

      if(!channelSubscribers){
        throw new apiError(400,"no subscribers found")
      }

      return res
      .status(200)
      .json(new ApiResponse(200,channelSubscribers,"here is the list"))


})

const getSubscribedChannel = asyncHandler(async(req,res)=>{
       
    const{subscriberId} = req.params
   // console.log("subscribe id",subscriberId)

    if(!isValidObjectId(subscriberId)){
        throw new apiError(400,"invalid subscriber id")
    }

    const subscribedChannel = await Subscription.find({
           subscriber:subscriberId
    })
  //  console.log("======>",subscribedChannel)
    if(!subscribedChannel){
        throw new apiError(400,"no subscribed channel found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,subscribedChannel,"here thr list of subscribed channels"))
})

export {
    toggleSubscription,
    getSubscribedChannel,
    getUserChannelSubscriber
}