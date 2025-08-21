import mongoose,{Schema} from 'mongoose'

const userSchema= new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin", "moderator"]
        
    },
    skills:[String],
    createdAt:{
        type: Date,
        default: Date.now
    }
},{timestamps:true})


export default mongoose.model("User",userSchema);