require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 8000;
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
        // await client.connect();

        const database = client.db(process.env.DB_NAME);
        const contactCollection = database.collection("contacts");
        const reviewCollection = database.collection("reviews");
        console.log("✅ MongoDB Connected");





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
                    .limit(4)                // Get only the latest 4 reviews
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
        app.post(["/api/contact", "/api/messages"], async (req, res) => {
            try {
                const contact = req.body;

                if (
                    !contact.name ||
                    !contact.email ||
                    !contact.subject ||
                    !contact.message
                ) {
                    return res.status(400).send({
                        success: false,
                        message: "All fields are required",
                    });
                }

                const newContact = {
                    name: contact.name.trim(),
                    email: contact.email.trim(),
                    subject: contact.subject.trim(),
                    message: contact.message.trim(),
                    createdAt: new Date(),
                };

                const result = await contactCollection.insertOne(newContact);

                res.send({
                    success: true,
                    message: "Message sent successfully! Thank you for reaching out.",
                    insertedId: result.insertedId,
                });
            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Failed to send message",
                    error: error.message,
                });
            }
        });

        // Get All Messages
        app.get(["/api/contact", "/api/messages"], async (req, res) => {
            try {
                const result = await contactCollection
                    .find()
                    .sort({ createdAt: -1 })
                    .toArray();

                res.send({
                    success: true,
                    data: result,
                });
            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Failed to fetch messages",
                    error: error.message,
                });
            }
        });

        // Get Single Message
        app.get(["/api/contact/:id", "/api/messages/:id"], async (req, res) => {
            try {
                const id = req.params.id;
                const result = await contactCollection.findOne({
                    _id: new ObjectId(id),
                });

                if (!result) {
                    return res.status(404).send({
                        success: false,
                        message: "Message not found",
                    });
                }

                res.send({
                    success: true,
                    data: result,
                });
            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Failed to fetch message",
                    error: error.message,
                });
            }
        });

        // Delete Message
        app.delete(["/api/contact/:id", "/api/messages/:id"], async (req, res) => {
            try {
                const id = req.params.id;
                const result = await contactCollection.deleteOne({
                    _id: new ObjectId(id),
                });

                res.send({
                    success: true,
                    message: "Message deleted successfully",
                    data: result,
                });
            } catch (error) {
                res.status(500).send({
                    success: false,
                    message: "Failed to delete message",
                    error: error.message,
                });
            }
        });

        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Portfolio API is running successfully 🚀",
    });
});


app.listen(port, () => {
    console.log(`Srver is running on port ${port}`)
})

