'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BookOpen, Box, Braces, Check, ChevronRight, CircleHelp,
  Code2, Database, Gauge, Layers3, Lightbulb, Menu, Network, PlayCircle,
  RotateCw, Search, Sparkles, Wrench, X, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const chapters = [
  { id:'big-picture', n:'01', title:'The big picture', desc:'How Omniverse, USD, Kit, the Data Table and MCP connect', icon:Network },
  { id:'usd-language', n:'02', title:'The language of USD', desc:'Stage, prim, property, attribute, relationship and path', icon:Box },
  { id:'hierarchy', n:'03', title:'Hierarchy & transforms', desc:'Parents, children, axes, pivots and local versus world space', icon:Braces },
  { id:'composition', n:'04', title:'Layers & composition', desc:'How small files combine into one final scene', icon:Layers3 },
  { id:'references', n:'05', title:'References & variants', desc:'Reuse assets and switch configurations without duplication', icon:Database },
  { id:'materials', n:'06', title:'Materials & environments', desc:'Bindings, textures, lights, visibility and original appearance', icon:Sparkles },
  { id:'animation', n:'07', title:'Animation', desc:'Time codes, keyframes, interpolation, joints and wheel rotation', icon:PlayCircle },
  { id:'datatable', n:'08', title:'Data Table & UI', desc:'How editable JSON generates a reusable configurator', icon:Code2 },
  { id:'mcp', n:'09', title:'MCP & the router', desc:'How Codex safely talks to a running Composer scene', icon:Network },
  { id:'debugging', n:'10', title:'Debugging lessons', desc:'What the missing texture, snapping panel and wobbling wheels taught us', icon:Wrench },
  { id:'files', n:'11', title:'Your project map', desc:'What each important file owns and when to edit it', icon:Gauge },
  { id:'practice', n:'12', title:'Practice & quiz', desc:'Exercises and a knowledge check to make it stick', icon:CircleHelp },
];

const glossary = [
  ['Stage','The complete scene you see after USD combines all contributing layers.'],
  ['Prim','One named scene object or container, such as /World/Car or a wheel mesh.'],
  ['Property','A piece of information on a prim. Attributes and relationships are both properties.'],
  ['Attribute','A value such as visibility, color, translation or rotation. It may change over time.'],
  ['Relationship','A connection from one prim to another, such as a mesh binding to a material.'],
  ['Layer','A USD file containing opinions. Layers combine instead of forcing everything into one file.'],
  ['Opinion','A value authored by a layer: “this color is red” or “this prim is hidden.”'],
  ['Composition','The rule-driven process that combines layers, references and variants into the stage.'],
  ['Reference','A reusable link that brings another USD asset into a prim.'],
  ['Variant set','A named group of alternatives such as color = original/red/blue.'],
  ['Xform','A transformable prim used to position, rotate or scale itself and its descendants.'],
  ['Time sample','An attribute value stored at a particular frame/time code.'],
  ['Material binding','A relationship telling geometry which material should shade it.'],
  ['Schema','A recognized type and behavior contract, such as Mesh, Xform or DistantLight.'],
  ['MCP','A tool protocol that lets an assistant use clearly defined operations exposed by a server.'],
];

const quiz = [
  { q:'What is the Data Table in our demo?', options:['The 3D car mesh','A configuration blueprint read by the UI','The renderer'], answer:1, why:'It describes controls, defaults, paths and actions. The panel code reads it; the USD scene performs the real changes.' },
  { q:'Which USD idea lets “red” and “original” exist as selectable alternatives?', options:['Variant set','Camera','Payload cache'], answer:0, why:'The color variant set stores named alternatives, and selecting one changes the composed result.' },
  { q:'Why did a front wheel appear to orbit instead of spin?', options:['Its texture was too large','Rotation happened around the wrong pivot/transform space','The Data Table was missing'], answer:1, why:'Rotation is always around an origin. If the transform origin is not at the axle, the wheel travels around that origin.' },
  { q:'What does a stronger USD layer do?', options:['Uses more GPU memory','Wins when it authors a competing opinion','Deletes weaker layers'], answer:1, why:'Layers remain separate. Composition resolves conflicts by strength; weaker layers are not destroyed.' },
  { q:'Why keep the “original” appearance option?', options:['It preserves the imported source bindings','It improves physics','It restarts Composer'], answer:0, why:'An empty/pass-through original variant allows the downloaded model’s source material bindings to remain visible.' },
];

function Code({ children }: { children: React.ReactNode }) {
  return <pre className="code"><code>{children}</code></pre>;
}

function Callout({ title, children, kind='idea' }: { title:string; children:React.ReactNode; kind?:'idea'|'project'|'careful' }) {
  const Icon = kind==='careful' ? Wrench : kind==='project' ? Zap : Lightbulb;
  return <aside className={`callout ${kind}`}><Icon/><div><strong>{title}</strong><div>{children}</div></div></aside>;
}

function ScreenshotLesson({ src, alt, title, caption, points }: { src:string; alt:string; title:string; caption:string; points:{label:string; text:string}[] }) {
  return <figure className="screenshot-lesson"><div className="shot-image"><img src={src} alt={alt}/><span>Real project screenshot</span></div><figcaption><p className="shot-title">{title}</p><p>{caption}</p><div className="shot-points">{points.map((point,i)=><div key={point.label}><b>{i+1}</b><p><strong>{point.label}</strong>{point.text}</p></div>)}</div></figcaption></figure>;
}

function Lesson({ id, eyebrow, title, intro, children, done, onDone }: { id:string; eyebrow:string; title:string; intro:string; children:React.ReactNode; done:boolean; onDone:()=>void }) {
  return <section id={id} className="lesson scroll-mt-24"><div className="lesson-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="lead">{intro}</p></div><Button onClick={onDone} variant={done?'secondary':'outline'} className={done?'done-btn':''}>{done?<><Check/> Completed</>:<>Mark complete</>}</Button></div>{children}</section>;
}

