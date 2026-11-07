// Projects Data
const projectsData = [
    {
        title: 'Three.js Journey',
        titleSmall: ['Three.js', 'Journey'],
        url: 'https://threejs-journey.com',
        attributes: {
            role: ['developer', 'formater'],
            with: ['Hervé Studio', 'Bonhomme Paris']
        },
        distinctions: ['fwa'],
        description: 'A comprehensive course teaching everything you need to know about Three.js and WebGL development.',
        images: [
            '../static/projects/images/threejs-journey-1.png',
            '../static/projects/images/threejs-journey-2.png',
            '../static/projects/images/threejs-journey-3.png'
        ]
    },
    {
        title: 'Bonhomme | 10 ans',
        titleSmall: ['Bonhomme', '10 ans'],
        url: 'https://anniversary.bonhommeparis.com',
        attributes: {
            role: 'WebGL developer',
            with: 'Bonhomme Paris'
        },
        distinctions: ['awwwards', 'fwa'],
        description: 'An interactive anniversary experience celebrating 10 years of Bonhomme Paris.',
        images: [
            '../static/projects/images/bonhomme-10-ans-1.png',
            '../static/projects/images/bonhomme-10-ans-2.png',
            '../static/projects/images/bonhomme-10-ans-3.png'
        ]
    },
    {
        title: 'Madbox',
        titleSmall: ['Madbox'],
        url: 'https://madbox.io',
        attributes: {
            role: 'WebGL developer',
            at: 'Hervé Studio',
            with: 'Lei Xing'
        },
        distinctions: ['awwwards'],
        description: 'A creative showcase for Madbox, featuring immersive WebGL experiences.',
        images: [
            '../static/projects/images/madbox-1.png',
            '../static/projects/images/madbox-2.png',
            '../static/projects/images/madbox-3.png'
        ]
    },
    {
        title: 'Luni',
        titleSmall: ['Luni'],
        url: 'https://www.luni.app',
        attributes: {
            role: 'WebGL developer',
            at: 'Hervé Studio',
            with: 'Loïc Belaidremesal'
        },
        distinctions: ['awwwards', 'fwa'],
        description: 'An innovative WebGL experience for Luni, pushing the boundaries of web graphics.',
        images: [
            '../static/projects/images/luni-1.png',
            '../static/projects/images/luni-2.png',
            '../static/projects/images/luni-3.png',
            '../static/projects/images/luni-4.png'
        ]
    },
    {
        title: 'Scout',
        titleSmall: ['Scout'],
        url: 'https://scout-omega.vercel.app',
        attributes: {
            role: 'WebGL developer',
            at: 'Hervé Studio'
        },
        distinctions: [],
        description: 'A WebGL-powered interactive experience for Scout.',
        images: [
            '../static/projects/images/scout-1.png',
            '../static/projects/images/scout-2.png',
            '../static/projects/images/scout-3.png'
        ]
    },
    {
        title: 'Prior Holdings',
        titleSmall: ['Prio', 'Holdings'],
        url: 'https://prior.co.jp/discover/en',
        attributes: {
            role: ['Front developer', 'WebGL developer'],
            at: 'Immersive Garden'
        },
        distinctions: ['awwwards', 'cssda', 'fwa'],
        description: 'An award-winning website for Prior Holdings, featuring advanced WebGL techniques.',
        images: [
            '../static/projects/images/prior-1.png',
            '../static/projects/images/prior-2.png',
            '../static/projects/images/prior-3.png'
        ]
    },
    {
        title: 'Orano',
        titleSmall: 'Orano',
        url: 'https://www.orano.group/experience/innovation/en',
        attributes: {
            role: ['Front developer', 'WebGL developer'],
            at: 'Immersive Garden'
        },
        distinctions: ['awwwards', 'cssda', 'fwa'],
        description: 'An immersive innovation showcase for Orano, blending creativity with cutting-edge technology.',
        images: [
            '../static/projects/images/orano-1.png',
            '../static/projects/images/orano-2.png',
            '../static/projects/images/orano-3.png'
        ]
    },
    {
        title: 'Citrix / Redbull',
        titleSmall: ['Citrix', 'Redbull'],
        url: 'https://thenewmobileworkforce.imm-g-prod.com',
        attributes: {
            role: ['WebGL developer'],
            at: 'Immersive Garden',
            with: ['Damien Doussaud', 'Quentin Leclercq']
        },
        distinctions: ['awwwards', 'cssda', 'fwa'],
        description: 'A collaborative project for Citrix and Redbull, featuring dynamic WebGL animations.',
        images: [
            '../static/projects/images/citrix-redbull-1.png',
            '../static/projects/images/citrix-redbull-2.png',
            '../static/projects/images/citrix-redbull-3.png'
        ]
    }
];

