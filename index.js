import path from 'path';
import url from 'url';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { GoogleGenerativeAI } from '@google/generative-ai';


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;

app.use(express.static(path.join(__dirname, 'Public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'ejs');

const genAI = new GoogleGenerativeAI(apiKey);

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/submit', async (req, res) => {
   const number_of_people = req.body["people"];
  const number_of_days = req.body["days"];
  const average_budget = req.body["budget"];
  const travel_dates = {
    "start": req.body["start-date"],
    "end": req.body["end-date"]
  };
  const starting_location = req.body["location"];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create a ${number_of_days}-day itinerary for a trip to ${starting_location} for ${number_of_people} people with an average budget of ₹${average_budget} per person. The trip starts on ${travel_dates['start']}. The itinerary should include major attractions, activities, and recommendations for accommodations and meals.`;
    
    const result = await model.generateContent([prompt]);
    const text = result.response.text(); 

    const htmlContent = marked(text);

    console.log("Itinerary:", text);  

    res.render("roughitinerary.ejs", { htmlContent: htmlContent });
  } catch (error) {
    console.error("Error generating content:", error);
    res.render("roughitinerary.ejs", { htmlContent: "There was an error generating the itinerary. Please try again later." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
