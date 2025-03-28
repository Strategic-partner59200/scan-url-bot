const { OpenAI } = require("openai");
const dotenv = require("dotenv");

// Environment variable configuration
dotenv.config();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure the key is correct
});

async function testOpenAI() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an intelligent assistant." },
        { role: "user", content: "Hello, how are you?" },
      ],
    });
    console.log("Test OpenAI Response:", response);
  } catch (error) {
    console.error("Error with OpenAI API:", error.message);
  }
}

testOpenAI();
