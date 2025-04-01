import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ChatBotPage = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // For displaying errors
  const [routes, setRoutes] = useState(() => {
    // Retrieve routes from local storage on component mount
    const storedRoutes = JSON.parse(localStorage.getItem('routes')) || [];
    return storedRoutes;
  });

  useEffect(() => {
    // Synchronize routes with local storage whenever they change
    localStorage.setItem('routes', JSON.stringify(routes));
  }, [routes]);

  const handleUserInput = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setError(null);
    setChatHistory((prev) => [...prev, { role: 'user', content: userInput }]);
    setLoading(true);

    try {
      // Pass the user query and routes to the backend
      const response = await axios.post('/chatbot', { query: userInput, routes });
      const botResponse = response.data.reply;

      // Ensure URLs are correctly formatted as <a href="..."> in the bot's reply
      const formattedResponse = formatLinks(botResponse);

      setChatHistory((prev) => [...prev, { role: 'bot', content: formattedResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setError('Échec de la réponse. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };



  // Function to format URLs as clickable <a> tags
  const formatLinks = (text) => {
    const urlRegex = /(\bhttps?:\/\/[^\s]+)\b/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>');
  };

  return (
    <>
      <div className="flex">
        <Link to="/" className="orange_gradient mb-8 text-4xl font-bold">
        StrategicPartner
        </Link>
      </div>
      <div className="chatbot-container p-8">
        <h1>Discutez avec le Bot</h1>
        <div className="chatbox bg-slate-300 rouded-full border">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={message.role === 'user' ? 'user-message' : 'bot-message'}
            >
              {/* Render the bot's response with raw HTML if available */}
              <p
                dangerouslySetInnerHTML={{
                  __html: message.content
                }}
              />
            </div>
          ))}
        </div>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleUserInput} className="chat-input-form">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Comment puis-je vous aider ?"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'En réflexion...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChatBotPage;

