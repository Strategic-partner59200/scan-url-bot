







import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import axios from 'axios';
import { Button } from 'antd';
import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';

const Demo = () => {
  const [url, setUrl] = useState('');
  const [routes, setRoutes] = useState(() => {
    const storedRoutes = localStorage.getItem('routes');
    return storedRoutes ? JSON.parse(storedRoutes) : [];
  });
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [botCreationLoading, setBotCreationLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  useEffect(() => {
    localStorage.setItem('routes', JSON.stringify(routes));
  }, [routes]);

  const handleScan = async () => {
    setLoading(true);
    setRoutes([]);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const response = await axios.post('/scan', { url });
      setRoutes(response.data.routes);
    } catch (error) {
      console.error('Error scanning the website:', error);
      alert('Échec de l analyse du site web. Veuillez vérifier URL et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = (routeToDelete) => {
    setRoutes((prevRoutes) => {
      const updatedRoutes = prevRoutes.filter((route) => route !== routeToDelete);
      localStorage.setItem('routes', JSON.stringify(updatedRoutes));
      return updatedRoutes;
    });
  };

  const handleBotCreation = async () => {
    setBotCreationLoading(true);

    try {
      await axios.post('/storeroutes', { routes });
      alert('Bot créé avec succès !');
      navigate('/chat-bot'); // Redirect to the /chat-bot page after bot creation
    } catch (error) {
      console.error('Error creating the bot:', error);
      alert('Échec de la création du bot. Veuillez réessayer.');
    } finally {
      setBotCreationLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 shadow-lg rounded-lg text-gray-800 min-h-screen mt-12">
      <h1 className="text-center text-2xl font-bold mb-6">
        Scanner d'URL du site Web
      </h1>

      <div className="flex flex-col sm:flex-row justify-center mb-6 relative gap-4">
        <div className="relative flex-grow">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
            <LinkOutlined />
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Entrez l'URL du site Web"
            className="p-3 pl-10 w-full border border-gray-300 rounded-lg bg-white"
          />
        </div>
        <button
          onClick={handleScan}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold cursor-pointer w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Scan en cours...' : 'Scanner'}
        </button>
      </div>

      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold border-b-2 pb-2 mb-4">
          Routes trouvées :
        </h2>
        {!loading && routes.length === 0 && (
          <p>Aucune route trouvée. Entrez une URL et cliquez sur "Scanner".</p>
        )}
        <ul className="list-none p-0 space-y-2">
          {routes.map((route, index) => (
            <li key={index} className="flex items-center">
              <a
                href={route}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex-grow truncate"
              >
                {route}
              </a>
              <Button
                onClick={() => handleDeleteRoute(route)}
                className="text-red-500 ml-2"
                icon={<DeleteOutlined />}
              />
            </li>
          ))}
        </ul>

        {routes.length > 0 && (
          <button
            onClick={handleBotCreation}
            className={`mt-4 px-6 py-3 rounded-lg font-semibold text-white ${
              botCreationLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={botCreationLoading}
          >
            {botCreationLoading ? 'Création en cours...' : 'Créer votre bot'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Demo;



