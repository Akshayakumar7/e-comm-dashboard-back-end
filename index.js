// // const express = require("express");
// // const app = express();
// // const mongoose = require("mongoose");

// // const connectDB = async () => {
// //     mongoose.connect("mongodb+srv://akshayakumaras:hJsK6YEl6ddftNeg@createecommdashboard.xdtiolh.mongodb.net/?retryWrites=true&w=majority");
// //     const productSchema = new mongoose.Schema({});
// //     const product = mongoose.model("movies", productSchema);
// //     const data = await product.find();
// //     console.log(">>>", data)

// // }

// // connectDB()

// const express = require("express");
// const app = express();
// const { MongoClient } = require('mongodb');
// const url = "mongodb+srv://akshayakumaras:hJsK6YEl6ddftNeg@createecommdashboard.xdtiolh.mongodb.net/?retryWrites=true&w=majority";
// const client = new MongoClient(url);
// const database = "e-comm";


// async function getData() {
//     let result = await client.connect();
//     let db = result.db(database);
//     let connection = db.collection("users");
//     let response = await connection.find({}).toArray()
//     console.log("response", response);
// }

// getData();


// app.get("/", (req, resp) => {
//     resp.send("app is running...>>>>>>>>>")
// });

// app.listen(5000)


const express = require('express');
const cors = require("cors")
require("./db/config");
const users = require("./db/Users");
const app = express();
const Product = require("./db/Product")

app.use(express.json());
app.use(cors())

app.post("/register", async (req, resp) => {
    try {
        let data = new users(req.body);
        let result = await data.save();
        result = result.toObject();
        delete result.password
        console.log("result", result);
        resp.send(result);
    } catch (error) {
        console.error("Error creating product:", error);
        resp.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req, resp) => {
    if (req.body.password && req.body.email) {
        let user = await users.findOne(req.body).select('-password');
        if (user) {
            resp.send(user);
        }
    }
    else {
        resp.send({ result: "User not found" })
    }
});


app.post("/add-product", async (req, resp) => {
    let product = new Product(req.body);
    let result = await product.save();
    resp.send(result)
});


app.get("/products", async (req, resp) => {
    try {
        const products = await Product.find();
        if (products.length > 0) {
            resp.send(products);
        } else {
            resp.send({ result: "No Product found" });
        }
    } catch (error) {
        resp.status(500).send({ error: "Internal Server Error" });
    }
});

app.delete("/delete/:id", async (req, resp) => {
    let result = await Product.deleteOne({ _id: req.params.id });
    resp.send(result)
});

app.get("/product/:id", async (req, resp) => {
    let result = await Product.findOne({ _id: req.params.id });
    if (result) {
        resp.send(result)
    } else {
        resp.send("No record found")
    }
});



app.put("/update/:_id", async (req, resp) => {
    console.log(req.params);
    let data = await Product.updateOne(
        req.params,
        {
            $set: req.body
        }
    );
    resp.send(data);
    console.log(data)
});


app.get("/search/:key", async (req, resp) => {
    try {
        const result = await Product.find({
            "$or": [
                { name: { $regex: new RegExp(req.params.key, 'i') } },
                {
                    company: { $regex: new RegExp(req.params.key, 'i') } 
                }
            ]
        });
        resp.send(result);
    } catch (error) {
        console.error('Error searching products:', error);
        resp.status(500).json({ message: 'Internal Server Error' });
    }
});


app.listen(4000)