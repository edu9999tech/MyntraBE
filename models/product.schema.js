
import mongoose from "mongoose";
const productSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            default:"",
        },
        isActive:{
            type:Boolean,
            default:true,
        },
        supportedNetworks:{
            type:[String],
            default:[],
        },
        createdBy:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        },{timestamps:true}
);
export default mongoose.model("Item",productSchema);
