
import {
    NodeFrame,
    SpriteNodeMaterial,
    MathNode,
    OperatorNode,
    TextureNode,
    Vector2Node,
    TimerNode,
    FunctionNode,
    FunctionCallNode,
    PositionNode,
    UVNode
} from '../jsm/nodes/Nodes.js';


function init() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    const renderer = new THREE.WebGLRenderer();
    const light = new THREE.AmbientLight(0x404040);
    // set size
    renderer.setSize(window.innerWidth, window.innerHeight);
    // set background
    renderer.setClearColor(0x000000);
    // show shadow
    renderer.shadowMap.enabled = true;
    // render on dom
    document.body.appendChild(renderer.domElement);
    // set position for camera
    camera.position.set(70, 50, -20);
    // set camera to look at this scene
    camera.lookAt(scene.position);
    // add ambient light
    scene.add(light);

    return {
        scene,
        camera,
        renderer,
    }
}

function createSpotLight() {
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(100, 1000, 100);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    return spotLight;
}

function createOrbitControls(camera, renderer) {
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 20, 100);
    controls.update();
    return controls;
}

function trackballControls(camera, renderer) {
    const trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
    return trackballControls;
}

function createStats(type) {
    const paneType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
    const stats = new Stats();
    stats.showPanel(paneType);
    document.body.appendChild(stats.dom);
    return stats;
}

function createDatGUI(scene) {
    const guiControl = {

    }
    const gui = new dat.GUI();
    // gui.add(guiControl);
    return guiControl;
}

function createUV(hCount, speed) {
    let newSpeed = new Vector2Node(speed, 0);
    const scale = new Vector2Node(1 / hCount, 1);
    const uvTimer = new OperatorNode(new TimerNode(), newSpeed, OperatorNode.MUL);
    const uvIntegerTimer = new MathNode(uvTimer, MathNode.FLOOR);
    const uvFrameOffset = new OperatorNode(uvIntegerTimer, scale, OperatorNode.MUL);
    const uvScale = new OperatorNode(new UVNode(), scale, OperatorNode.MUL);
    const uvFrame = new OperatorNode(uvScale, uvFrameOffset, OperatorNode.ADD);
    return uvFrame;
}

function createSprite() {
    const loader = new THREE.TextureLoader();
    const s = loader.load('../textures/WalkingManSpriteSheet.png');
    s.wrapS = s.wrapT = THREE.RepeatWrapping;
    const obj = new THREE.Sprite(new SpriteNodeMaterial());
    obj.scale.x = 20;
    obj.scale.y = 20;
    obj.material.color = new TextureNode(s);
    obj.material.color.uv = createUV(8, 10);
    return obj;
}

function updateSprite(frame, clock, sprite) {
    const delta = clock.getDelta();
    frame.update(delta).updateNode(sprite.material);
}

function renderScene(scene, camera, renderer, controls, stats, guiControl, updateSprite, frame, clock, sprite) {
    stats.begin();
    controls.update();
    renderer.render(scene, camera);
    updateSprite(frame, clock, sprite);
    stats.end();
    requestAnimationFrame(function () {
        renderScene(scene, camera, renderer, controls, stats, guiControl, updateSprite, frame, clock, sprite);
    });
}

export function run() {
    const { scene, camera, renderer } = init();
    const controls = createOrbitControls(camera, renderer);
    const guiControl = createDatGUI(scene);
    const stats = createStats(0);
    const spotLight = createSpotLight();
    const sprite = createSprite();
    const frame = new NodeFrame();
    const clock = new THREE.Clock();
    scene.add(sprite);
    scene.add(spotLight);
    requestAnimationFrame(function () {
        renderScene(scene, camera, renderer, controls, stats, guiControl, updateSprite, frame, clock, sprite);
    });
}

