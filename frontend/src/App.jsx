import { useState } from "react";
import "./App.css";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUsername] = useState("");

  const join = ()=>{
    if(roomId && userName){
      socket.emit("join",{roomId,userName});
      setJoined(true);
    }
  }

  if (!joined) {
    return (
      <div className="join-container">
        <div className="join-form">
          <h1>Join Code room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
          />
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(event) => setUsername(event.target.value)}
          />
          <button onClick={join}>Join room</button>
        </div>
      </div>
    );
  }
  return <div>User joined</div>;
};

export default App;