// Lab Projects Data
const labData = [
    {
        title: 'Black Hole',
        url: 'https://awwwards-2022-workshop.vercel.app',
        image: '../static/lab/images/black-hole.png',
        description: 'An experiment simulating the gravitational effects of a black hole using WebGL.'
    },
    {
        title: 'Infinite World',
        url: 'https://infinite-world.vercel.app',
        image: '../static/lab/images/infinite-world.png',
        description: 'A procedurally generated infinite world with seamless terrain generation.'
    },
    {
        title: 'My Room in 3D',
        url: 'https://my-room-in-3d.vercel.app',
        image: '../static/lab/images/my-room-in-3d.png',
        description: 'A 3D recreation of my personal space with interactive elements.'
    },
    {
        title: 'Particles System',
        url: 'https://three-js-tsl-particles-system.vercel.app',
        image: '../static/lab/images/particles-system.png',
        description: 'Advanced particle systems using Three.js Shading Language (TSL).'
    },
    {
        title: 'Stylized Low Poly',
        url: 'https://stylized-low-poly.vercel.app',
        image: '../static/lab/images/stylized-low-poly.png',
        description: 'Exploring low-poly art styles with custom shaders and lighting.'
    },
    {
        title: 'Holographic terrain',
        url: 'https://experiment-holographic-terrain.vercel.app',
        image: '../static/lab/images/holographic-terrain.png',
        description: 'Creating holographic effects with procedural terrain generation.'
    },
    {
        title: 'Woodkid Volcano Robot',
        url: 'https://experiment-woodkid-volcano-robot.vercel.app',
        image: '../static/lab/images/woodkid-volcano-robot.png',
        description: 'A creative experiment inspired by Woodkid\'s visual style.'
    },
    {
        title: 'Bounce Friday',
        url: 'https://threejs-journey.com/apps/bounce-friday/',
        image: '../static/lab/images/bounce-friday.png',
        description: 'A fun physics-based bouncing game experiment.'
    },
    {
        title: 'VFX flames',
        url: 'https://threejs.org/examples/webgpu_tsl_vfx_flames.html',
        image: '../static/lab/images/vfx-flames.png',
        description: 'Realistic flame VFX using WebGPU and custom shaders.'
    },
    {
        title: 'VFX tornado',
        url: 'https://threejs.org/examples/webgpu_tsl_vfx_tornado.html',
        image: '../static/lab/images/vfx-tornado.png',
        description: 'Dynamic tornado visual effects with particle systems.'
    },
    {
        title: 'DOOM Portal',
        url: 'https://doom-portal-in-webgl.vercel.app',
        image: '../static/lab/images/doom-portal.png',
        description: 'Recreating the iconic DOOM portal effect in WebGL.'
    },
    {
        title: 'Organic Sphere',
        url: 'https://organic-sphere.vercel.app',
        image: '../static/lab/images/organic-sphere.png',
        description: 'Exploring organic forms with procedural geometry and shaders.'
    },
    {
        title: 'Attractors',
        url: 'https://threejs.org/examples/webgpu_tsl_compute_attractors_particles.html',
        image: '../static/lab/images/attractors.png',
        description: 'Particle systems influenced by gravitational attractors using compute shaders.'
    }
];

// Social Links Data
const socialData = [
    { name: 'X', url: 'https://x.com/bruno_simon', icon: '𝕏', align: 'right' },
    { name: 'Bluesky', url: 'https://bsky.app/profile/bruno-simon.bsky.social', icon: '🦋', align: 'right' },
    { name: 'YouTube', url: 'https://www.youtube.com/@BrunoSimon', icon: '▶', align: 'right' },
    { name: 'Mail', url: 'mailto:simon.bruno.77@gmail.com', icon: '✉', align: 'right' },
    { name: 'Twitch', url: 'https://www.twitch.tv/bruno_simon_dev', icon: '🎮', align: 'right' },
    { name: 'GitHub', url: 'https://github.com/brunosimon', icon: '⌘', align: 'right' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/simonbruno77/', icon: 'in', align: 'left' }
];

// Award Badge Mapping
const awardBadges = {
    'awwwards': { label: 'Awwwards', color: '#4a90d9' },
    'fwa': { label: 'FWA', color: '#ff6b6b' },
    'cssda': { label: 'CSSDA', color: '#6bcb77' }
};
