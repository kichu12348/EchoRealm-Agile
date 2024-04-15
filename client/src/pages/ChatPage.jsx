import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import send from "../components/svgs/send.svg";
import io from "socket.io-client";

const Container = styled.div`
  height: 90vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ChatContainer = styled.div`
  width: 100%;
  height: 95%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const MessageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: 0.5rem;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ffffff;
    border-radius: 1rem;
  }
`;

const MessageWrapper = styled.div`
  width: 100%;
  display: flex;
  padding: 0 5px 0 5px ;
  flex-direction: column;
  align-items: ${(props) => (props.align ? "flex-end" : "flex-start")};
  justify-content: flex-start;
`;

const Message = styled.p`
  padding: 0.5rem 1rem;
  background-color: ${(props) =>props.bgcolor ? "rgba(200, 0, 255, 0.7)" : "rgba(0, 255, 21, 0.7)"};
  box-shadow:${(props) =>props.bgcolor ? "0 0 5px rgba(200, 0, 255, 0.765)" : "0 0 5px rgba(0, 255, 21, 0.765)"};
  color: #ffffff;
  font-weight: bold;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
`;

const InputContainer = styled.form`
  width: 50%;
  height: 5%;
  min-height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(255, 255, 255, 0.729);
  border-radius: 1rem;

  @media screen and (max-width: 768px) {
    width: 100%;
  }
  
`;

const Input = styled.input`
  width: 90%;
  padding: 0.5rem 1rem;
  border: none;
  background-color: rgba(255, 255, 255, 0);
  outline: none;
  color: #000000;

  &::placeholder {
    color: #0000007a;
    font-weight: bold;
  }
  @media screen and (max-width: 768px) {
    width: 99%;
  }
`;

const SendButton = styled.img`
  width: 10%;
  height: 100%;
  cursor: pointer;
`;

function ChatPage({ isChatsOpen }) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomID, setRoomID] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const scrollRef = useRef();

  const socket = io("http://localhost:8080"); // Change this to your server URL that you get from render example https://mernchatserver-mup6.onrender.com

  useEffect(() => {
    //runs only once and sends a request to the server to join a room and sets the roomID and isConnected state if you are connected to a room
    const joinRoomInterval = setInterval(() => {
      socket.emit("join");
      console.log("Joining a room...");
    }, 5000);
  
    socket.on("roomReady", (room) => {
      setRoomID(room.id);
      setIsConnected(true);
      clearInterval(joinRoomInterval); 
    });
  
    return () => {
      clearInterval(joinRoomInterval); 
    };
  }, []);

  //this is the cleanup function that runs when the component is unmounted or when the isChatsOpen state changes but this doesnt work yet ion why but the other features work 😎
  useEffect(()=>{
   if(!isChatsOpen){
      socket.emit('disconnecting',roomID)
      socket.disconnect()
    }
  },[isChatsOpen])
  
  useEffect(() => {
    //this runs and checks if a message has been emmitted from the server to the client
    socket.on("otherUserDisconnected",(roomID)=>{
      if(roomID){
        alert("other user disconnected...")
      }
    })
    
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };
  
    socket.on("newMessage", handleNewMessage);
  
    return () => {
      socket.off("newMessage", handleNewMessage); 
    };
  }, []);
  

  // Function to send a message
  
  const sendMessage = () => {
    if (messageInput.trim() !== "") {
      const message = {
        text: messageInput,
        username: user.username,
        roomID: roomID, 
      };
      socket.emit("message", message);
      setMessageInput("");
    }
  };
  
  

  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const scrollToBottom = () => {
    scrollRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Container>
      {isConnected ? (
        <>
          <ChatContainer>
            <MessageContainer>
              {messages.map((message, index) => (
                <MessageWrapper
                  align={message.username === user.username ? 1 : 0}
                  key={index}
                >
                  <Message
                    bgcolor={message.username === user.username ? 1 : 0}
                  >{message.text}</Message>
                </MessageWrapper>
              ))}
              <div style={{ width: 1, height: 1 }} ref={scrollRef}></div>
            </MessageContainer>
          </ChatContainer>
          <InputContainer
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={handleInputChange}
            />
            <SendButton src={send} alt="send" onClick={sendMessage} />
          </InputContainer>
        </>
      ) : (
        <h1
          style={{
            fontSize: "2rem",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Joining a Chat.......
        </h1>
      )}
    </Container>
  );
}

export default ChatPage;
