import express from "express";
import mongoose from "mongoose";
import Cors from "cors";
import UserRoute from "./routes/users.js"
import bodyParser from "body-parser"
var app = express();
var port = process.env.PORT || 4000;



app.use(express.json({ limit: '50mb' }));
app.use(Cors());


// db configuration
var mongoose_url = "mongodb+srv://task:task@cluster0.cnppc.mongodb.net/task?retryWrites=true&w=majority";

mongoose.connect(mongoose_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true

})


// routing
app.get('/', (req, res) => {
    res.status(200).send('hello world')
})
app.use('/api', UserRoute)




// app listen

app.listen(port, () => {
    console.log(`server running on : ${port}`);
})
