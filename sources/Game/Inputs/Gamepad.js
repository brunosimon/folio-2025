import { Events } from '../Events.js'
import { remapClamp } from '../utilities/maths.js'

export class Gamepad
{
    constructor()
    {
        this.events = new Events()

        /**
         * Keys
         */
        this.keys = {}

        const keysNames = [
            'cross',
            'circle',
            'square',
            'triangle',
            'l1',
            'r1',
            'l2',
            'r2',
            'select',
            'start',
            'l3',
            'r3',
            'up',
            'down',
            'left',
            'right',
            'center',
        ]
        this.keys.items = {}

        for(const keyName of keysNames)
        {
            this.keys.items[keyName] = {
                name: keyName,
                down: false,
                value: 0
            }
        }

        this.keys.mappings = {
            '':
            {
                '1': 'cross',
                '2': 'circle',
                '0': 'square',
                '3': 'triangle',
                '4': 'l1',
                '5': 'r1',
                '6': 'l2',
                '7': 'r2',
                '8': 'select',
                '9': 'start',
                '10': 'l3',
                '11': 'r3',
                '12': 'center',
                '13': 'up',
                '14': 'down',
                '15': 'left',
                '16': 'right',
            },
            standard: // https://w3c.github.io/gamepad/#remapping
            {
                '0': 'cross',
                '1': 'circle',
                '2': 'square',
                '3': 'triangle',
                '4': 'l1',
                '5': 'r1',
                '6': 'l2',
                '7': 'r2',
                '8': 'select',
                '9': 'start',
                '10': 'l3',
                '11': 'r3',
                '12': 'up',
                '13': 'down',
                '14': 'left',
                '15': 'right',
                '16': 'center',
            },
        }
        
        this.keys.arrowsExceptions = [
            { name: 'up',    index: 13, angles: [ -1, -0.7142857142857143, 1 ] },
            { name: 'right', index: 16, angles: [ -0.7142857142857143, -0.4285714285714286, -0.1428571428571429 ] },
            { name: 'down',  index: 14, angles: [ -0.1428571428571429, 0.1428571428571428, 0.4285714285714286  ] },
            { name: 'left',  index: 15, angles: [ 0.4285714285714286, 0.7142857142857142, 1 ]  }
        ]
        
        this.keys.triggerExceptions = [
            { name: 'l2', axesIndex: 4, keyIndex: 6, oldValue: 0.5, changed: false },
            { name: 'r2', axesIndex: 5, keyIndex: 7, oldValue: 0.5, changed: false },
        ]

        this.keys.fromIndex = (index, mappingName = 'standard') =>
        {
            // Mapping
            let mapping = this.keys.mappings[mappingName]
            
            if(!mapping)
                mapping = this.keys.mappings['standard']

            // Key
            let keyName = mapping[index]

            if(!keyName)
                return null

            return this.keys.items[keyName]
        }

        this.keys.sanatizeButtons = (gamepad) =>
        {
            const sanatizedButtons = []

            // Copy existing buttons
            for(const buttonIndex in gamepad.buttons)
            {
                const button = gamepad.buttons[buttonIndex]
            
                sanatizedButtons[buttonIndex] = {
                    pressed: button.pressed,
                    touched: button.touched,
                    value: button.value,
                }
            }

            // Test if non-standard
            if(gamepad.mapping === '')
            {
                // Arrows exception
                const arrowAngle = gamepad.axes[6]

                for(const nonStandardButton of this.keys.arrowsExceptions)
                {
                    const button = {
                        pressed: false,
                        touched: false,
                        value: 0
                    }

                    let isInAngles = false

                    for(const angle of nonStandardButton.angles)
                    {
                        if(Math.abs(angle - arrowAngle) < 0.1)
                            isInAngles = true
                    }
                    
                    if(isInAngles)
                    {
                        button.pressed = true
                        button.touched = true
                        button.value = 1
                    }

                    sanatizedButtons[nonStandardButton.index] = button
                }

                // Triggers exception
                for(const trigger of this.keys.triggerExceptions)
                {
                    const button = { pressed: false, touched: false, value: gamepad.axes[trigger.axesIndex] * 0.5 + 0.5 }

                    if(button.value > 0 && trigger.changed)
                    {
                        button.pressed = true
                        button.touched = true
                    }

                    if(button.value !== trigger.oldValue)
                    {
                        trigger.changed = true
                    }

                    sanatizedButtons[trigger.keyIndex] = button
                }
            }

            return sanatizedButtons
        }
        
        /**
         * Joysticks
         */
        this.joysticks = {}

        this.joysticks.deadZone = 0.2
        this.joysticks.items = {
            left: { indexes: [ 0, 1 ] },
            right: { indexes: [ 2, 3 ] },
        }

        for(const joystickName in this.joysticks.items)
        {
            const joystick = this.joysticks.items[joystickName]
            joystick.name = joystickName,
            joystick.x = 0,
            joystick.y = 0,
            joystick.radius = 0,
            joystick.angle = 0,
            joystick.active = false
        }
    }

    update()
    {
        for(const gamepad of navigator.getGamepads())
        {
            if(gamepad !== null)
            {
                /**
                * Keys
                */
                const buttons = this.keys.sanatizeButtons(gamepad)

                for(let i = 0; i < buttons.length; i++)
                {
                    const button = buttons[i]
                    const key = this.keys.fromIndex(i, gamepad.mapping)

                    if(key)
                    {
                        const oldValue = key.value
                        key.value = button.value

                        if(button.pressed)
                        {
                            if(!key.down)
                            {
                                key.down = true
                                this.events.trigger('down', [ key ])
                                console.log('down', key)
                            }
                            else
                            {
                                if(key.value !== oldValue)
                                {
                                    this.events.trigger('change', [ key ])
                                    console.log('change', key)
                                }
                            }
                        }
                        else
                        {
                            if(key.down)
                            {
                                key.down = false
                                this.events.trigger('up', [ key ])
                                console.log('up', key)
                            }
                        }
                    }
                }
                /**
                 * Joysticks
                 */
                for(const joystickName in this.joysticks.items)
                {
                    const joystick = this.joysticks.items[joystickName]

                    let oldX = joystick.x
                    let oldY = joystick.y
                    let oldActive = joystick.active

                    joystick.x = gamepad.axes[joystick.indexes[0]]
                    joystick.safeX = remapClamp(Math.abs(joystick.x), this.joysticks.deadZone, 1, 0, 1) * Math.sign(joystick.x)

                    joystick.y = gamepad.axes[joystick.indexes[1]]
                    joystick.safeY = remapClamp(Math.abs(joystick.y), this.joysticks.deadZone, 1, 0, 1) * Math.sign(joystick.y)

                    joystick.angle = Math.atan2(joystick.y, joystick.x)
                    joystick.radius = Math.hypot(joystick.y, joystick.x)

                    joystick.safeRadius = remapClamp(joystick.radius, this.joysticks.deadZone, 1, 0, 1)

                    joystick.active = joystick.radius > this.joysticks.deadZone

                    if(oldActive !== joystick.active || oldX !== joystick.x || oldY !== joystick.y)
                    {
                        this.events.trigger('joystickChange', [ joystick ])
                    }
                }
            }
        }
    }
}