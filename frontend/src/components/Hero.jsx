import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="w-full flex justify-center items-center flex-col">
      <nav className="flex flex-col w-full md:flex-row justify-between items-center mb-10 pt-3  md:px-2">
        <Link
          to="/"
          className="orange_gradient text-4xl py-2 md:text-4xl  font-bold text-center md:text-left mb-4 md:mb-0"
        >
          Botgeneration.ai
        </Link>

        {/* <Link
          to="/chat-bot"
          className="black_btn text-sm md:text-base py-2 px-4 rounded"
        >
          Créer vote bot
        </Link> */}
      </nav>

      <h1 className="head_text">
        Créez votre bot avec <br className="max-md:hidden" />
        <span className="orange_gradient ">OpenAI GPT-4</span>
      </h1>
      <h2 className="head_texts">
        Scannez votre site web pour générer un bot intelligent capable de
        répondre à toutes vos questions liées à votre contenu. Grâce à l'IA,
        le bot analyse les informations de votre site et fournit des réponses
        précises et pertinentes, facilitant ainsi l'interaction avec vos
        utilisateurs.
      </h2>
    </div>
  );
};

export default Hero;
