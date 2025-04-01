// const axios = require("axios");
// const cheerio = require("cheerio");
// const { OpenAI } = require("openai");
// const dotenv = require("dotenv");

// // Environment variable configuration
// dotenv.config();

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// let dynamicRoutes = [];
// const storedRoutes = [];

// function updateRoutes(newRoutes) {
//     // Merging new routes and removing duplicates based on route URL
//     const uniqueRoutes = [...dynamicRoutes, ...newRoutes].filter(
//       (route, index, self) =>
//         index === self.findIndex((r) => r.route === route.route)
//     );
//     dynamicRoutes = uniqueRoutes;
//     console.log("Updated Dynamic Routes:", dynamicRoutes);
//   }


// const handleUserQuery = async (userQuery) => {
//   const lowerCaseQuery = userQuery.toLowerCase();

//   // Check if the query matches any of the predefined routes
//   const matchedRoute = dynamicRoutes.find((route) => {
//     return route.keywords.some((keyword) => {
//       return lowerCaseQuery.includes(keyword.toLowerCase());
//     });
//   });

//   if (matchedRoute) {
//     // If a route is found, include it in the GPT prompt
//     return await getGptResponse(userQuery, matchedRoute);
//   } else {
//     // If no route is found, fallback to GPT for the response
//     return await getGptResponse(userQuery);
//   }
// };

// // Constructing prompt for GPT with route included (if any)
// const getGptResponse = async (userQuery, matchedRoute = null) => {
//   // Construct prompt with or without the matched route
//   const prompt = matchedRoute 
//     ? constructPrompt(userQuery, dynamicRoutes, matchedRoute) 
//     : constructPrompt(userQuery, dynamicRoutes);

//   console.log("Constructed Prompt:", prompt);

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     messages: [
//       { role: "system", content: "You are an intelligent assistant." },
//       { role: "user", content: prompt },
//     ],
//   });

//   // Log the GPT response for debugging
//   if (response?.choices?.[0]?.message?.content) {
//     console.log("OpenAI Response:", response);
//     return response.choices[0].message.content.trim();
//   } else {
//     console.error("OpenAI response error: No content returned.");
//     return "I encountered an error while fetching the response.";
//   }
// };

// // Construct the GPT prompt with matched route information
// function constructPrompt(userQuery, routes, matchedRoute = null) {
//   let routeInfo = matchedRoute
//     ? `You can find more about this topic here: ${matchedRoute.route}`
//     : '';

//   return `
//     You are an intelligent assistant capable of answering a wide variety of questions. You also have access to a list of specific URLs related to certain topics. Use the following information to respond:

//     Routes with Topics:
//     ${routes
//       .map((route) => `- URL: ${route.route}, Keywords: ${route.keywords.join(", ")}`)
//       .join("\n")}
    
//     User Query: "${userQuery}"

//     Additional Info (if any): ${routeInfo}
    
//     Instructions:
//     1. If the query closely matches one of the topics in the routes, include the route link in your response.
//     2. For unrelated questions, respond as you normally would using your general knowledge.

//     Respond naturally and intelligently.
//   `;
// }
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");

// Environment variable configuration
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let dynamicRoutes = [];
const storedRoutes = [];

function updateRoutes(newRoutes) {
    // Merging new routes and removing duplicates based on route URL
    const uniqueRoutes = [...dynamicRoutes, ...newRoutes].filter(
      (route, index, self) =>
        index === self.findIndex((r) => r.route === route.route)
    );
    dynamicRoutes = uniqueRoutes;
    console.log("Updated Dynamic Routes:", dynamicRoutes);
  }



const handleUserQuery = async (userQuery) => {
  const lowerCaseQuery = userQuery.toLowerCase();

  // Check if the query matches any of the predefined routes
  const matchedRoute = dynamicRoutes.find((route) => {
    return route.keywords.some((keyword) => {
      return lowerCaseQuery.includes(keyword.toLowerCase());
    });
  });

  if (matchedRoute) {
    console.log(`Matched Route Found: ${matchedRoute.route}`);

    // Scrape the website
    const scrapedContent = await scrapeWebsite(matchedRoute.route);
    
    if (scrapedContent) {
      console.log("Scraped Content:", scrapedContent.substring(0, 200)); // Log first 200 chars
      const translatedText = await translateToFrench(scrapedContent);
      console.log("Translated Response:", translatedText);
      return translatedText;
    } else {
      console.log("Scraping returned empty content.");
      return "Je n'ai pas pu récupérer les informations de cette page.";
    }
  } else {
    console.log("No matching route found, calling OpenAI.");
    return await getGptResponse(userQuery);
  }
};

// Debugging inside Scraping Function
const scrapeWebsite = async (url) => {
  try {
    console.log("Scraping URL:", url);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extract text content
    const scrapedContent = await page.evaluate(() => {
      return document.body.innerText || "";
    });

    await browser.close();
    console.log("Raw Scraped Data:", scrapedContent ? scrapedContent.substring(0, 200) : "No Data Found");
    
    return scrapedContent ? scrapedContent.substring(0, 1000) : null; // Limit text
  } catch (error) {
    console.error("Error scraping website:", error);
    return null;
  }
};


// Function to translate text to French using OpenAI
const translateToFrench = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      // max_tokens: 50,
      messages: [
        { role: "system", content: "You are a translator who translates text into French." },
        { role: "user", content: `Translate this to French:\n${text}` },
      ],
    });

    return response?.choices?.[0]?.message?.content.trim() || "Erreur lors de la traduction.";
  } catch (error) {
    console.error("Error translating text:", error);
    return "Erreur lors de la traduction.";
  }
};

