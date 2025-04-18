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

// let dynamicRoutes = [];
// const storedRoutes = [];

// function updateRoutes(newRoutes) {
//   // Merging new routes and removing duplicates based on route URL
//   const uniqueRoutes = [...dynamicRoutes, ...newRoutes].filter(
//     (route, index, self) =>
//       index === self.findIndex((r) => r.route === route.route)
//   );
//   dynamicRoutes = uniqueRoutes;
//   console.log("Updated Dynamic Routes:", dynamicRoutes);
// }

// const handleUserQuery = async (userQuery) => {
//   const lowerCaseQuery = userQuery.toLowerCase();

//   // Check if the query matches any of the predefined routes
//   const matchedRoute = dynamicRoutes.find((route) => {
//     return route.keywords.some((keyword) => {
//       return lowerCaseQuery.includes(keyword.toLowerCase());
//     });
//   });

//   if (matchedRoute) {
//     console.log(`Matched Route Found: ${matchedRoute.route}`);

//     // Scrape the website
//     const scrapedContent = await scrapeWebsite(matchedRoute.route);
//     console.log("Scraped Content:", scrapedContent);

//     if (scrapedContent) {
//       console.log("Scraped Content:", scrapedContent.substring(0, 200)); // Log first 200 chars
//       const response = await getGptResponse(scrapedContent);
//       return response;
//     } else {
//       console.log("Scraping returned empty content.");
//       return "Je n'ai pas pu récupérer les informations de cette page.";
//     }
//   } else {
//     console.log("No matching route found, calling OpenAI.");
//     return await getGptResponsesGenerale();
//   }
// };
// // Cheerio-based scraping function
// // const scrapeWebsite = async (url) => {
// //   try {
// //     console.log("Scraping URL with Cheerio:", url);
    
// //     // Fetch the page with axios
// //     const response = await axios.get(url, {
// //       headers: {
// //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
// //       }
// //     });
    
// //     // Load HTML into Cheerio
// //     const $ = cheerio.load(response.data);
    
// //     // Remove script and style elements
// //     $('script, style, noscript, iframe, head').remove();
    
// //     // Get clean text content
// //     let textContent = $('body').text();
    
// //     // Clean up the text
// //     textContent = textContent
// //       .replace(/\s+/g, ' ') // Replace multiple spaces with single space
// //       .replace(/[\t\n\r]+/g, ' ') // Replace tabs and newlines
// //       .trim();
    
// //     console.log("Cheerio Scraped Data:", textContent ? textContent.substring(0, 200) : "No Data Found");
    
// //     return textContent ? textContent.substring(0, 1000) : null; // Limit text
// //   } catch (error) {
// //     console.error("Error scraping website with Cheerio:", error);
// //     return null;
// //   }
// // };
// // // Debugging inside Scraping Function
// const scrapeWebsite = async (url) => {
//   try {
//     console.log("Scraping URL:", url);
//     const browser = await puppeteer.launch({ 
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--single-process",
//       ],
//       userDataDir: process.env.PUPPETEER_CACHE_DIR,
//       headless: true,
//      });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "domcontentloaded" });

//     // Extract text content
//     const scrapedContent = await page.evaluate(() => {
//       return document.body.innerText || "";
//     });

//     await browser.close();
//     console.log(
//       "Raw Scraped Data:",
//       scrapedContent ? scrapedContent.substring(0, 200) : "No Data Found"
//     );

//     return scrapedContent ? scrapedContent.substring(0, 1000) : null; // Limit text
//   } catch (error) {
//     console.error("Error scraping website:", error);
//     return null;
//   }
// };

// // Function to get GPT response if no route is matched
// const getGptResponsesGenerale = async (userQuery) => {
//   const prompt = constructPrompts(userQuery);

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     max_tokens: 500,
//     messages: [
//       {
//         role: "system",
//         content: "Tu es un assistant intelligent et serviable.",
//       },

//       { role: "user", content: prompt },
//     ],
//   });

//   if (response?.choices?.[0]?.message?.content) {
//     return response.choices[0].message.content.trim();
//   } else {
//     return "Je n'ai pas pu obtenir de réponse.";
//   }
// };

// // Function to get GPT response if route is matched
// const getGptResponse = async (userQuery) => {
//   const prompt = constructPrompt(userQuery, dynamicRoutes);

//   console.log("Constructed Prompt:", prompt);

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     max_tokens: 500,
//     messages: [
//       {
//         role: "system",
//         content: "Tu es un assistant intelligent et serviable.",
//       },

//       { role: "user", content: prompt },
//     ],
//   });

//   if (response?.choices?.[0]?.message?.content) {
//     return response.choices[0].message.content.trim();
//   } else {
//     return "Je n'ai pas pu obtenir de réponse.";
//   }
// };

// function constructPrompt(userQuery, routes) {
//   return `
//     Vous êtes un assistant intelligent capable de répondre à une grande variété de questions.
//     Routes avec sujets :
//     ${routes
//       .map(
//         (route) =>
//           `- URL : ${route.route}, Mots-clés : ${route.keywords.join(", ")}`
//       )
//       .join("\n")}

