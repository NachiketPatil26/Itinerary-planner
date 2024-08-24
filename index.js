import path from "path"; 
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = 3000;
const apiKey = process.env.API_KEY;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "views")); 

const genAI = new GoogleGenerativeAI(apiKey);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", async (req, res) => {
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
    const prompt = `Create a ${number_of_days}-day itinerary for a trip to Uttarakhand for ${number_of_people} people with an average budget of ₹${average_budget} per person. The trip starts on ${travel_dates['start']} from ${starting_location}. The itinerary should include major attractions, activities, and recommendations for accommodations and meals.`;
    
    const result = await model.generateContent([prompt]);
    const text = result.response.text(); 

    console.log("Itinerary:", text);  

    res.render("roughitinerary.ejs", { text: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.render("roughitinerary.ejs", { text: "There was an error generating the itinerary. Please try again later." });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