// Function to get GPT response if no route is matched
const getGptResponse = async (userQuery) => {
  const prompt = constructPrompt(userQuery, dynamicRoutes);

  console.log("Constructed Prompt:", prompt);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    // max_tokens: 50,
    messages: [
      { role: "system", content: "You are an intelligent assistant." },
      { role: "user", content: prompt },
    ],
  });

  if (response?.choices?.[0]?.message?.content) {
    return response.choices[0].message.content.trim();
  } else {
    return "Je n'ai pas pu obtenir de réponse.";
  }
};

// Function to construct the GPT prompt
function constructPrompt(userQuery, routes) {
  return `
    You are an intelligent assistant capable of answering a wide variety of questions.
    Routes with Topics:
    ${routes.map((route) => `- URL: ${route.route}, Keywords: ${route.keywords.join(", ")}`).join("\n")}

    User Query: "${userQuery}"
    Respond naturally and intelligently.
  `;
}



  

class ScanController {
  // Scan a website for links
  static async scan(req, res) {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      console.log("Starting website scan for URL:", url);
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const links = [];
      $("a").each((_, element) => {
        let link = $(element).attr("href");
        if (link) {
          if (!link.startsWith("http")) {
            const baseUrl = new URL(url);
            link = new URL(link, baseUrl.origin).href;
          }
          if (!links.includes(link)) {
            links.push(link);
          }
        }
      });

      // Update the dynamic routes
      const formattedRoutes = links.map((link) => ({
        route: link,
        keywords: link.split("/").filter(Boolean).map((part) => part.toLowerCase()),
      }));
      
      // Only update the routes if they are not already included
      updateRoutes(formattedRoutes);
      storedRoutes.push(...links); // Store the raw links for reference
      console.log("Website scan complete. Found routes:", links);
      res.json({ routes: links });
    } catch (error) {
      console.error("Error scanning website:", error.message);
      res.status(500).json({ error: "Failed to scan the website" });
    }
  }

  // Retrieve stored routes
  static async getStoredRoutes(req, res) {
    res.json({ routes: storedRoutes });
  }

  // Handle chatbot queries
  static async chatbot(req, res) {
    const { query } = req.body;
    console.log("Received chatbot query:", query);

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    try {
      const aiResponse = await handleUserQuery(query);
      console.log("AI response sent back to user:", aiResponse);
      res.status(200).json({ reply: aiResponse });
    } catch (error) {
      console.error("Error in chatbot controller:", error.message);
      res.status(500).json({ error: "Failed to process your request." });
    }
  }

  static async storeRoutes(req, res) {
    const { routes } = req.body;

    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({ error: "Routes must be an array." });
    }

    try {
      const formattedRoutes = routes.map((route) => ({
        route,
        keywords: route.split("/").filter(Boolean).map((part) => part.toLowerCase()),
      }));

      // Avoid duplicate routes
      const newRoutes = formattedRoutes.filter(
        (newRoute) => !storedRoutes.includes(newRoute.route)
      );

      if (newRoutes.length > 0) {
        updateRoutes(newRoutes); // Update dynamic routes
        storedRoutes.push(...newRoutes.map((route) => route.route)); // Add new routes
      }

      console.log("New routes stored:", newRoutes);
      res.status(200).json({ message: "Routes stored successfully.", routes: newRoutes });
    } catch (error) {
      console.error("Error storing routes:", error.message);
      res.status(500).json({ error: "Failed to store the routes." });
    }
  }
}

module.exports = ScanController;