export default function Home() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answers, setAnswers] = useState<Record<number,number>>({});
  useEffect(()=>{ try { setCompleted(JSON.parse(localStorage.getItem('openusd-progress')||'[]')); } catch {} },[]);
  useEffect(()=>{ localStorage.setItem('openusd-progress',JSON.stringify(completed)); },[completed]);
  const toggle=(id:string)=>setCompleted(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);
  const score=quiz.reduce((n,q,i)=>n+(answers[i]===q.answer?1:0),0);
  const filteredGlossary=useMemo(()=>glossary.filter(([a,b])=>(a+' '+b).toLowerCase().includes(query.toLowerCase())),[query]);
  const percent=Math.round(completed.length/chapters.length*100);

  return <main className="min-h-screen">
    <header className="site-header"><div className="header-inner"><a href="#top" className="brand"><span><Box size={19}/></span><div><b>OpenUSD Garage</b><small>ZAZ-965 learning lab</small></div></a><div className="header-progress"><span>{percent}% learned</span><div><i style={{width:`${percent}%`}}/></div></div><button className="menu-button" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle chapter menu">{menuOpen?<X/>:<Menu/>}</button></div></header>

    <section id="top" className="hero"><div><p className="hero-kicker"><BookOpen/> Learn by rebuilding what you made</p><h1>Understand your entire <em>Omniverse mini demo.</em></h1><p className="hero-copy">A friendly, detailed guide to OpenUSD, layers, variants, animation, materials, Kit UI, Data Tables, MCP—and the small decisions that made your ZAZ-965 configurator work.</p><div className="hero-actions"><a href="#big-picture" className="primary-link">Start learning <ArrowRight/></a><a href="#course-map" className="secondary-link"><PlayCircle/> View course map</a></div><div className="hero-stats"><div><b>12</b><span>chapters</span></div><div><b>40+</b><span>concepts</span></div><div><b>Real</b><span>project examples</span></div></div></div><figure><Image src="/zaz-desert.png" alt="The ZAZ-965 demo car in the Desert Road environment" width={1650} height={755} priority/><figcaption><span>Your working example</span>One car. The whole OpenUSD workflow.</figcaption></figure></section>

    <section id="course-map" className="course-map"><div className="wide"><p className="eyebrow">Course map</p><h2>Start simple. Build the mental model layer by layer.</h2><div className="chapter-grid">{chapters.map(c=><a href={`#${c.id}`} key={c.id} className="chapter-card"><span>{c.n}</span><c.icon/><div><h3>{c.title}</h3><p>{c.desc}</p></div>{completed.includes(c.id)&&<Check className="complete-check"/>}</a>)}</div></div></section>

    <div className="course-shell">
      <aside className={`toc ${menuOpen?'open':''}`}><div className="toc-inner"><p>Chapters</p>{chapters.map(c=><a href={`#${c.id}`} onClick={()=>setMenuOpen(false)} key={c.id} className={completed.includes(c.id)?'is-done':''}><span>{completed.includes(c.id)?<Check/>:c.n}</span>{c.title}</a>)}</div></aside>
      <article className="course-content">
        <Lesson id="big-picture" eyebrow="Chapter 01 · Orientation" title="First, see the whole machine" intro="Before learning individual terms, understand what each major piece is responsible for. This prevents the most common beginner confusion: treating Omniverse, USD, the UI and MCP as if they are the same thing." done={completed.includes('big-picture')} onDone={()=>toggle('big-picture')}>
          <div className="flow"><div><Database/><b>Data Table</b><span>What choices exist?</span></div><ChevronRight/><div><Code2/><b>Kit panel</b><span>Show controls and react to clicks</span></div><ChevronRight/><div><Layers3/><b>USD stage</b><span>Compose and display the scene</span></div><ChevronRight/><div><Sparkles/><b>Renderer</b><span>Turn scene data into pixels</span></div></div>
          <h3>The five responsibilities</h3><div className="numbered"><div><span>1</span><p><b>OpenUSD is the scene language.</b> It describes objects, transforms, materials, variants, animation and how many files combine.</p></div><div><span>2</span><p><b>Omniverse Composer is the application.</b> It loads and edits the USD stage, provides a viewport, timeline and property panels, and renders the result.</p></div><div><span>3</span><p><b>Kit is the application framework.</b> Composer itself is built with Kit. Our Python extension adds the custom configurator panel.</p></div><div><span>4</span><p><b>The Data Table is project configuration.</b> It tells the reusable panel which choices and actions this particular car supports.</p></div><div><span>5</span><p><b>MCP is an automation doorway.</b> It exposes specific scene operations so Codex can inspect or change a running Composer scene.</p></div></div>
          <Callout title="The restaurant analogy"><p><b>USD is the kitchen and recipe system.</b> The Data Table is the menu. The Kit panel is the waiter taking your selection. Composer is the whole restaurant where the result is prepared and shown. MCP is a controlled service entrance used by an automation assistant.</p></Callout>
          <Callout kind="project" title="In our ZAZ project"><p>Clicking <b>Red</b> starts in the panel. The panel learned that “red” exists from <code>datatable.json</code>. It asks the stage to select the red color variant. USD composition resolves the result, the material binding changes, and the renderer displays red pixels.</p></Callout>
        </Lesson>

        <Lesson id="usd-language" eyebrow="Chapter 02 · Foundations" title="Learn the nouns of OpenUSD" intro="USD becomes much easier when you can name what you are looking at. These terms are small, but almost every advanced feature is built from them." done={completed.includes('usd-language')} onDone={()=>toggle('usd-language')}>
          <h3>Stage: the final composed scene</h3><p>A <b>stage</b> is the scene as an application understands it after composition. It may be assembled from many files, but Composer presents it as one hierarchy. Think of a finished web page assembled from HTML, CSS, images and scripts: the browser shows one page even though many resources contributed.</p>
          <h3>Prim: one addressable scene object</h3><p>A <b>prim</b> (short for primitive) is a named object or container. A prim can represent a car, mesh, camera, light, material or organizational group. Every prim has a unique path.</p>
          <Code>{`/World
/World/Car
/World/Car/ZAZ_965_fbx_skel
/World/Looks/RedPaint`}</Code>
          <p>The slash means hierarchy. <code>/World/Car</code> is a child of <code>/World</code>. A child inherits its parent’s transform, so moving <code>/World/Car</code> moves the entire car beneath it.</p>
          <div className="compare"><div><h4>Attribute</h4><p>A value owned by a prim: translation, visibility, color, intensity or a mesh’s points. Attributes can have one default value or time-sampled values.</p><code>visibility = "invisible"</code></div><div><h4>Relationship</h4><p>A connection to another prim. Material bindings are relationships: geometry points to the material that should shade it.</p><code>material:binding → /World/Looks/RedPaint</code></div></div>
          <h3>Prim types and schemas</h3><p>A prim’s type communicates intended behavior. An <b>Xform</b> can carry transforms. A <b>Mesh</b> carries polygons. A <b>DomeLight</b> emits environment light. USD schemas standardize these meanings so different applications agree.</p>
          <Callout kind="careful" title="Path accuracy matters"><p><code>/World/Car/Wheel</code> and <code>/World/car/Wheel</code> are different paths. A tool aimed at a wrong or renamed path cannot change the intended prim. That is why our Data Table stores exact USD paths for important parts.</p></Callout>
        </Lesson>

        <Lesson id="hierarchy" eyebrow="Chapter 03 · Space" title="Hierarchy, axes and pivots explain motion" intro="Most surprising movement bugs are not really animation bugs. They are misunderstandings about parent transforms, coordinate space or the point around which rotation occurs." done={completed.includes('hierarchy')} onDone={()=>toggle('hierarchy')}>
          <h3>Local space versus world space</h3><div className="compare"><div><h4>World space</h4><p>The global coordinate system of the whole stage. A world-space Z movement changes position along the stage’s Z axis.</p></div><div><h4>Local space</h4><p>The coordinate system inherited by an object from its parents. “Forward” for a rotated car may not match the world X axis.</p></div></div>
          <p>Our imported ZAZ faced along the <b>Z axis</b>. The first forward implementation used X, so the car moved sideways. The viewport gizmo revealed the correct orientation, and the Data Table action was changed to <code>axis: "z"</code>.</p>
          <ScreenshotLesson src="/car-axis-gizmo.png" alt="ZAZ-965 selected in Composer with its transform gizmo visible over the Desert Road" title="Read the gizmo before writing movement code" caption="This captured the sideways-motion investigation. The road gives us a visual definition of forward, while the colored gizmo tells us how the selected car prim is oriented in USD space." points={[{label:'The orange outline identifies the selected prim. ',text:'A transform applied at this parent moves the complete car hierarchy, not only one mesh.'},{label:'The colored arrows are axes, not driving directions. ',text:'We compare them with the road to discover which axis actually points forward.'},{label:'The fix belongs in project data. ',text:'Once Z was confirmed as forward, the drive action stored axis = z. The reusable movement code stayed generic.'}]}/>
          <h3>A pivot is the center of rotation</h3><p>Imagine pushing a door. It rotates around the hinge, not around its geometric center. Wheels rotate around their axles. If you rotate wheel geometry around a parent origin located elsewhere, the wheel <b>orbits</b> that origin like a moon instead of spinning in place.</p>
          <div className="formula"><span>Correct wheel motion</span><b>move to pivot → rotate → move back</b><small>or rotate an accurately positioned parent transform</small></div>
          <ScreenshotLesson src="/wheel-pivot-failure.png" alt="ZAZ-965 with its front wheel displaced above the door because it rotated around the wrong pivot" title="A perfect picture of the wrong pivot" caption="The tire did rotate—but around a point far from its axle. Rotation can therefore be mathematically valid and visually wrong at the same time." points={[{label:'The empty wheel well reveals the expected axle position. ',text:'That is the center around which the tire should spin.'},{label:'The tire above the door reveals the authored origin. ',text:'Its circular travel is evidence that a distant parent origin or uncompensated imported transform was used.'},{label:'Pivot compensation changes the transform chain. ',text:'Spin lives on an axle-centered child while the steering parent remains free to turn left and right.'}]}/>
          <h3>Transform inheritance</h3><p>If the steering joint rotates the front wheel left and right, and a child transform spins the wheel around its axle, the final motion is a composition of both transforms. The order matters. Our front wheels required pivot compensation beneath the steering parents so steering and axle spin could coexist.</p>
          <Code>{`worldTransform(wheelMesh) =
  worldTransform(car) × steeringTransform × axlePivot × spinRotation × localMeshTransform`}</Code>
          <p>Read this as a chain of coordinate systems. The car moves through the world; the steering parent aims the wheel; the axle pivot establishes the correct center; spin rotates around that center; and the imported mesh keeps its own local offset. Removing or reordering one transform changes the result.</p>
          <Callout kind="project" title="Why the rear wheels were easier"><p>The rear wheels did not have steering parents. They only needed axle rotation. The front wheels combined steering, imported joint transforms and added spin, so any axis or quaternion discontinuity became visible as wobble.</p></Callout>
        </Lesson>

        <Lesson id="composition" eyebrow="Chapter 04 · Core USD superpower" title="Layers combine without destroying each other" intro="Layering is the reason USD works well for teams and complex assets. Instead of repeatedly editing one giant scene, each concern can contribute its own opinions." done={completed.includes('composition')} onDone={()=>toggle('composition')}>
          <h3>What is an opinion?</h3><p>An <b>opinion</b> is a value authored in a layer. One layer might say the car is visible. Another might say its selected color variant is red. If multiple layers author the same property, USD’s composition rules determine which opinion wins.</p>
          <div className="layer-stack"><div><b>Strongest</b><span>working_scene.usda</span><small>Session choices and assembly</small></div><div><b>↑</b><span>zaz965_wheel_spin.usdc</span><small>Added animation samples</small></div><div><b>↑</b><span>mini_carpaint_variants.usda</span><small>Color choices</small></div><div><b>Weakest</b><span>Imported ZAZ asset</span><small>Source geometry, rig and materials</small></div></div>
          <p>“Strong” does not mean physically larger or more important. It means that when two opinions conflict, the stronger one is used in the composed result. The weaker opinion remains stored and can become visible again when the stronger one is removed.</p>
          <h3>Why our project uses separate layers</h3><ul><li>The downloaded car stays recoverable and recognizable.</li><li>Paint variants can change without touching animation.</li><li>Wheel spin can be regenerated without rebuilding materials.</li><li>Lights and environments can be edited independently.</li><li>A mistake can often be fixed by changing one small layer.</li></ul>
          <Callout title="Non-destructive editing"><p>Think of transparent sheets stacked on an overhead projector. Each sheet adds or replaces visible marks, but the sheets below remain intact. Removing the top sheet reveals what was underneath.</p></Callout>
          <h3>USDA versus USDC</h3><div className="compare"><div><h4>.usda</h4><p>Human-readable text. Excellent for learning, review and small authored layers.</p></div><div><h4>.usdc</h4><p>Binary “crate” format. Faster and more compact for heavier scene data and dense animation samples.</p></div></div>
        </Lesson>

        <Lesson id="references" eyebrow="Chapter 05 · Reuse & choices" title="References reuse; variants choose" intro="These two composition tools solve different problems. A reference brings an asset into a scene. A variant set keeps named alternatives on an asset." done={completed.includes('references')} onDone={()=>toggle('references')}>
          <h3>References</h3><p>A reference lets a prim reuse content defined elsewhere. Our <code>/World/Car</code> prim references the ZAZ asset instead of copying every mesh, material and animation into the assembly layer. If the source improves, scenes referencing it can receive that improvement.</p>
          <Code>{`def Xform "Car" (
    prepend references = @../assets/zaz965/zaz965.usd@
)
{
}`}</Code>
          <h3>Variant sets</h3><p>A variant set is like a named switchboard. The set <code>color</code> contains alternatives such as <code>original</code>, <code>red</code> and <code>blue</code>. Only the selected variant’s opinions participate.</p>
          <Code>{`variantSet "color" = {
  "original" { }          # source binding passes through
  "red"      { ... }      # bind RedPaint
  "blue"     { ... }      # bind BluePaint
}`}</Code>
          <p>The empty <code>original</code> variant is intentional. It does not mean “nothing exists.” It means this stronger layer adds no replacement binding, allowing the imported source material to remain visible.</p>
          <div className="compare"><div><h4>Reference asks</h4><p>“Which reusable asset should exist here?”</p><code>Bring in the ZAZ car</code></div><div><h4>Variant asks</h4><p>“Which authored alternative should this asset use?”</p><code>color = red</code></div></div>
          <Callout kind="careful" title="A button is not enough"><p>Adding <code>"green"</code> to the Data Table can create a Green button, but it cannot invent a green material or USD variant. The scene capability must exist, and then the Data Table exposes it to the UI.</p></Callout>
        </Lesson>

        <Lesson id="materials" eyebrow="Chapter 06 · Appearance" title="Materials shade geometry; environments shape the light" intro="A model’s appearance is a collaboration between geometry, material networks, texture files, lights, the environment and the renderer." done={completed.includes('materials')} onDone={()=>toggle('materials')}>
          <h3>Material binding</h3><p>A mesh does not usually contain “redness” itself. It is bound to a material prim. The material contains or connects to shader inputs such as base color, roughness, metallic response, normal detail and opacity.</p>
          <div className="flow compact"><div><Box/><b>Body mesh</b><span>Geometry</span></div><ChevronRight/><div><Network/><b>Binding</b><span>Relationship</span></div><ChevronRight/><div><Sparkles/><b>RedPaint</b><span>Shader network</span></div></div>
          <h3>Textures are external dependencies</h3><p>The missing grid-texture warning occurred because a material referenced an image using a path from an older Kit installation. USD successfully stored the path, but the file no longer existed at that location. This is similar to a web page whose image URL returns “not found.”</p>
          <ScreenshotLesson src="/missing-texture-warning.png" alt="Composer UsdToMdl warning showing a diffuse texture asset path that cannot be found" title="How to read the missing-texture warning" caption="The message contains a complete diagnosis: which system noticed the problem, which material prim owns it, which shader input is affected, and which path failed." points={[{label:'UsdToMdl is the reporting system. ',text:'It was translating USD shading data when the dependency could not be resolved.'},{label:'/Environment/Looks/Grid/Shader is the owner. ',text:'This proves the car is not the broken asset—the environment grid material is.'},{label:'diffuse_texture is the affected input. ',text:'Geometry can load while the shader loses the image supplying its surface color.'},{label:'The old Kit-cache path is the cause. ',text:'Moving installations made that fragile local dependency invalid.'}]}/>
          <Callout kind="careful" title="Portable asset rule"><p>Keep required textures inside a stable project asset folder and reference them with paths that remain valid when the project moves. A material can be perfectly authored and still render incorrectly if its image files are missing.</p></Callout>
          <h3>Environment switching</h3><p>The Desert Road and Studio options do not replace the whole stage. Our panel changes the <b>visibility</b> of environment prim groups. Desert Road shows <code>/Environment/hdr_projected_variants/desert_road_03</code> and hides studio ground/lights; Studio does the reverse.</p>
          <ScreenshotLesson src="/desert-road-scene.png" alt="Original beige ZAZ-965 on the Desert Road environment with its front and rear panels open" title="What an environment contributes" caption="The car geometry is unchanged. The improvement comes from projected scenery, sky illumination, a surface under the tires and reflections that match the surroundings." points={[{label:'Background and lighting agree. ',text:'The visible sky also influences illumination and reflections, helping the car feel placed rather than pasted.'},{label:'The road supplies scale and contact. ',text:'Lane markings, texture detail and tire shadows give strong depth and size cues.'},{label:'Light icons are scene helpers. ',text:'They represent authored light prims and are not physical objects in the final render.'},{label:'Animation remains independent. ',text:'Door and hood time samples keep working after the environment visibility choice changes.'}]}/>
          <h3>Lighting vocabulary</h3><ul><li><b>Dome or image-based light:</b> surrounds the scene with illumination sampled from an environment image.</li><li><b>Key light:</b> the main directional light defining form.</li><li><b>Fill light:</b> softens overly dark shadows.</li><li><b>Reflection:</b> bright surfaces seen by glossy materials; not the same thing as a side-mirror object.</li><li><b>Roughness:</b> controls whether highlights are sharp like polished metal or broad like worn paint.</li></ul>
          <Callout kind="project" title="Why we kept the aged beige original"><p>“Original” preserves the model’s imported material bindings, including its warm aged paint and cream/chrome wheels. Our red, blue and white options are deliberate overrides—not replacements for the source asset.</p></Callout>
          <ScreenshotLesson src="/original-zaz-material.png" alt="Close view of the ZAZ-965 original aged beige paint, dirty lower body and cream wheels" title="Original means source-authored—not plain beige" caption="This close view shows why a simple replacement color cannot recreate the downloaded model’s character. Several material channels and texture maps work together." points={[{label:'Base color carries variation. ',text:'The warm beige is not one perfectly flat RGB value.'},{label:'Roughness shapes highlights. ',text:'Broad reflections make the aged paint feel less polished than a new clearcoat.'},{label:'Dirt is spatial information. ',text:'Dark buildup near the lower body is mapped to exact regions through UVs.'},{label:'Different surfaces need different materials. ',text:'Body paint can change while glass, tires, chrome and source detail remain intact.'}]}/>
        </Lesson>

        <Lesson id="animation" eyebrow="Chapter 07 · Time" title="Animation is changing authored values over time" intro="USD animation is not a mysterious video clip. It is usually a collection of values stored at time codes, with interpolation filling the moments between them." done={completed.includes('animation')} onDone={()=>toggle('animation')}>
          <ScreenshotLesson src="/animation-controls.png" alt="Composer viewport and ZAZ animation panel with pose and sequence controls" title="The control panel is a remote control for stage time" caption="The buttons are not the animation itself. They choose a pose or configure timeline playback; the changing values already live on USD properties." points={[{label:'The viewport shows the evaluated result. ',text:'At the current frame Composer asks USD for every time-sampled value and redraws the car.'},{label:'The status line reports intention and time. ',text:'“Everything open (frame 480)” identifies one exact authored pose.'},{label:'Pose buttons jump; sequence buttons play. ',text:'A pose sets one frame. A sequence sets a range and starts the timeline so intermediate motion is visible.'},{label:'The scrollbar belongs to UI state. ',text:'Preserving widgets prevents controls such as Hold Open from snapping away after a click.'}]}/>
          <h3>Time codes and frames</h3><p>A stage defines a time range and a <b>timeCodesPerSecond</b> rate. At 24 time codes per second, 72 frames represent three seconds. A timeline moves the stage’s current time; USD evaluates time-sampled properties for that moment.</p>
          <div className="timeline"><div style={{left:'0%'}}><i/>0s<br/><b>closed</b></div><div style={{left:'25%'}}><i/>3s<br/><b>open</b></div><div style={{left:'58%'}}><i/>7s<br/><b>close starts</b></div><div style={{left:'83%'}}><i/>10s<br/><b>closed</b></div><div style={{left:'100%'}}><i/>12s</div></div>
          <p>Our repeated panel cycle opens for 3 seconds, holds open for 4, closes for 3 and holds closed for 2. Repeating the same open value across a time interval creates the four-second hold.</p>
          <h3>Exactly what happens when you click “Open doors”</h3>
          <div className="animation-pipeline"><div><span>1</span><div><b>The button identifies an action</b><p>The panel finds <code>open_doors</code> in <code>datatable.json</code>. Its mode is <code>clip</code>, its range is frames 1560–1848, and <code>loop</code> is true.</p></div></div><div><span>2</span><div><b>The timeline is prepared</b><p>Panel code sets the timeline start and end, moves current time to frame 1560, enables looping and calls Play.</p></div></div><div><span>3</span><div><b>USD evaluates each moment</b><p>At every displayed frame, the stage reads the time-sampled rotations for the left- and right-door joints. The renderer redraws their new positions.</p></div></div><div><span>4</span><div><b>The cycle repeats</b><p>When frame 1848 is reached, looping returns to 1560. Nothing is “recorded again”; the same authored samples are evaluated repeatedly.</p></div></div></div>
          <h3>The real Open Doors frame plan</h3>
          <div className="frame-plan"><div className="frame-head"><b>Frame</b><b>Elapsed</b><b>Door value</b><b>What you see</b></div><div><code>1560</code><span>0 sec</span><span>Closed</span><span>The cycle begins</span></div><div><code>1632</code><span>3 sec</span><span>Open</span><span>Both doors finish opening</span></div><div><code>1728</code><span>7 sec</span><span>Still open</span><span>The four-second open hold finishes</span></div><div><code>1800</code><span>10 sec</span><span>Closed</span><span>Both doors finish closing</span></div><div><code>1848</code><span>12 sec</span><span>Still closed</span><span>The two-second closed hold finishes; loop restarts</span></div></div>
          <Callout kind="project" title="Why the Hold Doors Open button behaves differently"><p><code>hold_doors</code> has mode <code>pose</code> and frame <code>1728</code>. The panel stops playback and sets one exact time. Because the timeline is not advancing, the doors remain open for as long as you want. A pose selects a moment; a clip plays through many moments.</p></Callout>
          <h3>Keyframes and interpolation</h3><p>A keyframe (time sample) stores an important value at a chosen time. Between two keys, interpolation calculates intermediate values. Linear interpolation moves at constant speed. Smooth curves ease in and out. Step interpolation jumps without blending.</p>
          <Code>{`# Simplified door-joint rotation samples
rotateAt(1560) = 0°       # closed
rotateAt(1632) = 68°      # open after 3 seconds
rotateAt(1728) = 68°      # same value: hold open for 4 seconds
rotateAt(1800) = 0°       # close over 3 seconds
rotateAt(1848) = 0°       # hold closed for 2 seconds`}</Code>
          <p>The hold is not a pause instruction embedded inside the door. It emerges from two equal values separated in time. Between frames 1632 and 1728, evaluating the rotation keeps producing 68°, so the door stays still while the playhead continues moving.</p>
          <div className="compare"><div><h4>What we authored</h4><p>Important rotation values at closed, open, hold and closing frames.</p><code>joint rotation @ frame 1560, 1632…</code></div><div><h4>What Composer calculates</h4><p>All intermediate joint orientations needed to display smooth movement between those authored samples.</p><code>evaluate(currentTime)</code></div></div>
          <h3>Skeleton animation</h3><p>The imported FBX car contains a skeleton-like joint hierarchy for doors, hoods, steering and wheels. Rotating the correct joint moves all geometry influenced beneath it. This is why identifying real door and hood joints was better than pretending the entire car was one static mesh.</p>
          <div className="joint-tree"><b>/World/Car</b><span>└─ ZAZ_965_fbx_skel</span><span>　├─ left door joint → left door mesh</span><span>　├─ right door joint → right door mesh</span><span>　├─ front trunk joint → front trunk mesh</span><span>　├─ rear hood joint → rear hood mesh</span><span>　└─ steering parents → front-wheel spin children</span></div>
          <h3>Drive Forward combines two animation systems</h3><p>The <code>drive_forward</code> action plays frames 2200–2296 for four seconds. During that same time, panel code smoothly translates <code>/World/Car</code> 350 units along Z while the USD clip rotates all four wheels.</p>
          <div className="split-motion"><div><RotateCw/><b>Wheel animation layer</b><p>Contains dense, axle-centered rotation samples. It handles the visual rolling of the four tires.</p></div><span>+</span><div><ArrowRight/><b>Panel movement task</b><p>Reads the car’s current position and smoothly changes its Z translation by 350 units.</p></div><span>=</span><div><PlayCircle/><b>Driving result</b><p>The whole car travels forward while its wheels spin at the same time.</p></div></div>
          <Code>{`start = current_position_of("/World/Car")
for each moment during 4 seconds:
    t = smoothstep(elapsed / duration)
    car.z = start.z + (350 * t)
    timeline evaluates wheel rotation for the same moment`}</Code>
          <p>We start from the <b>current</b> car position, not a fixed origin. That is why pressing Drive Forward again continues from wherever the previous movement stopped.</p>
          <h3>Quaternions and wobble</h3><p>Quaternions represent rotation without the classic gimbal-lock problems of Euler angles. But <code>q</code> and <code>-q</code> describe the same orientation. If adjacent samples alternate signs, interpolation may take an undesirable path. We enforced sign continuity by checking the quaternion dot product and negating the next sample when needed.</p>
          <Code>{`if dot(previous_quaternion, next_quaternion) < 0:
    next_quaternion = -next_quaternion`}</Code>
          <p>The drive clips also gained one sample per frame—97 samples across each four-second range—so the front-wheel compensation remained stable while steering parents were involved.</p>
          <Callout title="Timeline versus Curve Editor"><p>The timeline answers <b>when</b>. A Curve Editor shows <b>how a numeric value changes</b> between keys. Our generated USD samples can play on the timeline even though we authored them with a script rather than manually dragging curves.</p></Callout>
        </Lesson>

        <Lesson id="datatable" eyebrow="Chapter 08 · Reusable tools" title="The Data Table tells one UI how to serve this car" intro="This is the bridge between project-specific information and reusable panel logic. It is useful precisely because it is not the UI and not the USD asset." done={completed.includes('datatable')} onDone={()=>toggle('datatable')}>
          <div className="flow"><div><Database/><b>datatable.json</b><span>Options + actions + paths</span></div><ChevronRight/><div><Code2/><b>Python panel</b><span>Build buttons</span></div><ChevronRight/><div><Box/><b>USD APIs</b><span>Apply changes</span></div></div>
          <h3>A screenshot of our real Data Table</h3>
          <figure className="datatable-shot"><img src="/datatable-json.svg" alt="Annotated screenshot of the ZAZ-965 datatable.json showing defaults, environment options, Open Doors animation and Drive Forward animation"/><figcaption>This is a focused screenshot of the actual structures currently used by the mini demo. The complete file also contains layer descriptions, material mappings, part records and the rest of the animation actions.</figcaption></figure>
          <div className="annotation-grid"><div><span className="note-one">1</span><p><b>Defaults</b> are the selections used when the panel first resolves the configuration: original body paint, original wheels and Desert Road.</p></div><div><span className="note-two">2</span><p><b>Control options</b> are selectable values that are not attached to a particular part record. Here they generate Desert Road and Studio choices.</p></div><div><span className="note-three">3</span><p><b>Open Doors</b> is a reusable clip action. The label becomes button text; the frame range tells the timeline what to play; loop tells it to repeat.</p></div><div><span className="note-four">4</span><p><b>Drive Forward</b> adds action-specific data: Z is the car’s forward axis and 350 is the distance moved while frames 2200–2296 spin the wheels.</p></div></div>
          <h3>What our table currently exposes</h3><Code>{`"defaults": {
  "color": "original",
  "wheel_finish": "original",
  "environment": "desert_road"
}`}</Code>
          <p>Trim, interior and mirror controls are hidden because those choices do not meaningfully change this imported car. The underlying educational USD variants may remain, but the user-facing menu stays honest.</p>
          <h3>Animation actions are data too</h3><Code>{`{
  "id": "drive_forward",
  "label": "Drive forward + wheel spin",
  "mode": "drive",
  "start_frame": 2200,
  "end_frame": 2296,
  "axis": "z",
  "distance": 350
}`}</Code>
          <p>The panel understands the general meaning of a <code>drive</code> action. The table supplies this vehicle’s label, timeline range, direction and distance. A second vehicle could use the same panel code with different data.</p>
          <div className="compare"><div><h4>Without a Data Table</h4><p>Every button label, option and frame range is written directly into Python. Changing a project choice means editing application logic.</p></div><div><h4>With a Data Table</h4><p>Python stays reusable. The project describes itself in JSON, and the panel builds the appropriate controls.</p></div></div>
          <Callout title="The boundary to remember"><p>The Data Table can <b>expose and configure</b> capabilities. It cannot manufacture geometry, materials or animation. “Add garage” requires both a garage environment in USD and a corresponding table option.</p></Callout>
        </Lesson>

        <Lesson id="mcp" eyebrow="Chapter 09 · Automation" title="MCP is a controlled conversation with Composer" intro="The router lets an external assistant discover and call specific scene tools. It is more structured than blindly clicking the screen and safer than exposing arbitrary code execution." done={completed.includes('mcp')} onDone={()=>toggle('mcp')}>
          <h3>The route</h3><div className="flow"><div><Code2/><b>Codex</b><span>Requests a scene action</span></div><ChevronRight/><div><Network/><b>Router :9905</b><span>Dispatches the tool call</span></div><ChevronRight/><div><Box/><b>Composer :9910</b><span>Runs it against the live stage</span></div></div>
          <p>The MCP server describes tools with names, inputs and outputs. Codex can discover these tools and call them. The router exists as a stable front door, while the Composer bridge talks to the live application.</p>
          <h3>What this enables</h3><ul><li>Inspect stage paths and prim properties.</li><li>Change variant selections.</li><li>Move or rotate scene objects.</li><li>Set timeline ranges and trigger known actions.</li><li>Save or validate the working scene.</li><li>Automate repetitive checks without relying on screen coordinates.</li></ul>
          <Callout kind="careful" title="Running is not the same as visible"><p>The PowerShell message “Started router” means the service is listening. It does not mean Composer was launched. Starting with <code>-LaunchComposer</code> opens the application and provides live scene awareness.</p></Callout>
          <h3>MCP versus the Data Table</h3><p>MCP is an <b>external tool interface</b>. The Data Table is <b>internal project configuration</b>. MCP may ask Composer to change a selection; the Data Table tells our custom panel which selections it should present.</p>
        </Lesson>

        <Lesson id="debugging" eyebrow="Chapter 10 · Lessons from mistakes" title="Every bug taught us a reusable concept" intro="Debugging is not separate from learning. Each issue in this demo points to a principle you can reuse in future USD and real-time projects." done={completed.includes('debugging')} onDone={()=>toggle('debugging')}>
          <div className="debug-list"><div><span>01</span><div><h3>Missing grid texture</h3><p><b>Symptom:</b> a UsdToMdl warning referenced an old Kit cache path.</p><p><b>Lesson:</b> material networks depend on external image assets; a valid USD path can still point to a missing file.</p></div></div><div><span>02</span><div><h3>Animation looked instantaneous</h3><p><b>Symptom:</b> clicking “Everything open” jumped to an open pose.</p><p><b>Lesson:</b> a pose is one evaluated time; visible motion requires playing through a time range.</p></div></div><div><span>03</span><div><h3>Panel scrolled away after clicks</h3><p><b>Symptom:</b> rebuilding the whole UI reset the scroll position.</p><p><b>Lesson:</b> update only changed labels and button states; preserve interface state when data changes.</p></div></div><div><span>04</span><div><h3>Front wheel orbited the axle</h3><p><b>Symptom:</b> the tire travelled in a circle instead of spinning.</p><p><b>Lesson:</b> rotations occur around transform origins; use the correct axis, pivot and hierarchy.</p></div></div><div><span>05</span><div><h3>Car moved sideways</h3><p><b>Symptom:</b> “forward” translated horizontally across the road.</p><p><b>Lesson:</b> never assume an asset’s forward axis. Inspect the local/world axis orientation.</p></div></div><div><span>06</span><div><h3>Front tires jittered</h3><p><b>Symptom:</b> rear wheels were stable while steering wheels wobbled.</p><p><b>Lesson:</b> dense samples and quaternion sign continuity matter when combined joint transforms interpolate.</p></div></div></div>
          <h3>A calm debugging loop</h3><ol><li>Describe the visible symptom precisely.</li><li>Identify the smallest prim/property involved.</li><li>Check space, time, path and layer strength.</li><li>Change one cause at a time.</li><li>Validate both the intended result and what should remain unchanged.</li></ol>
        </Lesson>

        <Lesson id="files" eyebrow="Chapter 11 · Navigation" title="Know which file owns which concern" intro="You do not need to memorize every file. You need a map that tells you where to look when a particular kind of change is requested." done={completed.includes('files')} onDone={()=>toggle('files')}>
          <div className="file-table"><div className="file-head"><b>File</b><b>Responsibility</b><b>Edit it when…</b></div>{[
            ['working_scene.usda','Root assembly and layer stack','You need to change what composes the final stage'],
            ['datatable.json','Visible options, defaults and actions','You need to expose/hide a control or adjust action data'],
            ['mini_carpaint_variants.usda','Body color alternatives','You add or change a real paint variant'],
            ['mini_model_variants.usda','Wheel/configuration variants','You change wheel finish alternatives'],
            ['zaz965_wheel_spin.usdc','Generated dense animation samples','Regenerate wheel/drive animation; do not hand-edit binary data'],
            ['build_wheel_spin_layer.py','Animation-generation logic','You change pivots, clip ranges or sampling strategy'],
            ['mini_omk_panel.py','Reusable UI behavior','You add a new action mode or change panel interaction logic'],
            ['validate_usd_stack.py','Automated expectations','A required layer, variant or animation invariant changes'],
            ['start-omniverse.ps1','Stack launcher','Ports, startup services or launch behavior change'],
            ['RESUME_ON_NEW_PC.md','Handoff and recovery notes','The project state or manual startup process changes'],
          ].map(r=><div key={r[0]}><code>{r[0]}</code><span>{r[1]}</span><span>{r[2]}</span></div>)}</div>
          <h3>Manual startup</h3><Code>{`cd D:\\Omniverse
.\\start-omniverse.ps1 -LaunchComposer`}</Code>
          <p>This starts the supporting services and launches Composer. To stop the stack later, use <code>.\stop-omniverse.ps1</code>.</p>
          <h3>Before calling a feature finished</h3><ul className="checklist"><li><Check/> The intended button performs a visible, understandable change.</li><li><Check/> Original appearance can be restored.</li><li><Check/> Repeated clicks do not move the panel unexpectedly.</li><li><Check/> Animation starts, holds, closes and loops as described.</li><li><Check/> Save and reopen preserves the stage setup.</li><li><Check/> Validation reports expected layers, variants, prims and samples.</li></ul>
        </Lesson>

        <Lesson id="practice" eyebrow="Chapter 12 · Make it yours" title="Practice until the ideas feel natural" intro="Reading builds recognition. Small experiments build understanding. These exercises are ordered from safe data edits to deeper USD work." done={completed.includes('practice')} onDone={()=>toggle('practice')}>
          <h3>Guided exercises</h3><div className="exercise-grid"><div><span>Easy · 10 min</span><h4>Rename a button</h4><p>Change an animation <code>label</code> in the Data Table, reload it and confirm only the UI wording changes.</p></div><div><span>Easy · 15 min</span><h4>Change driving distance</h4><p>Reduce <code>distance</code> from 350 to 150. Predict the result before pressing Drive Forward.</p></div><div><span>Medium · 25 min</span><h4>Trace a color click</h4><p>Write the path from JSON option → panel callback → variant selection → material binding → rendered pixels.</p></div><div><span>Medium · 30 min</span><h4>Inspect layer strength</h4><p>Select a prim and identify which layer authored the winning material or visibility opinion.</p></div><div><span>Challenge · 45 min</span><h4>Add a green paint</h4><p>Create the material and variant first, validate it, then expose <code>green</code> through the Data Table.</p></div><div><span>Challenge · 60 min</span><h4>Create a camera preset</h4><p>Author a camera prim, then design a small data-driven action that moves the viewport to that shot.</p></div></div>
          <h3>Knowledge check</h3><div className="quiz">{quiz.map((item,i)=><div className="quiz-item" key={item.q}><b>{i+1}. {item.q}</b><div>{item.options.map((o,j)=><button key={o} onClick={()=>setAnswers(v=>({...v,[i]:j}))} className={answers[i]===j?(j===item.answer?'selected correct':'selected wrong'):''}>{answers[i]===j&&(j===item.answer?<Check/>:<X/>)}{o}</button>)}</div>{answers[i]!==undefined&&<p className={answers[i]===item.answer?'answer-good':'answer-bad'}>{item.why}</p>}</div>)}</div>{Object.keys(answers).length===quiz.length&&<div className="score"><Gauge/><div><b>{score}/{quiz.length} correct</b><p>{score===quiz.length?'Excellent—your mental model is solid.':score>=3?'Good foundation. Review the explanations for the missed questions.':'Take another slow pass through Chapters 1–8, then retry.'}</p></div></div>}
          <h3>Searchable glossary</h3><label className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search terms such as prim, layer, material…"/></label><div className="glossary">{filteredGlossary.map(([term,meaning])=><details key={term}><summary>{term}<ChevronRight/></summary><p>{meaning}</p></details>)}</div>
        </Lesson>

        <section className="finish"><Sparkles/><p className="eyebrow">You built more than a car demo</p><h2>You built a small, layered, data-driven USD application.</h2><p>Return to this guide whenever a word or workflow feels fuzzy. The goal is not to memorize everything at once—it is to know how the pieces relate and where to look next.</p><a href="#top">Back to the beginning <ArrowRight/></a></section>
      </article>
    </div>
  </main>;
}
