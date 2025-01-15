import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({
      
       subscriber:{
        type:Schema.Types.ObjectId,  // onee who is subscribing
        ref:"User"
       },
       channel:{
        type: Schema.Types.ObjectId,    // one to whom a subscriber is subscribing
        ref:"User"
       }
    },
    {timestamps:true,}
)

export const Subscription =  mongoose.model("Subscription",subscriptionSchema)