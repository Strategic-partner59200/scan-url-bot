// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';

// const ChatBotPage = () => {
//   const [userInput, setUserInput] = useState('');
//   const [chatHistory, setChatHistory] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null); // For displaying errors
//   const [routes, setRoutes] = useState(() => {
//     // Retrieve routes from local storage on component mount
//     const storedRoutes = JSON.parse(localStorage.getItem('routes')) || [];
//     return storedRoutes;
//   });

//   useEffect(() => {
//     // Synchronize routes with local storage whenever they change
//     localStorage.setItem('routes', JSON.stringify(routes));
//   }, [routes]);

//   const handleUserInput = async (e) => {
//     e.preventDefault();
//     if (!userInput.trim()) return;

//     setError(null);
//     setChatHistory((prev) => [...prev, { role: 'user', content: userInput }]);
//     setLoading(true);

//     try {
//       // Pass the user query and routes to the backend
//       const response = await axios.post('/chatbot', { query: userInput, routes });
//       const botResponse = response.data.reply;

//       // Ensure URLs are correctly formatted as <a href="..."> in the bot's reply
//       const formattedResponse = formatLinks(botResponse);

//       setChatHistory((prev) => [...prev, { role: 'bot', content: formattedResponse }]);
//     } catch (error) {
//       console.error('Error:', error);
//       setError('Échec de la réponse. Veuillez réessayer plus tard.');
//     } finally {
//       setLoading(false);
//       setUserInput('');
//     }
//   };



//   // Function to format URLs as clickable <a> tags
//   const formatLinks = (text) => {
//     const urlRegex = /(\bhttps?:\/\/[^\s]+)\b/g;
//     return text.replace(urlRegex, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>');
//   };

//   return (
//     <>
//       <div className="flex">
//         <Link to="/" className="orange_gradient mb-8 text-4xl font-bold">
//         StrategicPartner
//         </Link>
//       </div>
//       <div className="chatbot-container p-8">
//         <h1>Discutez avec le Bot</h1>
//         <div className="chatbox bg-slate-300 rouded-full border">
//           {chatHistory.map((message, index) => (
//             <div
//               key={index}
//               className={message.role === 'user' ? 'user-message' : 'bot-message'}
//             >
//               {/* Render the bot's response with raw HTML if available */}
//               <p
//                 dangerouslySetInnerHTML={{
//                   __html: message.content
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//         {error && <p className="error-message">{error}</p>}
//         <form onSubmit={handleUserInput} className="chat-input-form">
//           <input
//             type="text"
//             value={userInput}
//             onChange={(e) => setUserInput(e.target.value)}
//             placeholder="Comment puis-je vous aider ?"
//             disabled={loading}
//           />
//           <button type="submit" disabled={loading}>
//             {loading ? 'En réflexion...' : 'Envoyer'}
//           </button>
//         </form>
//       </div>
//     </>
//   );
// };

// export default ChatBotPage;

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatBotPage = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState(() => {
    const storedRoutes = JSON.parse(localStorage.getItem('routes')) || [];
    return storedRoutes;
  });
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Synchronize routes with local storage
  useEffect(() => {
    localStorage.setItem('routes', JSON.stringify(routes));
  }, [routes]);

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setError(null);
    setChatHistory((prev) => [...prev, { role: 'user', content: userInput }]);
    setLoading(true);

    try {
      const response = await axios.post('/chatbot', { 
        query: userInput, 
        routes 
      });
      
      const botResponse = formatResponse(response.data.reply);
      setChatHistory((prev) => [...prev, { role: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setError('Échec de la réponse. Veuillez réessayer plus tard.');
      setChatHistory((prev) => [...prev, { 
        role: 'bot', 
        content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer." 
      }]);
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  const formatResponse = (text) => {
    // Convert Markdown to HTML
    let formattedText = text;
  
    // Headings
    formattedText = formattedText.replace(/^##\s+(.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
    formattedText = formattedText.replace(/^###\s+(.*$)/gm, '<h4 class="text-lg font-medium mt-4 mb-2">$1</h4>');
  
    // Bold text
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
  
    // Lists
    formattedText = formattedText.replace(/^\s*-\s(.*$)/gm, '<li class="list-disc ml-5 mb-1">$1</li>');
    formattedText = formattedText.replace(/^\s*\*\s(.*$)/gm, '<li class="list-disc ml-5 mb-1">$1</li>');
  
    // Paragraphs
    formattedText = formattedText.replace(/^(?!<[a-z]|<\/[a-z])(.*$)/gm, '<p class="mb-3 leading-relaxed">$1</p>');
  
    // Links
    const urlRegex = /(\bhttps?:\/\/[^\s]+)\b/g;
    formattedText = formattedText.replace(
      urlRegex, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline transition-colors">$1</a>'
    );
  
    // Code blocks
    formattedText = formattedText.replace(
      /```([\s\S]*?)```/g, 
      '<pre class="bg-gray-100 p-3 rounded-md overflow-x-auto my-2"><code>$1</code></pre>'
    );
  
    return formattedText;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <Link 
            to="/" 
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent hover:from-orange-500 hover:to-orange-700 transition-all"
          >
            StrategicPartner
          </Link>
          <div className="text-sm text-gray-500">
            AI Assistant
          </div>
        </header>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Chat Messages */}
          <div 
            className="chat-messages p-4 h-96 overflow-y-auto bg-gray-50"
            style={{ scrollBehavior: 'smooth' }}
          >
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
                <p className="text-lg">Comment puis-je vous aider aujourd'hui ?</p>
                <p className="text-sm mt-2">Posez-moi une question ou décrivez votre besoin</p>
              </div>
            ) : (
              chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-br-none' 
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                  >
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{
                        __html: message.content
                      }}
                    />
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            {error && (
              <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUserInput} className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tapez votre message ici..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading || !userInput.trim()}
                className={`px-6 py-2 rounded-full font-medium ${loading || !userInput.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 transition-colors'}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi...
                  </span>
                ) : (
                  'Envoyer'
                )}
              </button>
            </form>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
  Powered by Strategic Partner.
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;