// const axios = require("axios");
// const cheerio = require("cheerio");
// const puppeteer = require("puppeteer");
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
//     console.log(`Matched Route Found: ${matchedRoute.route}`);

//     // Scrape the website
//     const scrapedContent = await scrapeWebsite(matchedRoute.route);
    
//     if (scrapedContent) {
//       console.log("Scraped Content:", scrapedContent.substring(0, 200)); // Log first 200 chars
//       const translatedText = await translateToFrench(scrapedContent);
//       console.log("Translated Response:", translatedText);
//       return translatedText;
//     } else {
//       console.log("Scraping returned empty content.");
//       return "Je n'ai pas pu récupérer les informations de cette page.";
//     }
//   } else {
//     console.log("No matching route found, calling OpenAI.");
//     return await getGptResponse(userQuery);
//   }
// };

// // Debugging inside Scraping Function
// const scrapeWebsite = async (url) => {
//   try {
//     console.log("Scraping URL:", url);
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "domcontentloaded" });

//     // Extract text content
//     const scrapedContent = await page.evaluate(() => {
//       return document.body.innerText || "";
//     });

//     await browser.close();
//     console.log("Raw Scraped Data:", scrapedContent ? scrapedContent.substring(0, 200) : "No Data Found");
    
//     return scrapedContent ? scrapedContent.substring(0, 1000) : null; // Limit text
//   } catch (error) {
//     console.error("Error scraping website:", error);
//     return null;
//   }
// };


// // Function to translate text to French using OpenAI
// const translateToFrench = async (text) => {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       max_tokens: 50,
//       messages: [
//         { role: "system", content: "You are a translator who translates text into French." },
//         { role: "user", content: `Translate this to French:\n${text}` },
//       ],
//     });

//     return response?.choices?.[0]?.message?.content.trim() || "Erreur lors de la traduction.";
//   } catch (error) {
//     console.error("Error translating text:", error);
//     return "Erreur lors de la traduction.";
//   }
// };

// // Function to get GPT response if no route is matched
// const getGptResponse = async (userQuery) => {
//   const prompt = constructPrompt(userQuery, dynamicRoutes);

//   console.log("Constructed Prompt:", prompt);

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     max_tokens: 50,
//     messages: [
//       { role: "system", content: "You are an intelligent assistant." },
//       { role: "user", content: prompt },
//     ],
//   });

//   if (response?.choices?.[0]?.message?.content) {
//     return response.choices[0].message.content.trim();
//   } else {
//     return "Je n'ai pas pu obtenir de réponse.";
//   }
// };

// // Function to construct the GPT prompt
// function constructPrompt(userQuery, routes) {
//   return `
//     You are an intelligent assistant capable of answering a wide variety of questions.
//     Routes with Topics:
//     ${routes.map((route) => `- URL: ${route.route}, Keywords: ${route.keywords.join(", ")}`).join("\n")}

//     User Query: "${userQuery}"
//     Respond naturally and intelligently.
//   `;
// }



  

// class ScanController {
//   // Scan a website for links
//   static async scan(req, res) {
//     const { url } = req.body;

//     if (!url) {
//       return res.status(400).json({ error: "URL is required" });
//     }

//     try {
//       console.log("Starting website scan for URL:", url);
//       const response = await axios.get(url);
//       const $ = cheerio.load(response.data);

//       const links = [];
//       $("a").each((_, element) => {
//         let link = $(element).attr("href");
//         if (link) {
//           if (!link.startsWith("http")) {
//             const baseUrl = new URL(url);
//             link = new URL(link, baseUrl.origin).href;
//           }
//           if (!links.includes(link)) {
//             links.push(link);
//           }
//         }
//       });

//       // Update the dynamic routes
//       const formattedRoutes = links.map((link) => ({
//         route: link,
//         keywords: link.split("/").filter(Boolean).map((part) => part.toLowerCase()),
//       }));
      