//     Question de l'utilisateur : "${userQuery}"
//     Répondez de manière naturelle et intelligente et directe.
//   `;
// }

// function constructPrompts(userQuery) {
//   return `
//     Vous êtes un assistant intelligent 

//     Question de l'utilisateur : "${userQuery}"
//     Répondez de manière naturelle et intelligente Lorsque l'utilisateur commence par une salutation comme 'Bonjour'...
//   `;
// }

let dynamicRoutes = [];
const storedRoutes = [];

function updateRoutes(newRoutes) {
  const uniqueRoutes = [...dynamicRoutes, ...newRoutes].filter(
    (route, index, self) =>
      index === self.findIndex((r) => r.route === route.route)
  );
  dynamicRoutes = uniqueRoutes;
  console.log("✅ Updated Dynamic Routes:", dynamicRoutes);
}

const scrapeWebsite = async (url) => {
  try {
    console.log("🌐 Scraping URL:", url);
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
      userDataDir: process.env.PUPPETEER_CACHE_DIR,
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const scrapedContent = await page.evaluate(() => {
      return document.body.innerText || "";
    });

    await browser.close();
    console.log(
      "🧠 Scraped Data:",
      scrapedContent ? scrapedContent.substring(0, 200) : "No Data Found"
    );

    return scrapedContent ? scrapedContent.substring(0, 1000) : null;
  } catch (error) {
    console.error("❌ Error scraping website:", error);
    return null;
  }
};

function constructPrompt(userQuery, routes) {
  return `
    Vous êtes un assistant intelligent capable de répondre à une grande variété de questions.
    Routes avec sujets :
    ${routes
      .map(
        (route) =>
          `- URL : ${route.route}, Mots-clés : ${route.keywords.join(", ")}`
      )
      .join("\n")}

    Question de l'utilisateur : "${userQuery}"
    Répondez de manière naturelle, intelligente et directe.
  `;
}

function constructPrompts(userQuery) {
  return `
    Vous êtes un assistant intelligent.

    Question de l'utilisateur : "${userQuery}"
    Répondez de manière naturelle et intelligente et direct. Lorsque l'utilisateur commence par une salutation comme 'Bonjour'...
  `;
}

const getGptResponse = async (scrapedContent) => {
  const prompt = constructPrompt(scrapedContent, dynamicRoutes);
  console.log("📨 Constructed Prompt:", prompt);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      { role: "system", content: "Tu es un assistant intelligent et serviable." },
      { role: "user", content: prompt },
    ],
  });

  return response?.choices?.[0]?.message?.content.trim() || "Je n'ai pas pu obtenir de réponse.";
};

const getGptResponsesGenerale = async (userQuery) => {
  const prompt = constructPrompts(userQuery);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      { role: "system", content: "Tu es un assistant intelligent et serviable." },
      { role: "user", content: prompt },
    ],
  });

  return response?.choices?.[0]?.message?.content.trim() || "Je n'ai pas pu obtenir de réponse.";
};

const handleUserQuery = async (userQuery) => {
  const lowerCaseQuery = userQuery.toLowerCase();

  const matchedRoute = dynamicRoutes.find((route) => {
    return route.keywords.some((keyword) =>
      lowerCaseQuery.includes(keyword.toLowerCase())
    );
  });

  if (matchedRoute) {
    console.log(`✅ Matched Route Found: ${matchedRoute.route}`);

    const scrapedContent = await scrapeWebsite(matchedRoute.route);
    if (scrapedContent) {
      return await getGptResponse(scrapedContent);
    } else {
      return "Je n'ai pas pu récupérer les informations de cette page.";
    }
  } else {
    console.log("🔍 No matching route found, using GPT directly.");
    return await getGptResponsesGenerale(userQuery);
  }
};

class ScanController {
  // // Scan a website for links
  // static async scan(req, res) {
  //   const { url } = req.body;

  //   if (!url) {
  //     return res.status(400).json({ error: "URL is required" });
  //   }

  //   try {
  //     console.log("Starting website scan for URL:", url);
  //     const response = await axios.get(url);
  //     const $ = cheerio.load(response.data);

  //     const links = [];
  //     $("a").each((_, element) => {
  //       let link = $(element).attr("href");
  //       if (link) {
  //         if (!link.startsWith("http")) {
  //           const baseUrl = new URL(url);
  //           link = new URL(link, baseUrl.origin).href;
  //         }
  //         if (!links.includes(link)) {
  //           links.push(link);
  //         }
  //       }
  //     });

  //     // Update the dynamic routes
  //     const formattedRoutes = links.map((link) => ({
  //       route: link,
  //       keywords: link
  //         .split("/")
  //         .filter(Boolean)
  //         .map((part) => part.toLowerCase()),
  //     }));

