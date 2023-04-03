import { useEffect, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Popconfirm } from "antd";
import { IoSend, IoCaretDown } from 'react-icons/io5';
import './App.css';

// const ws = new WebSocket("ws:https://rmchatappbackend.herokuapp.com");


function App() {
  const [messages, setMessages] = useState([]);
  const [guid, setGuid] = useState("");
  const messagesContainer = document.getElementById("messages");
  const bottomRef = useRef(null);

  useEffect(() => {
    setGuid(Math.random().toString(36).substring(2, 15));
  }, [])

  // ws.onopen = () => {
  //   console.log("Terhubung ke Server Websocket");

  //   ws.send(
  //     JSON.stringify({
  //       command: "subscribe",
  //       identifier: JSON.stringify({
  //         id: guid,
  //         channel: "MessagesChannel",
  //       }),
  //     })
  //   )
  // };

  // ws.onmessage = (e) => {
  //   const data = JSON.parse(e.data);
  //   if (data.type === "ping") return;
  //   if (data.type === "welcome") return;
  //   if (data.type === "confirm_subscription") return;

  //   const message = data.message;
  //   setMessages([...messages, message]);
  // };

  useEffect(() => {
    fetchMessages();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value = "";

    await fetch("https://rmchatappbackend.herokuapp.com/messages/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ body }),
      body: JSON.stringify({
        body: body,
        guestid: guid
      }),
    });
    var btnsend = document.getElementById("btn-send");
    btnsend.className = 'messageButton';

    flushSync(() => {
      setMessages([...messages, messages]);
    });

    setTimeout(() => {
      scrollToDown();
    }, 100);
    }

  const deleteMessage = async (msgid) => {
    const url = 'https://rmchatappbackend.herokuapp.com/messages/'+msgid;

    await fetch(url, {
      method: "DELETE",
    })
      .then((data) => {
        if (data.ok) {
          fetchMsg();
        }
      })
  };

  const fetchMsg = async () => {
    const url = 'https://rmchatappbackend.herokuapp.com/messages/';

    const rep = await fetch(url);
    const data = await rep.json();
    setMessages(data);
  }

  const fetchMessages = async () => {
    const response = await fetch("https://rmchatappbackend.herokuapp.com/messages/");
    const data = await response.json();
    setMessagesAndScrollDown(data);
  };

  const setMessagesAndScrollDown = (data) => {
    setMessages(data);
    // resetScroll();
  };
  
  const scrollToDown = () => {
    bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }

  const resetScroll = () => {
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  useEffect(() =>{
    var inp = document.getElementById("input-text");
    var btnsend = document.getElementById("btn-send");

    inp.addEventListener("input", () => {
      if(inp.value!='') {
        btnsend.className = 'messageButton active';
      } else {
        btnsend.className = 'messageButton';
      }
    });
  })

  var scrollValue = 0;

  useEffect(() => {
    if (messagesContainer!=null) {
      scrollValue = Math.floor(messagesContainer.scrollTop) + 429;
      // console.log(scrollValue);
      // // console.log((scrollValue+428) == messagesContainer.scrollHeight);
      // console.log("scroll height: " + messagesContainer.scrollHeight);

      var scrollDownbtn = document.getElementById("scrollDownButton");

      if (scrollValue>=messagesContainer.scrollHeight) {
        scrollDownbtn.className = 'scrollDownButton';
      } else {
        scrollDownbtn.className = 'scrollDownButton active';
      }
    }
  })

  return (
    <div className="App">
      <div className="messageHeader">
        <h1>Chat Room</h1>
        <p>Your ID: {guid}</p>
      </div>
      <div className="messages" id="messages">
        <div className='scrollDownButton' onClick={() => { scrollToDown();}} id="scrollDownButton">
          <IoCaretDown className='scrollDownButtonIcon'/>
        </div>
        {/* {messages.map((message) => (
            <div className="message" key={message.id}>
              <p class="body">{message.body}</p>
              <p class="guestid">from: {message.guestid}</p>
            </div>
        )
        )} */}

        {messages.map((message, index) => {
          if (message.guestid==guid) {
            return (
              <div className="yourmessage" key={index}>
                <p className="body">{message.body}</p>
                <p className="guestid">from: You</p>
                <Popconfirm title="Unsend this message?" onConfirm={() => deleteMessage(message.id)} okText="Yes" cancelText="No">
                  <a href="#" type="danger" className='deleteButton'>
                    Delete{" "}
                  </a>
                </Popconfirm>
              </div>

            )
          } else {
            return (
              <div className="message" key={message.id}>
                <p className="body">{message.body}</p>
                <p className="guestid">from: {message.guestid}</p>
              </div>
            )
          }
        })}

        {/* {messages.filter(message => {
          return (message.guestid==guid);
        }).map((message, index) => {
          return (
            <div class="yourmessage" key={index}>
              <p class="body">{message.body}</p>
              <p class="guestid">from: {message.guestid}</p>
            </div>
          )
        })
        } */}
        <div ref={bottomRef}/>
      </div>
      <div className="messageForm">
        <form onSubmit={handleSubmit}>
          <input required id="input-text" className="messageInput" type="text" name="message" placeholder='Type your message here...'  />
          <button id="btn-send" className="messageButton" type="submit">
            <IoSend/>
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
