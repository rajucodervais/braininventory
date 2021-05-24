import mongoose from "mongoose";


const scheama = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    mobile: { type: String, unique: true },
    age: { type: Number, min: 18, max: 90 },
    dob: { type: Date },
    image: String,
    password: String
})


const Users = mongoose.model('users', scheama);

export default Users;