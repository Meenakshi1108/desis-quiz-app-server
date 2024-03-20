const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors'); // Import the cors middleware
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Use the cors middleware to allow all origins

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("desisdb").command({ ping: 1 });
    console.log("Connected to MongoDB!");

    app.get('/api/data/:category', async (req, res) => {
      try {
        const database = client.db('desisdb');
        const collection = database.collection('default');
        const category = req.params.category;
    
        let projection = {};
        projection[category] = 1;
        projection['_id'] = 0;
    
        const data = await collection.find({}).project(projection).toArray();
    
        console.log('Fetched data from MongoDB:', data);
        if (!data || data.length === 0) {
          return res.status(404).json({ message: 'No data found' });
        }
        res.json(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    

  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});