//       // Only update the routes if they are not already included
//       updateRoutes(formattedRoutes);
//       storedRoutes.push(...links); // Store the raw links for reference
//       console.log("Website scan complete. Found routes:", links);
//       res.json({ routes: links });
//     } catch (error) {
//       console.error("Error scanning website:", error.message);
//       res.status(500).json({ error: "Failed to scan the website" });
//     }
//   }

//   // Retrieve stored routes
//   static async getStoredRoutes(req, res) {
//     res.json({ routes: storedRoutes });
//   }

//   // Handle chatbot queries
//   static async chatbot(req, res) {
//     const { query } = req.body;
//     console.log("Received chatbot query:", query);

//     if (!query) {
//       return res.status(400).json({ error: "Query is required" });
//     }

//     try {
//       const aiResponse = await handleUserQuery(query);
//       console.log("AI response sent back to user:", aiResponse);
//       res.status(200).json({ reply: aiResponse });
//     } catch (error) {
//       console.error("Error in chatbot controller:", error.message);
//       res.status(500).json({ error: "Failed to process your request." });
//     }
//   }

//   static async storeRoutes(req, res) {
//     const { routes } = req.body;

//     if (!routes || !Array.isArray(routes)) {
//       return res.status(400).json({ error: "Routes must be an array." });
//     }

//     try {
//       const formattedRoutes = routes.map((route) => ({
//         route,
//         keywords: route.split("/").filter(Boolean).map((part) => part.toLowerCase()),
//       }));

//       // Avoid duplicate routes
//       const newRoutes = formattedRoutes.filter(
//         (newRoute) => !storedRoutes.includes(newRoute.route)
//       );

//       if (newRoutes.length > 0) {
//         updateRoutes(newRoutes); // Update dynamic routes
//         storedRoutes.push(...newRoutes.map((route) => route.route)); // Add new routes
//       }

//       console.log("New routes stored:", newRoutes);
//       res.status(200).json({ message: "Routes stored successfully.", routes: newRoutes });
//     } catch (error) {
//       console.error("Error storing routes:", error.message);
//       res.status(500).json({ error: "Failed to store the routes." });
//     }
//   }
// }

// module.exports = ScanController;



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

class RouteManager {
  constructor() {
    this.dynamicRoutes = [];
    this.storedRoutes = [];
  }

  updateRoutes(newRoutes) {
    const newUniqueRoutes = newRoutes.filter(
      (route) =>
        !this.dynamicRoutes.some((existing) => existing.route === route.route)
    );
  
    this.dynamicRoutes = [...this.dynamicRoutes, ...newUniqueRoutes];
  
    console.log("Updated Dynamic Routes:", this.dynamicRoutes);
    console.log("New routes stored:", newUniqueRoutes); // <-- ajoute cette ligne
  }

  async scrapeWebsite(url) {
    try {
      console.log("Scraping URL:", url);
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.goto(url, { 
        waitUntil: "domcontentloaded",
        timeout: 30000
      });

      // Extract both text and metadata
      const scrapedData = await page.evaluate(() => {
        const title = document.title || "";
        const metaDescription = document.querySelector('meta[name="description"]')?.content || "";
        const bodyText = document.body.innerText || "";
        
        return {
          title,
          metaDescription,
          bodyText
        };
      });

      await browser.close();
      
      console.log("Scraped Data:", {
        title: scrapedData.title,
        metaDescription: scrapedData.metaDescription,
        bodyText: scrapedData.bodyText.substring(0, 200) + "..."
      });
      
      return scrapedData;
    } catch (error) {
      console.error("Error scraping website:", error);
      return null;
    }
  }

