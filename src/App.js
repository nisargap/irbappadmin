import React, { Component } from 'react';
import ReactDOM from "react-dom";
import logo from './logo.svg';
import { Panel, Button, Row, Col } from "react-bootstrap";
import './App.css';
import HeadSetLogo from "./images/headset.jpg";
import UserLogo from "./images/user.png";

class App extends Component {
  constructor() {
    super();
    this.state = {
      chatMessage: "",
      chatHistory: [],

    }
  }
  initSockets() {
    this.wsConn = new WebSocket("ws://localhost:3030/v1/ws");
    this.wsConn.onmessage = (e) => {
      let chatHistory = this.state.chatHistory;
      let chatObj = JSON.parse(e.data);
      chatHistory.push(chatObj);
      this.setState({
        chatHistory: chatHistory
      })
      this.updateScroll();
    }
  }
  componentDidMount() {
    this.initSockets();
  }
  updateScroll () {
      const node = ReactDOM.findDOMNode(this.messagesEnd);
      node.scrollIntoView({ behavior: "smooth" });
  }
  changeChat(event) {
    this.setState({
      chatMessage: event.target.value
    })
  }
  resetExam = () => {
    this.wsConn.send(JSON.stringify({username: "administrator", message: "RESET_EXAM"}));    
  }
  pauseExam = () => {
    this.wsConn.send(JSON.stringify({username: "administrator", message: "PAUSE_EXAM"}));        
  }
  unPauseExam = () => {
    this.wsConn.send(JSON.stringify({username: "administrator", message: "UNPAUSE_EXAM"}));        
  }
  endExam = () => {
    this.wsConn.send(JSON.stringify({username: "administrator", message: "END_EXAM"}));            
  }
  handleChatSend(event) {
    event.preventDefault();
    const message = this.state.chatMessage;
    this.setState({
      chatMessage: ""
    })
    if (this.wsConn.readyState != 1) {
      this.initSockets();
      this.wsConn.send(JSON.stringify({username: "administrator", message: message}));
    } else {
      this.wsConn.send(JSON.stringify({username: "administrator", message: message}));
    }
  }
  render() {
    let count = 0;
    const chatMessages = this.state.chatHistory.map((obj) => {
      count += 1;
      return (
        <div key={Date.now() + count} style={{ padding: 0, overflow: "hidden" }}>
        {/* {obj.username} : {obj.message} */}
        <Row style={{ padding: "0.5em"}}>
          <Col xs={1} sm={1} lg={1} style={{ textAlign: "right" }}>
            {obj.username === "student" ? 
              <img src={UserLogo} style={{ width: 40 }} alt="user" />
              :
              <img src={HeadSetLogo} style={{ width: 40 }} alt="admin" />
            }
          </Col>
          <Col xs={11} sm={11} lg={11} style={{ textAlign: "left", paddingLeft: "1.5em", fontSize: "1em" }}>
            <Row><strong>{obj.message}</strong></Row>
            <Row style={{ color: "#c0c0c0" }}>Sent by {obj.username === "student" ? "student" : "you" }</Row>
          </Col>
        </Row>
        <hr style={{ padding: 0, margin: 0 }}/>
      </div>
      )
    })
    return (
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1>Admin interface</h1>
        <p>This interface enables you to interact with members of
          the experimental group as well as set different parameters</p>
        <Panel ref={(chatBox) => { this.chatBoxRef = chatBox; }}
 style={{ display: this.state.showChatBox}}>
            <div className="chatData">{chatMessages}
            <div style={{ float:"left", clear: "both" }}
             ref={(el) => { this.messagesEnd = el; }}>
             </div></div>
            <br />
            <form onSubmit={this.handleChatSend.bind(this)}>
            <input type="text" value={this.state.chatMessage} onChange={this.changeChat.bind(this)} className="message-input" style={{ width: "100%", padding: "0.8em"}} placeholder="Enter a message" />
            </form>
            <br />
            <h3>Experiment Actions</h3>
            <Button style={{ marginRight: "0.5em" }} onClick={this.resetExam} bsStyle="primary">Reset Exam</Button>
            <Button style={{ marginRight: "0.5em" }} onClick={this.pauseExam} bsStyle="primary">Pause Timer</Button>
            <Button style={{ marginRight: "0.5em" }} onClick={this.unPauseExam} bsStyle="primary">Unpause Timer</Button>
            <Button style={{ marginRight: "0.5em" }} onClick={this.endExam} bsStyle="primary">End Chat</Button>
            <Button style={{ marginRight: "0.5em" }} bsStyle="primary">Save Chat Log</Button>
            <br /><br />
            <p>* Note if you do pause timer it will automatically unpause the timer when you press end chat, so you don't have to press unpause timer
            </p>
            <h4>Usage Guide</h4>
            When you press these buttons they'll send a message over the connection but the user won't see it.
            <br /><br />
            <ul>
              <li><strong>Reset Exam</strong>: Resets the timer and starts the exam from the beginning with random questions.</li>
              <li><strong>Pause Timer</strong>: Pauses the timer but retains user answers</li>
              <li><strong>Unpause Timer</strong>: Unpauses timer (unneeded see note above)</li>
              <li><strong>End chat</strong>: Ends the chat and shows the user the survey</li>
              <li><strong>Save Chat Log</strong>: Saves the current chat log to a txt file</li>
            </ul>
          </Panel>
      </div>
    );
  }
}

export default App;