  //     // Only update the routes if they are not already included
  //     updateRoutes(formattedRoutes);
  //     storedRoutes.push(...links); // Store the raw links for reference
  //     console.log("Website scan complete. Found routes:", links);
  //     res.json({ routes: links });
  //   } catch (error) {
  //     console.error("Error scanning website:", error.message);
  //     res.status(500).json({ error: "Failed to scan the website" });
  //   }
  // }

  // // Retrieve stored routes
  // static async getStoredRoutes(req, res) {
  //   res.json({ routes: storedRoutes });
  // }

  // // Handle chatbot queries
  // static async chatbot(req, res) {
  //   const { query } = req.body;
  //   console.log("Received chatbot query:", query);

  //   if (!query) {
  //     return res.status(400).json({ error: "Query is required" });
  //   }

  //   try {
  //     const aiResponse = await handleUserQuery(query);
  //     console.log("AI response sent back to user:", aiResponse);
  //     res.status(200).json({ reply: aiResponse });
  //   } catch (error) {
  //     console.error("Error in chatbot controller:", error.message);
  //     res.status(500).json({ error: "Failed to process your request." });
  //   }
  // }
  // // static async storeRoutes(req, res) {
  // //   const { routes } = req.body;

  // //   if (!routes || !Array.isArray(routes)) {
  // //     return res.status(400).json({ error: "Routes must be an array." });
  // //   }

  // //   try {
  // //     // Format the new routes
  // //     const formattedRoutes = routes.map((route) => ({
  // //       route,
  // //       keywords: route
  // //         .split("/")
  // //         .filter(Boolean)
  // //         .map((part) => part.toLowerCase()),
  // //     }));

  // //     // Get existing route URLs for comparison
  // //     const existingRouteUrls = dynamicRoutes.map((r) => r.route);

  // //     // Filter out routes that already exist
  // //     const newRoutes = formattedRoutes.filter(
  // //       (routeObj) => !existingRouteUrls.includes(routeObj.route)
  // //     );

  // //     if (newRoutes.length > 0) {
  // //       // Update both dynamicRoutes and storedRoutes
  // //       updateRoutes(newRoutes);
  // //       storedRoutes.push(...newRoutes.map((r) => r.route));
  // //       console.log("New routes stored:", newRoutes);
  // //     } else {
  // //       console.log("No new routes to store");
  // //     }

  // //     res.status(200).json({
  // //       message: "Routes processed successfully",
  // //       newRoutes: newRoutes.length,
  // //       totalRoutes: dynamicRoutes.length,
  // //     });
  // //   } catch (error) {
  // //     console.error("Error storing routes:", error.message);
  // //     res.status(500).json({ error: "Failed to store the routes." });
  // //   }
  // // }
  static async storeRoutes(req, res) {
    const { routes } = req.body;
  
    if (!routes || !Array.isArray(routes)) {
      return res.status(400).json({ error: "Routes must be an array." });
    }
  
    try {
      // COMPLETELY REPLACE existing routes instead of merging
      dynamicRoutes = routes.map((route) => ({
        route,
        keywords: route
          .split("/")
          .filter(Boolean)
          .map((part) => part.toLowerCase()),
      }));
  
      // Also replace storedRoutes
      storedRoutes.length = 0;
      storedRoutes.push(...routes);
  
      console.log("All routes replaced with new set:", dynamicRoutes);
      res.status(200).json({
        message: "Routes replaced successfully",
        totalRoutes: dynamicRoutes.length,
      });
    } catch (error) {
      console.error("Error storing routes:", error.message);
      res.status(500).json({ error: "Failed to store the routes." });
    }
  }
  static async resetRoutes(req, res) {
    try {
      dynamicRoutes = [];
      storedRoutes.length = 0;
      console.log("All routes cleared");
      res.status(200).json({ message: "All routes cleared successfully" });
    } catch (error) {
      console.error("Error resetting routes:", error.message);
      res.status(500).json({ error: "Failed to reset routes." });
    }
  }
  static async scan(req, res) {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      console.log("🔎 Scanning website:", url);
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

      const formattedRoutes = links.map((link) => ({
        route: link,
        keywords: link
          .split("/")
          .filter(Boolean)
          .map((part) => part.toLowerCase()),
      }));

      updateRoutes(formattedRoutes);
      storedRoutes.push(...links);

      console.log("✅ Website scan complete.");
      res.json({ routes: links });
    } catch (error) {
      console.error("❌ Error scanning website:", error.message);
      res.status(500).json({ error: "Failed to scan the website" });
    }
  }

  static async getStoredRoutes(req, res) {
    res.json({ routes: storedRoutes });
  }

  static async chatbot(req, res) {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    try {
      const aiResponse = await handleUserQuery(query);
      res.status(200).json({ reply: aiResponse });
    } catch (error) {
      console.error("❌ Error in chatbot controller:", error.message);
      res.status(500).json({ error: "Failed to process your request." });
    }
  }
}

module.exports = ScanController;