  async generateStructuredResponse(query, scrapedData) {
    try {
      const prompt = `
        You are a professional content organizer for a solar energy company.
        The user asked: "${query}"
        
        Website Title: ${scrapedData.title}
        Meta Description: ${scrapedData.metaDescription}
        Page Content: ${scrapedData.bodyText.substring(0, 3000)}
        
        Please provide a well-structured response in French with:
        1. Clear headings (##) for main sections
        2. Bullet points (-) for key information
        3. Bold (**) for important terms
        4. Concise paragraphs
        5. Professional but friendly tone
        6. Only use information from the provided content
        7. Markdown formatting
        
        If the content doesn't answer the question, respond:
        "Je n'ai pas trouvé d'information précise à ce sujet dans nos ressources. Pour plus de détails, vous pouvez nous contacter directement."
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You organize information into professional, structured responses in French." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error generating structured response:", error);
      return "Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.";
    }
  }

  async handleGeneralQuery(query) {
    try {
      const prompt = `
        Vous êtes un assistant expert pour une entreprise d'énergie solaire.
        L'utilisateur demande: "${query}"
        
        Répondez en français de manière:
        - Professionnelle et structurée
        - Avec des paragraphes clairs
        - En utilisant des listes à puces si pertinent
        - En étant honnête si vous ne savez pas
        
        Si la question concerne nos services mais qu'aucune information n'est disponible, dites:
        "Nos services comprennent des solutions solaires photovoltaïques. Pour plus de détails spécifiques, je vous invite à nous contacter directement."
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a professional business assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 100
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error handling general query:", error);
      return "Je n'ai pas pu obtenir de réponse pour le moment. Veuillez réessayer plus tard.";
    }
  }

  findMatchingRoute(query) {
    const lowerCaseQuery = query.toLowerCase();
    return this.dynamicRoutes.find(route => 
      route.keywords.some(keyword => 
        lowerCaseQuery.includes(keyword.toLowerCase())
      )
    );
  }
}

// Initialize route manager instance
const routeManager = new RouteManager();

class ScanController {
  // Scan a website for links
  static async scan(req, res) {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      console.log("Starting website scan for URL:", url);
      
      // Clear previous routes
      routeManager.dynamicRoutes = [];
      routeManager.storedRoutes = [];
      
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
        keywords: ScanController.extractKeywordsFromUrl(link) // ✅ Use class name
      }));
      
      routeManager.updateRoutes(formattedRoutes);
      routeManager.storedRoutes.push(...links);
      
      console.log("Website scan complete. Found routes:", links);
      res.json({ routes: links });
    } catch (error) {
      console.error("Error scanning website:", error.message);
      res.status(500).json({ error: "Failed to scan the website" });
    }
  }

  static extractKeywordsFromUrl(url) {
    try {
      const parsedUrl = new URL(url);
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
      const hostParts = parsedUrl.hostname.split('.').filter(part => part.length > 3);
      
      return [...pathParts, ...hostParts]
        .map(part => part.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim())
        .filter(part => part.length > 2);
    } catch (e) {
      return [];
    }
  }

  // Retrieve stored routes
  static async getStoredRoutes(req, res) {
    res.json({ routes: routeManager.storedRoutes });
  }

  // Handle chatbot queries
  static async chatbot(req, res) {
    const { query, routes: customRoutes } = req.body;
    console.log("Received chatbot query:", query);

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    try {
      // Use custom routes if provided, otherwise use stored routes
      const routesToUse = customRoutes || routeManager.dynamicRoutes;
      
      // Find matching route
      const matchedRoute = routeManager.findMatchingRoute(query);
      
      let aiResponse;
      if (matchedRoute) {
        console.log(`Matched Route Found: ${matchedRoute.route}`);
        const scrapedData = await routeManager.scrapeWebsite(matchedRoute.route);
        
        if (scrapedData) {
          aiResponse = await routeManager.generateStructuredResponse(query, scrapedData);
        } else {
          aiResponse = "Je n'ai pas pu récupérer les informations de cette page.";
        }
      } else {
        console.log("No matching route found, generating general response.");
        aiResponse = await routeManager.handleGeneralQuery(query);
      }

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
        keywords: ScanController.extractKeywordsFromUrl(route) 
      }));

      // Filter out duplicates
      const newRoutes = formattedRoutes.filter(
        (newRoute) => !routeManager.storedRoutes.includes(newRoute.route)
      );

      if (newRoutes.length > 0) {
        routeManager.updateRoutes(newRoutes);
        routeManager.storedRoutes.push(...newRoutes.map((route) => route.route));
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
