import { use, useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Editor from "@monaco-editor/react";

const socket = io("http://localhost:5000");

const App = () => {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUsername] = useState("");
  const [language,setLanguage] = useState("javascript");
  const [code, setCode] = useState("// start code here");
  const [copySuccess, setCopySuccess] = useState("");
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");

  useEffect(()=>{
    socket.on("userJoined",(users)=>{
      setUsers(users);
    });

    socket.on("codeUpdate",(newCode)=>{
      setCode(newCode);
    })

    socket.on("userTyping",(user)=>{
      setTyping(`${user.slice(0,8)} is typing`);
      setTimeout(()=>setTyping(""),2000);
    })

    socket.on("languageUpdate",newLanguage=>{
      setLanguage(newLanguage);
    })

    return ()=>{
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
    }
  },[]);

  useEffect(()=>{
    const handleBeforeUnload =()=>{
      socket.emit("leaveRoom");
    }

    window.addEventListener("beforeunload",handleBeforeUnload);

    return ()=>{
      window.removeEventListener("beforeunload",handleBeforeUnload)
    }
  },[]);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess("Copied!");
    setTimeout(() => setCopySuccess(""), 2000);
  };

  const handleCodeChange = (newCode)=>{
    setCode(newCode);
    socket.emit("codeChange",{roomId, code:newCode});
    socket.emit("typing",{roomId,userName})
  }

  const handleLanguageChange = e=>{
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange",{roomId,language:newLanguage})
  }

  const join = ()=>{
    if(roomId && userName){
      socket.emit("join",{roomId,userName});
      setJoined(true);
    }
  }

  const leaveRoom = ()=>{
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUsername("")
    setCode("// start code here");
    setLanguage("javascript");
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
  return <div className="editor-container">
    <div className="sidebar">
      <div className="room-info">
        <h2>Code room: {roomId}</h2>
        <button className="copy-button" onClick={copyRoomId}>Copy room ID</button>
        {copySuccess && <span className="copy-success">{copySuccess}</span> }
      </div>
      <h3> Users in room</h3>
      <ul>
        {users.map((user,index)=>(
            <li key={index}>{user.slice(0,8)}</li>
          ))}
      </ul>
      <p className="typing-indicator">{typing}</p>
      <select className="language-selector" 
        value={language} 
        onChange={handleLanguageChange}>
        <option value = "javascript">Javascript</option>
        <option value = "python">Python</option>
        <option value = "java">Java</option>
        <option value = "cpp">C++</option>
      </select>
      <button className="leave-button" onClick={leaveRoom}>Leave room</button>
    </div>

    <div className="editor-wrapper">
      <Editor height = {"100%"} 
      defaultLanguage={language} 
      language={language}
      value={code}
      onChange={handleCodeChange}
      theme="vs-dark"
      options={
        {
          minimap:{enabled:false},
          fontSize: 14,
        }
      }
      />
    </div>
    
  </div>;
};

export default App;
