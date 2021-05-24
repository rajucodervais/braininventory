import mongoose from "mongoose";


const scheama = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    price: Number
})


const Product = mongoose.model('products', scheama);

export default Product;