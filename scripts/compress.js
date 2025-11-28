import path from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'node:child_process'
import { glob } from 'glob'
import sharp from 'sharp'

/**
 * Models
 */
{
    // Get the current directory of the script.
    const directory = path.join(path.dirname(path.join(fileURLToPath(import.meta.url), '..')), process.argv[2])
    const files = await glob(
        `${directory}/**/*.glb`,
        {
            ignore:
            {
                ignored: (p) =>
                {
                    return /-(draco|ktx).glb$/.test(p.name)
                }
            }
        }
    )

    for(const inputFile of files)
    {
        const ktx2File = inputFile.replace('.glb', '-ktx.glb')
        const dracoFile = inputFile.replace('.glb', '-draco.glb')
        
        const ktx2Command = spawn(
            'gltf-transform',
            [
                'etc1s',
                inputFile,
                ktx2File,
                '--quality', '255',
                '--verbose'
            ]
        )

        ktx2Command.stdout.on('data', data => { console.log(`stdout: ${data}`) })
        ktx2Command.stderr.on('data', data => { console.error(`stderr: ${data}`) })
        ktx2Command.on('close', code =>
        {
            const dracoCommand = spawn(
                'gltf-transform',
                [
                    'draco',
                    ktx2File,
                    dracoFile,
                    '--method', 'edgebreaker',
                    '--quantization-volume', 'mesh',
                    '--quantize-position', 12,
                    '--quantize-normal', 6,
                    '--quantize-texcoord', 6,
                    '--quantize-color', 2,
                    '--quantize-generic', 2
                ]
            )
            dracoCommand.stdout.on('data', data => { console.log(`stdout: ${data}`) })
            dracoCommand.stderr.on('data', data => { console.error(`stderr: ${data}`) })
        })
    }
}

/**
 * Textures
 */
{
    // Get the current directory of the script.
    const directory = path.join(path.dirname(path.join(fileURLToPath(import.meta.url), '..')), process.argv[2])
    const files = await glob(
        `${directory}/**/*.{png,jpg}`,
        {
            ignore: '**/{ui,favicons,social}/**'
        }
    )

    const defaultPreset = '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf srgb --target_type RGB --swizzle r001'
    const presets = [
        [ /test.png$/,                            '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],

        [ /achievements\/glyphs.png$/,            '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /areas\/satanStar.png$/,                '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /floor\/slabs.png$/,                    '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /foliage\/foliageSDF.png$/,             '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /interactivePoints\/.+.png$/,           '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /intro\/.+.png$/,                       '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /jukebox\/jukeboxMusicNotes.png$/,      '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /overlay\/overlayPatternOriginal.png$/, '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R --swizzle r001' ],
        [ /palette.png$/,                         '--nowarn --2d --t2 --encode uastc --genmipmap --assign_oetf srgb --target_type RGB' ],
        [ /terrain\/terrain.png$/,                '--nowarn --2d --t2 --encode uastc --genmipmap --assign_oetf linear --target_type RGB' ],
        [ /career\/.+png$/,                       '--nowarn --2d --t2 --encode uastc --assign_oetf srgb --target_type RG' ],
        [ /whispers\/whisperFlame.png$/,          '--nowarn --2d --t2 --encode etc1s --qlevel 255 --assign_oetf linear --target_type R' ],
    ]

    for(const inputFile of files)
    {
        const ktx2File = inputFile.replace(/\.(png|jpg)$/, '.ktx')

        let preset = presets.find(preset => preset[0].test(inputFile))

        if(preset)
            preset = preset[1]
        else
            preset = defaultPreset

        const ktx2Command = spawn(
            'toktx',
            [
                ...preset.split(' '),
                ktx2File,
                inputFile,
            ]
        )

        ktx2Command.stdout.on('data', data => { console.log(inputFile); console.log(`stdout: ${data}`) })
        ktx2Command.stderr.on('data', data => { console.log(inputFile); console.error(`stderr: ${data}`) })
        ktx2Command.on('close', code =>
        {
            // console.log('finished:', ktx2File);
        })
    }
}

/**
 * UI images
 */
{
    // Get the current directory of the script.
    const directory = path.join(path.dirname(path.join(fileURLToPath(import.meta.url), '..')), process.argv[2])
    const files = await glob(
        `${directory}/ui/**/*.{png,jpg}`
    )

    for(const inputFile of files)
    {
        const webpFile = inputFile.replace(/\.(png|jpg)$/, '.webp')

        await sharp(inputFile)
            .webp({ quality: 80 })
            .toFile(webpFile)
    }
}
