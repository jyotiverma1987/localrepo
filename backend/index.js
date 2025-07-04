const express = require('express');
const cors = require('cors');
require('./db/config');
const User = require('./db/User');
const Product = require('./db/Product');
const app = express();
const Jwt = require('jsonwebtoken');
const jwtKey = 'e-comm';

app.use(express.json());
app.use(cors());

app.post('/register', async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            res.send({ result: "Some thing went error .Please try again" });
        }
        res.send({ result, auth: token });

    });

    // res.send(result);
})

app.post('/login', async (req, res) => {
    let user = await User.findOne(req.body).select("-password");
    if (req.body.password && req.body.email) {
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: "Some thing went error .Please try again" });
                }
                res.send({ user, auth: token });

            });

        } else {
            res.send({ result: "No user found" });
        }
    } else {
        res.send({ result: "No user found" });
    }


})

app.post('/add-product',verifyToken, async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);
})

app.get('/products',verifyToken, async (req, res) => {
    let products = await Product.find();
    if (products.length > 0) {
        res.send(products);
    } else {
        res.send({ result: 'No products Found' });
    }
})

app.delete('/product/:id', verifyToken,async (req, res) => {
    const product = await Product.deleteOne({ _id: req.params.id })
    res.send(product);
})

app.get('/product/:id',verifyToken, async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    if (product) {
        res.send(product);
    } else {
        res.send({ result: 'No products Found' });
    }

});

app.put('/product/:id',verifyToken, async (req, res) => {
    const product = await Product.updateOne({ _id: req.params.id },
        { $set: req.body })
    res.send(product);
});

app.get('/search/:key',verifyToken, async (req, res) => {
    let result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { price: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }
        ]
    })
    res.send(result);
});

function verifyToken (req,res,next){
    let token=req.headers['authorization'];
    if(token){
        token=token.split(' ')[1];
        Jwt.verify(token,jwtKey,(err,valid)=>{
if(err){
res.status(401).send({result:'Please provide verify token'});
}else{
next();
}
        })
    }else{
        res.status(403).send({result:'Please provide verify token'});
    }
 //console.warn("middleware called",token);
// next();
}
app.listen(5000);