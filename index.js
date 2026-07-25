require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
// Middleware---
app.use(cors());
app.use(express.json());

// MongoDB URI---
const uri = process.env.MONGODB_URI;

// Mongo Client---
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});


async function run() {
    try {
        // Connect MongoDB---
        await client.connect();

        const database = client.db(process.env.DB_NAME);
        const contactCollection = database.collection("contacts");
        const reviewCollection = database.collection("reviews");
        console.log("✅ MongoDB Connected");

        // Home Route---
        app.get("/", (req, res) => {
            res.send({
                success: true,
                message: "Portfolio Backend Running"
            });
        });


        // review---
        app.post("/api/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne({
                ...review,
                createdAt: new Date(),
            });

            res.send({
                success: true,
                insertedId: result.insertedId,
            });
        });

        // Get Reviews---
        app.get("/api/reviews", async (req, res) => {
            try {
                const result = await reviewCollection
                    .find()
                    .sort({ createdAt: -1 }) // Newest first
                    .limit(3)                // Get only the latest 3 reviews
                    .toArray();
                res.send({
                    success: true,
                    data: result,
                });
            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Failed to fetch reviews",
                    error: error.message,
                });
            }
        });

        

        // Save Contact Message---
        // app.post("/api/contact", async (req, res) => {
        //     const contact = req.body;

        //     if (
        //         !contact.name ||
        //         !contact.email ||
        //         !contact.subject ||
        //         !contact.message
        //     ) {
        //         return res.status(400).send({
        //             success: false,
        //             message: "All fields are required",
        //         });
        //     }

        //     contact.createdAt = new Date();

        //     const result = await contactCollection.insertOne(contact);

        //     res.send({
        //         success: true,
        //         message: "Message sent successfully",
        //         insertedId: result.insertedId,
        //     });
        // });

        // Get All Messages
        // app.get("/api/contact", async (req, res) => {
        //     const result = await contactCollection
        //         .find()
        //         .sort({ createdAt: -1 })
        //         .toArray();

        //     res.send(result);
        // });

        // Get Single Message
        // app.get("/api/contact/:id", async (req, res) => {
        //     const id = req.params.id;

        //     const result = await contactCollection.findOne({
        //         _id: new ObjectId(id),
        //     });

        //     res.send(result);
        // });

        // Delete Message
        // app.delete("/api/contact/:id", async (req, res) => {
        //     const id = req.params.id;

        //     const result = await contactCollection.deleteOne({
        //         _id: new ObjectId(id),
        //     });

        //     res.send(result);
        // });

    } catch (error) {
        console.log(error);
    }
}

run();

// Start Server
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
