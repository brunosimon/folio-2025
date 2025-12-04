import msgpack from 'msgpack-lite'
import { v4 as uuidv4 } from 'uuid'
import { Events } from './Events.js'
import { Game } from './Game.js'

export class Server
{
    constructor()
    {
        this.game = Game.getInstance()

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
        document.documentElement.classList.add('is-server-offline')

        if(import.meta.env.VITE_SERVER_CONNECT)
        {
            // First connect attempt
            this.connect()
            
            // Try connect
            setInterval(() =>
            {
                if(!this.connected)
                    this.connect()
            }, 2000)
        }
    }

    connect()
    {
        this.socket = new WebSocket(import.meta.env.VITE_SERVER_URL)
        this.socket.binaryType = 'arraybuffer'

        this.socket.addEventListener('open', () =>
        {
            this.connected = true
            document.documentElement.classList.remove('is-server-offline')
            document.documentElement.classList.add('is-server-online')
            this.events.trigger('connected')

            // On message
            this.socket.addEventListener('message', (message) =>
            {
                this.onReceive(message)
            })

            // Notification (only if been running for a while)
            if(this.game.ticker.elapsed > 10)
            {
                const html = /* html */`
                    <div class="top">
                        <div class="title">Server connected</div>
                    </div>
                `

                this.game.notifications.show(
                    html,
                    'server-connected',
                    8
                )
            }

            // On close
            this.socket.addEventListener('close', () =>
            {
                document.documentElement.classList.add('is-server-offline')
                document.documentElement.classList.remove('is-server-online')
                this.connected = false

                // Notification
                const html = /* html */`
                    <div class="top">
                        <div class="title">Server disconnected</div>
                    </div>
                `

                this.game.notifications.show(
                    html,
                    'server-disconnected',
                    8
                )
                
                this.events.trigger('disconnected')
            })
        })
    }

    onReceive(message)
    {
        const data = this.decode(message.data)
    
    
        if(this.initData === null)
            this.initData = data

        this.events.trigger('message', [ data ])
    }

    send(message)
    {
        if(!this.connected)
            return false

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