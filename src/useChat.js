import { useState } from 'react'
// import { w3cwebsocket as W3CWebSocket } from 'websocket'

// const client = new W3CWebSocket('ws://localhost:4000')
const client = new WebSocket('ws://localhost:4000')

const useChat = () => {
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState({})
  const [opened, setOpened] = useState(false)

  client.onmessage = (message) => {
    const { data } = message // data = message.data
    const [task, payload] = JSON.parse(data)
    switch (task) {
      case 'init': {
        setMessages(() => payload)
        break
      }
      case 'output': {
        setMessages(() => [...messages, payload])
        break
      }
      case 'status': {
        setStatus(payload)
        break
      }
      case 'cleared': {
        setMessages([])
        break
      }
      default:
        break
    }
  }

  client.onopen = () => {
    setOpened(true)
  }

  const sendData = (data) => {
    
    console.log(data)
    client.send(JSON.stringify(data))
    console.log(JSON.stringify(data))
  }

  const sendMessage = (msg) => {
  
    sendData(['input', msg])
  }

  const clearMessages = () => { 
    
    sendData(['clear'])
  }

  return {
    status,
    opened,
    messages,
    sendMessage,
    clearMessages
  }
}

export default useChat

