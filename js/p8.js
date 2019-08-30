


(function () {

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const light = new THREE.AmbientLight( 0xffffff );
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
            state: 'points with texture'
        }
        const gui = new dat.GUI();
        gui.add(guiControl, 'state', ['points with texture', 'points']).onFinishChange(function(result) {
            console.log('result', result);
            clear(scene);
            if (result === 'points with texture') {
                createTextureSprite(scene, '1', 20);
                createTextureSprite(scene, '2', 30);
                createTextureSprite(scene, '3', 30);
                createTextureSprite(scene, '4', 20);
                createTextureSprite(scene, '5', 10);
            }
            // if (result === 'sprite material') {
            //     createSimpleSprite(scene);
            // }
            if (result === 'points') {
                createMatSprite(scene);
            }
        });
        return guiControl;
    }

    function createSimpleSprite(scene) {
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000;
            const mat = new THREE.SpriteMaterial({
                color: Math.random() * 0xffffff
            });
            const sprite = new THREE.Sprite(mat);
            sprite.position.set(x, y, z);
            scene.add(sprite);
        }
    }

    function createMatSprite(scene) {
        const geo = new THREE.Geometry();
        const mat = new THREE.PointsMaterial({
            size: 20,
            color: 0xffffff,
            vertexColors: true
        });
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000;
            geo.vertices.push(new THREE.Vector3(x, y, z));
            geo.colors.push(new THREE.Color(Math.random() * 0xffffff));
        }
        const sprite = new THREE.Points(geo, mat);
        scene.add(sprite);
    }

    function createTextureSprite(scene, type, size) {
        const loader = new THREE.TextureLoader();
        const s = loader.load('../textures/sprites/snowflake'+type+'.png');
        const geo = new THREE.Geometry();
        const mat = new THREE.PointsMaterial({
            size: size,
            map: s,
            color: 0xffffff,
            vertexColors: true
        });
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 2000 - 1000;
            const y = Math.random() * 2000 - 1000;
            const z = Math.random() * 2000 - 1000; //-500; //|| Math.random() * 2000 - 1000;
            geo.vertices.push(new THREE.Vector3(x, y, z));
            geo.colors.push(new THREE.Color(0xffffff));
        }
        const sprite = new THREE.Points(geo, mat);
        scene.add(sprite);
    }

    function clear(scene) {
        scene.children.forEach(function(child) {
            if (child instanceof THREE.Points) {
                scene.remove(child);
            }
        });
    }

    function update(scene) {
        scene.children.forEach(function(child) {
            if (child instanceof THREE.Points) {
                const vertices = child.geometry.vertices;
                // child.rotation.x += 0.04;
                vertices.forEach(function(v) {
                    if (v.y < -500) {
                        v.y = Math.random() * 1000 + 1000;
                    } else {
                        v.y = v.y - 7;
                    }
                });
                child.geometry.verticesNeedUpdate = true;
            }
        })
    }

    function renderScene(scene, camera, renderer, controls, stats, guiControl) {
        stats.begin();
        controls.update();
        update(scene);
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    function main() {
        const { scene, camera, renderer } = init();
        const controls = createOrbitControls(camera, renderer);
        const guiControl = createDatGUI(scene, createSimpleSprite, createMatSprite, createTextureSprite);
        const stats = createStats(0);
        const spotLight = createSpotLight();
        createTextureSprite(scene, '1', 20);
        createTextureSprite(scene, '2', 30);
        createTextureSprite(scene, '3', 30);
        createTextureSprite(scene, '4', 20);
        createTextureSprite(scene, '5', 10);
        scene.add(spotLight);
        requestAnimationFrame(function() {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    main();


}());