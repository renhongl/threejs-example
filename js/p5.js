


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
            showConvexObj: true,
            showLatheObj: false
        }
        const ranges = {
            showConvexObj: null,
            showLatheObj: null
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

    function createConvexObj() {
        const points = [];
        for (let i = 0; i < 20; i++) {
            const randomX = -15 + Math.round(Math.random() * 30);
            const randomY = -15 + Math.round(Math.random() * 30);
            const randomZ = -15 + Math.round(Math.random() * 30);
            points.push(new THREE.Vector3(randomX, randomY, randomZ));
        }
        const mat = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: false,
        });
        const convexGeo = new THREE.ConvexGeometry(points);
        convexGeo.computeVertexNormals();
        convexGeo.computeFaceNormals();
        convexGeo.normalsNeedUpdate = true;
        const convexObj = new THREE.Mesh(convexGeo, mat);
        convexObj.name = 'convex';
        return convexObj;
    }

    function createLatheObj() {
        const points = [];
        const height = 5;
        const count = 30;
        for (let i = 0; i < count; i++) {
            points.push(new THREE.Vector3(Math.sin(i*0.2) + Math.cos(i*0.3) * height + 12, 0, (i-count) + count / 2));
        }
        const latheGeo = new THREE.LatheGeometry(points);
        const mat = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: false,
        });
        const latheMesh = new THREE.Mesh(latheGeo, mat);
        latheMesh.name = 'lathe';
        return latheMesh;
    }

    function update(guiControl, scene) {
        scene.children.forEach(function(child) {
            if (child.name === 'lathe') {
                if (!guiControl.showLatheObj) {
                    child.visible = false;
                } else {
                    child.visible = true;
                    child.rotation.x += 0.008;
                    child.rotation.y += 0.008;
                    child.rotation.z += 0.008;
                }
            }
            if (child.name === 'convex') {
                if (!guiControl.showConvexObj) {
                    child.visible = false;
                } else {
                    child.visible = true;
                    child.rotation.x += 0.008;
                    child.rotation.y += 0.008;
                    child.rotation.z += 0.008;
                }
            }
        });
    }

    function renderScene(scene, camera, renderer, controls, stats, guiControl) {
        stats.begin();
        controls.update();
        update(guiControl, scene);
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
        const convexObj = createConvexObj();
        const latheObj = createLatheObj();
        scene.add(convexObj);
        scene.add(latheObj);
        scene.add(spotLight);

        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    main();


}());