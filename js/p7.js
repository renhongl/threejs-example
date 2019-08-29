


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

    function removeMesh(scene) {
        scene.children.forEach(function(child) {
            if (child.type === 'Mesh') {
                scene.remove(child);
            }
        });
    }

    function createDatGUI(scene, cube1BSP, cube2BSP) {
        const guiControl = {
            state: 'subtract'
        }
        const gui = new dat.GUI();
        gui.add(guiControl, 'state', ['subtract', 'intersect', 'union']).onFinishChange(function(result) {
            removeMesh(scene);
            let resultBSP;
            if (result === 'subtract') {
                resultBSP = cube1BSP.subtract(cube2BSP);
            }
            if (result === 'intersect') {
                resultBSP = cube1BSP.intersect(cube2BSP);
            }
            if (result === 'union') {
                resultBSP = cube1BSP.union(cube2BSP);
            }
            const resultObj = resultBSP.toMesh();
            resultObj.geometry.computeFaceNormals();
            resultObj.geometry.computeVertexNormals();
            scene.add(resultObj);
        });
        return guiControl;
    }

    function createCube1() {
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const mat = new THREE.MeshLambertMaterial({
            color:0xf16c20,
            wireframe: true
        });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.set(0, 0, 0);
        return cube;
    }

    function createCube2() {
        const geo = new THREE.SphereGeometry(0.5, 32, 32);
        const mat = new THREE.MeshLambertMaterial({
            color:0xf16c20,
            wireframe: true
        });
        const cube = new THREE.Mesh(geo, mat);
        cube.position.set(0.8, 0, 0);
        return cube;
    }


    function renderScene(scene, camera, renderer, controls, stats, guiControl) {
        stats.begin();
        controls.update();
        // update();
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    function main() {
        const { scene, camera, renderer } = init();
        const controls = createOrbitControls(camera, renderer);
        const cube1 = createCube1();
        const cube2 = createCube2();
        const cube1BSP = new ThreeBSP(cube1);
        const cube2BSP = new ThreeBSP(cube2);
        const guiControl = createDatGUI(scene, cube1BSP, cube2BSP);
        const stats = createStats(0);
        const spotLight = createSpotLight();
        const resultBSP = cube1BSP.subtract(cube2BSP);
        const resultObj = resultBSP.toMesh();
        resultObj.geometry.computeFaceNormals();
        resultObj.geometry.computeVertexNormals();
        scene.add(resultObj);
        // View original mesh object
        // scene.add(cube1);
        // scene.add(cube2);
        scene.add(spotLight);
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    main();


}());