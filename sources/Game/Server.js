import msgpack from 'msgpack-lite'
import { v4 as uuidv4 } from 'uuid'
import { Events } from './Events.js'

export class Server
{
    constructor()
    {
        // Unique session ID
        this.uuid = localStorage.getItem('uuid')
        if(!this.uuid)
        {
            this.uuid = uuidv4()
            localStorage.setItem('uuid', this.uuid)
        }

        this.connected = false
        this.initData = null
        this.events = new Events()

        // First connect attempt
        this.connect()
        
        // Try connect
        setInterval(() =>
        {
            if(!this.connected)
                this.connect()
        }, 2000)
    }

    connect()
    {
        this.socket = new WebSocket(import.meta.env.VITE_SERVER_WS_URL)
        this.socket.binaryType = 'arraybuffer'

        this.socket.addEventListener('open', () =>
        {
            this.connected = true
            this.events.trigger('connected')

            // On message
            this.socket.addEventListener('message', (message) =>
            {
                this.onReceive(message)
            })

            // On close
            this.socket.addEventListener('close', () =>
            {
                this.connected = false
                this.events.trigger('disconnected')
            })
        })
    }

    onReceive(message)
    {
        const data = this.decode(message.data)
    
        if(data.type === 'init' && this.initData === null)
            this.initData = data

        this.events.trigger('message', [ data ])
    }

    send(message)
    {
        this.socket.send(this.encode({ uuid: this.uuid, ...message }))
    }

    decode(data)
    {
        return msgpack.decode(new Uint8Array(data))
    }

    encode(data)
    {
        return msgpack.encode(data)
    }
}