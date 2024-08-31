import { Schema, model, models } from "mongoose";
    
const UserSchema = new Schema(
    {
        publicKey: {type: "string", required: true, unique: true},
        signature: {type: "string", required: true,  unique: true},
        username: {type: "string", unique: true},
    },
    {
        timestamps: true
    }
)

const User = models.User || model("User", UserSchema);

export default User;    