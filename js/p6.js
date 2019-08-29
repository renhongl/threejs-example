


(function () {

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const light = new THREE.AmbientLight( 0x404040 );
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
        const ranges = {
            
        }
        const gui = new dat.GUI();
        const keys = Object.keys(guiControl);
        for (let i = 0, len = keys.length; i < len; i++) {
            if (!ranges[keys[i]]) {
                gui.add(guiControl, keys[i]);
            } else {
                gui.add(guiControl, keys[i], ranges[keys[i]][0], ranges[keys[i]][1]);
            }
        }
        return guiControl;
    }

    function createText(text, callback) {
        const loader = new THREE.FontLoader();
        loader.load('./fonts/gentilis_regular.typeface.json', function(font) {
            const geo = new THREE.TextGeometry(text, {
                font,
                size: 80,
                height: 5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5,
            });
            const mat = new THREE.MeshLambertMaterial({
                color: 0xf16c20
            });
            const textObj = new THREE.Mesh(geo, mat);
            textObj.position.set(-200, -20, -600);
            textObj.name = 'text';
            callback(textObj);
        });
    }

    function updateText(scene) {
        const textObj = scene.getObjectByName('text');
        if (textObj) {
            textObj.rotation.x += 0.004;
        }
    }

    function renderScene(scene, camera, renderer, controls, stats, guiControl) {
        stats.begin();
        controls.update();
        updateText(scene);
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    function main() {
        const { scene, camera, renderer } = init();
        const controls = createOrbitControls(camera, renderer);
        const guiControl = createDatGUI(scene);
        const stats = createStats(0);
        const spotLight = createSpotLight();
        createText('You are pig!', function(textObj) {
            scene.add(textObj);
        });
        scene.add(spotLight);
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    main();


}());