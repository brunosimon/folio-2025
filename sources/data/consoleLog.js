import * as THREE from 'three/webgpu'

const text = `
████████╗ █████╗ ███╗   ██╗    ██████╗ ██╗███╗   ██╗ ██████╗     ██╗   ██╗███████╗███╗   ██╗
╚══██╔══╝██╔══██╗████╗  ██║    ██╔══██╗██║████╗  ██║██╔════╝     ╚██╗ ██╔╝██╔════╝████╗  ██║
   ██║   ███████║██╔██╗ ██║    ██████╔╝██║██╔██╗ ██║██║  ███╗     ╚████╔╝ █████╗  ██╔██╗ ██║
   ██║   ██╔══██║██║╚██╗██║    ██╔══██╗██║██║╚██╗██║██║   ██║      ╚██╔╝  ██╔══╝  ██║╚██╗██║
   ██║   ██║  ██║██║ ╚████║    ██████╔╝██║██║ ╚████║╚██████╔╝       ██║   ███████╗██║ ╚████║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝        ╚═╝   ╚══════╝╚═╝  ╚═══╝
                                                                       
╔═ Intro ═══════════════╗
║ Thank you for visiting my portfolio, you sneaky developer!
║ If you are curious about the stack and how I built this project, here’s everything you need to know.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ Mail           ⇒ tan828825@gmail.com
║ GitHub         ⇒ https://github.com/yan04s
║ LinkedIn       ⇒ https://linkedin.com/in/yan825
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ You can access the debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Three.js ════════════╗
║ Three.js is the library I’m using to render this 3D world (release: \${THREE.REVISION})
║ https://threejs.org/
╚═══════════════════════╝

╔═ Credits ═════════════╗
║ The original 3D portfolio was created by Bruno Simon.
║ Code: https://github.com/brunosimon/folio-2025
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]