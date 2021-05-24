import express from "express";
import Users from "../models/userModel.js";
import bcrypt from "bcrypt";
import base64ToImage from "base64-to-image";
const salt = 10;
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import Product from "../models/ProductModel.js";
import auth from "../config/auth.js";
import { fromString } from "uuidv4";
const TOKEN_SECRET = 'asdfasdfasdflajsdlfaksdflasdf';
import fs from "fs"
var router = express.Router();

// middleware



router.get('/users', async (req, res) => {
    await Users.find((err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result)
        }
    })

})


router.post('/signup', async (req, res) => {

    var { name, email, mobile, age, dob, password, image } = req.body;
    var HashPassword = bcrypt.hashSync(password, salt);
    var base64 = '-'
    if (image != '') {
        var base64 = await base64toImage(image);
    }
    var data = {
        name: name,
        email: email,
        password: HashPassword,
        age: age,
        dob: dob,
        image: base64,
        mobile: mobile
    }
    await Users.find({ email: email }, async (err, findEmail) => {
        if (err) {
            res.status(500).send(err)
        } else {
            if (findEmail.length != 0) {
                res.json({
                    "status": 500,
                    "message": "Email already exists"
                })
            } else {
                await Users.find({ mobile: mobile }, async (err, findMobile) => {
                    if (err) {
                        res.status(500).send(err)
                    } else {
                        if (findMobile.length != 0) {
                            res.json({
                                "status": 500,
                                "message": "Mobile already exists"
                            })
                        } else {

                            await Users.create(data, (err, result) => {
                                if (err) {
                                    res.json({
                                        "status": 500,
                                        "message": err
                                    })
                                } else {
                                    res.json({
                                        status: 201,
                                        message: "Sign Up Successfully",
                                        data: result
                                    })
                                }
                            })
                        }

                    }
                })
            }

        }

    })
})



router.post('/signin', async (req, res) => {

    var { username, password } = req.body;

    await Users.find({
        $or: [
            { 'email': username },
            { 'mobile': Number(username) }
        ]
    }, async (err, data) => {
        if (err) {
            res.status(500).send(err.message)
        } else {
            console.log(data[0].password)
            if (data.length != 0) {
                if (bcrypt.compareSync(password, data[0].password)) {
                    var token = jwt.sign({ id: data[0]._id }, TOKEN_SECRET, {
                        expiresIn: 86400 // expires in 24 hours
                    });
                    res.status(200).send({ loggedIn: true, token: token, data: data[0] });
                } else {
                    res.json({
                        status: "500",
                        message: "password does not match"
                    })
                }
            } else {
                res.json({
                    status: "404",
                    message: "User does not exists"
                })
            }
        }
    });

})


// product routes

router.get('/product', verifyToken, async (req, res) => {
    await Product.find((err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result)
        }
    })

})


router.post('/product', verifyToken, async (req, res) => {
    const { name, image, price, description } = req.body;
    var base64 = '-'
    if (image != '') {
        var base64 = await base64toImage(image);
    }
    var product = {
        name: name,
        price: price,
        description: description,
        image: base64
    }
    await Product.create(product, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(result)
        }
    })

})


router.put('/product/:id', verifyToken, async (req, res) => {
    const { name, image, price, description } = req.body;
    var product = {
        name: name,
        price: price,
        description: description,
    }
    if (image != '') {
        var base64 = await base64toImage(image);
        var path = '../image/' + image;
        if (fs.existsSync(path)) {
            fs.unlinkSync(path)
        }
        product.image = base64;
    }

    await Product.updateOne({ _id: req.params.id }, product, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result)
        }
    })

})


router.get('/product/:id', verifyToken, async (req, res) => {
    await Product.findOne({ _id: req.params.id }, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(result)
        }
    })

})

router.delete('/product/:id', verifyToken, async (req, res) => {
    await Product.deleteOne({ _id: req.params.id }, (err, result) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(result)
        }
    })

})

export default router;


async function base64toImage(images) {
    var optionalObj = { 'fileName': uuidv4(), 'type': 'png' };
    var data = {};
    var imageUrl = '-';
    if (images != '-') {
        data = await base64ToImage(images, '../image/', optionalObj);
        imageUrl = data.fileName;
    }
    return imageUrl;
}

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.status(403).send('you have no permission');
    }

}