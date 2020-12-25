require('dotenv-defaults').config()

const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const WebSocket = require('ws')

const Message = require('./models/message') // self define 
const { resolveNaptr } = require('dns')

const app = express()
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

if (!process.env.MONGO_URL) {
  console.error('Missing MONGO_URL!!!')
  process.exit(1)
}
//
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection // conect db

db.on('error', (error) => {
  console.error(error)
})

db.once('open', () => {
  console.log('MongoDB connected!')

  wss.on('connection', ws => { //
    const sendData = (data) => {
      ws.send(JSON.stringify(data)) // server to client transfer object to string
    }

    const sendStatus = (s) => {
      sendData(['status', s])
    }

    Message.find()
      .limit(100)
      .sort({ _id: 1 })
      .exec((err, res) => { 
        if (err) throw err
        console.log(res)
        // initialize app with existing messages
        sendData(['init', res]) 
      })

    ws.onmessage = (message) => {
      const { data } = message // destruct message.data
      console.log(data)
      const [task, payload] = JSON.parse(data) // str to object
      
      switch (task) {
        case 'input': { //client send data, write to db , send back to client 'output' follow by message   
        Message.create([payload], (err) => {
          if (err) throw err

          sendData(['output', payload]);
          sendStatus({
            type: 'input',
            msg: 'success'
          })
        })
          break
        }
        case 'clear': {
          Message.deleteMany({}, () => {
            sendData(['cleared'])

            sendStatus({
              type: 'info',
              msg: 'Message cache cleared.' // send to usechat
            })
          })
          break
        }
        default:
          break
      }
    }
  })

  const PORT = process.env.port || 4000

  server.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`)
  })
})
