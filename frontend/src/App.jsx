import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatBotPage from './pages/ChatBotPage';
import MainPage from './pages/MainPage';
import axios from 'axios';
import "./App.css";
import Layout from './Layout';

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

const App = () => (
  <Router> {/* Wrap your routes inside Router */}
    <Routes>
    <Route path="/" element={<Layout />}>
      <Route exact path="/" element={<MainPage />} />
      <Route path="/chat-bot" element={<ChatBotPage />} />
    </Route>
    </Routes>
  </Router>
);

export default App;

