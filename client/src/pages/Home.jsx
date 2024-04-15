import React from "react";
import Header from "../components/Header";
import ChatPage from "./ChatPage";

const Home = () => {
  const[isChatsOpen, setIsChatsOpen] = React.useState(false);
  return (
    <>
      <Header setIsChatsOpen={setIsChatsOpen} />
      {
        isChatsOpen ? (
          <ChatPage 
            isChatsOpen={isChatsOpen}
          />
        ) : (
          null
        )
      }
    </>
  );
};

export default Home;
