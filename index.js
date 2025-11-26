const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB setup
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.cnv9fix.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("home-chepo");
    const productCollection = db.collection("products");
    const reviewCollection = db.collection("reviews");
    const addedProductCollection = db.collection("addedProductCollection");

    // Get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // Get single product by ID
    app.get("/products/:id", async (req, res) => {
      const { id } = req.params;

      try {
        let query;

        if (ObjectId.isValid(id)) {
          query = { _id: new ObjectId(id) };
        } else {
          query = { _id: id };
        }

        const product = await productCollection.findOne(query);

        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    app.get("/products/featured", async (req, res) => {
      try {
        const result = await productCollection.find().limit(6).toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // review api is here

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    // ---------------- CRUD for addedProductCollection ----------------

    // Create a new added product
    app.post("/addedProducts", async (req, res) => {
      try {
        const data = req.body;
        const result = await addedProductCollection.insertOne(data);
        res.status(201).json({ message: "Added product created", result });
      } catch (error) {
        console.error("Error creating added product:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Get all added products
    app.get("/addedProducts", async (req, res) => {
      try {
        const result = await addedProductCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching added products:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Update an added product by ID
    app.put("/addedProducts/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updates = req.body;
        const result = await addedProductCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updates }
        );
        res.json({ message: "Added product updated", result });
      } catch (error) {
        console.error("Error updating added product:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Delete an added product by ID
    app.delete("/addedProducts/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await addedProductCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.json({ message: "Added product deleted", result });
      } catch (error) {
        console.error("Error deleting added product:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    console.log("MongoDB connected successfully!");
  } finally {
    //  await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
