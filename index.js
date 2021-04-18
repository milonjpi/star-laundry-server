const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5058;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgdqb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const servicesCollection = client
    .db(process.env.DB_NAME)
    .collection("services");

  const adminUserSet = client
    .db(process.env.DB_NAME)
    .collection("adminUser");

  const reviewsCollection = client
    .db(process.env.DB_NAME)
    .collection("reviews");

  const ordersCollection = client
    .db(process.env.DB_NAME)
    .collection("orders");

  app.get('/services', (req, res) => {
    servicesCollection.find()
    .toArray((err, services) => {
      res.send(services);
    })
  })

  app.post("/addService", (req, res) => {
    const newService = req.body;
    servicesCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post("/makeAdmin", (req, res) => {
    const newAdmin = req.body;
    adminUserSet.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.post('/isAdmin', (req, res) => {
    const adminEmail = req.body.adminEmail;
    adminUserSet.find({ adminEmail : adminEmail })
    .toArray( (err, admin) => {
      res.send(admin.length > 0);
    })
  })

  app.get('/order/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    servicesCollection.find({_id: id})
    .toArray((err, orderService) => {
      res.send(orderService);
    })
  })

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result => {
        res.send(result.insertedCount > 0)
    })
})

app.get('/orders', (req, res) => {
  const userEmail = req.query.email;
  ordersCollection.find({email: userEmail})
  .toArray((err, services) => {
    res.send(services);
  })
})

app.post('/addReview', (req, res) => {
  const review = req.body;
  reviewsCollection.insertOne(review)
  .then(result => {
      res.send(result.insertedCount > 0)
  })
})

app.get('/ordersList', (req, res) => {
  ordersCollection.find()
  .toArray((err, ordersList) => {
    res.send(ordersList);
  })
})

app.get('/reviews', (req, res) => {
  reviewsCollection.find()
  .toArray((err, reviewList) => {
    res.send(reviewList);
  })
})

app.delete('/deleteService/:id', (req, res) => {
  const id = ObjectId(req.params.id);
  servicesCollection.findOneAndDelete({_id: id})
  .then(result => {
    res.send(!!result.value)
  })
})

  //   client.close();
});


app.listen(port);
