


(function () {

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        const renderer = new THREE.WebGLRenderer();
        // set size
        renderer.setSize(window.innerWidth, window.innerHeight);
        // set background
        renderer.setClearColor(0x000000);
        // show shadow
        renderer.shadowMap.enabled = true;
        // render on dom
        document.body.appendChild(renderer.domElement);

        // set position for camera
        camera.position.set(-30, 50, 10);
        // set camera to look at this scene
        camera.lookAt(scene.position);

        return {
            scene,
            camera,
            renderer,
        }
    }

    function createCube() {
        const randomW = Math.random() * 2 + 1;
        const randomH = Math.random() * 2 + 1;
        const randomD = Math.random() * 2 + 1;
        const randomX = Math.random() * 20 - 10;
        const randomY = Math.random() * 20 - 10;
        const randomZ = Math.random() * 20 - 10;
        const randomRX = Math.random() * 10 + 5;
        const randomRY = Math.random() * 10 + 5;
        const randomRZ = Math.random() * 10 + 5;
        const cubeGeo = new THREE.BoxGeometry(randomW, randomH, randomD);
        const cubeMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
        });
        const cube = new THREE.Mesh(cubeGeo, cubeMat);
        cube.position.set(randomX, randomY, randomZ);
        cube.rotation.set(randomRX, randomRY, randomRZ);
        cube.castShadow = true;
        cube.receiveShadow = true;
        return cube;
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
        camera.position.set(-30, 20, 50);
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

    function createDatGUI(createCube, scene) {
        const guiControl = {
            rotationSpeed: 0.02,
            createCube: function() {
                const cube = createCube();
                scene.add(cube);
            }
        }
        const ranges = {
            rotationSpeed: [0, 0.1],
            createCube: null
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

    function updateCubes(scene, guiControl) {
        scene.traverse(function(obj) {
            if (obj.type === 'Mesh') {
                obj.rotation.x += guiControl.rotationSpeed;
                obj.rotation.y += guiControl.rotationSpeed;
                obj.rotation.z += guiControl.rotationSpeed;
            }
        });
    }

    function renderScene(scene, camera, renderer, controls, stats, guiControl) {
        stats.begin();
        updateCubes(scene, guiControl);
        controls.update();
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    function main() {
        const { scene, camera, renderer } = init();
        const controls = createOrbitControls(camera, renderer);
        const guiControl = createDatGUI(createCube, scene);
        // const controls = trackballControls(camera, renderer);
        const stats = createStats(0);
        const spotLight = createSpotLight();
        for (let i = 0; i < 1; i++) {
            const cube = createCube();
            scene.add(cube);
        }
        scene.add(spotLight);
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    main();


}());