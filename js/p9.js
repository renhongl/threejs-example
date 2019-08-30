


(function () {

    function init() {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        const renderer = new THREE.WebGLRenderer();
        const light = new THREE.AmbientLight(0xffffff);

        // set size
        renderer.setSize(window.innerWidth, window.innerHeight);
        // set background
        renderer.setClearColor(0x000000);
        // show shadow
        renderer.shadowMap.enabled = true;
        // render on dom
        document.body.appendChild(renderer.domElement);
        // set position for camera
        camera.position.set(-50, 30, 100);
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

    function createSpotLight(plane) {
        const spotLight = new THREE.SpotLight(0xf7c242);
        spotLight.angle = 0.5;
        spotLight.distance = 1500;
        spotLight.intensity = 5;
        spotLight.position.set(1000, 200, 20);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.camera.near = 10;
        spotLight.shadow.camera.far = 1000;
        spotLight.shadow.camera.fov = 30;
        spotLight.target = plane;
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        return {
            spotLight,
            spotLightHelper,
        };
    }

    function createOrbitControls(camera, renderer) {
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        // camera.position.set(0, 20, 100);
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
        return guiControl;
    }

    function createTextureSprite(scene, type, size) {
        const loader = new THREE.TextureLoader();
        const s = loader.load('../textures/sprites/snowflake' + type + '.png');
        const geo = new THREE.Geometry();
        const mat = new THREE.PointsMaterial({
            size: size,
            map: s,
            blending: THREE.AdditiveBlending,
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
        scene.children.forEach(function (child) {
            if (child instanceof THREE.Points) {
                scene.remove(child);
            }
        });
    }

    let n = 1;

    function update(scene) {
        scene.children.forEach(function (child) {
            if (child instanceof THREE.Points) {
                const vertices = child.geometry.vertices;
                // child.rotation.x += 0.04;
                vertices.forEach(function (v) {
                    if (v.y < -500) {
                        v.y = Math.random() * 1000 + 1000;
                    } else {
                        v.y = v.y - 7;
                    }
                });
                child.geometry.verticesNeedUpdate = true;
            }
            if (child instanceof THREE.Sprite) {
                if (n >4 ) {
                    n = 1;
                }
                child.material.map.offset.set(1/4 * n++, 0);
                child.material.needsUpdate = true;
            }
        })
    }

    function createPlane() {
        const geo = new THREE.PlaneGeometry(1000, 1000);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x1e1e1e,
        });
        const plane = new THREE.Mesh(geo, mat);
        plane.position.y = -20;
        plane.rotation.x = -Math.PI * 0.5;
        plane.receiveShadow = true;
        return plane;
    }

    function createWood() {
        const loader = new THREE.TextureLoader();
        const s = loader.load('../textures/hardwood2_diffuse.jpg');
        const geo = new THREE.BoxGeometry(5, 10, 5);
        const mat = new THREE.MeshLambertMaterial({
            map: s,
        });
        const wood = new THREE.Mesh(geo, mat);
        wood.position.set(-30, -17.5, 0);
        wood.rotation.x = - Math.PI * 0.5;
        wood.castShadow = true;
        return wood;
    }

    function createTree(scene) {
        const loader = new THREE.ObjectLoader();
        loader.load('../objects/tree.json', function (obj) {
            obj.position.set(0, -16, 0);
            obj.scale.x = 3;
            obj.scale.y = 3;
            obj.scale.z = 3;
            scene.add(obj);
        });
    }

    function createTemp(scene) {
        const loader = new THREE.OBJLoader();
        loader.load('../objects/tree.obj', function (obj) {
            // obj.material.color.setHex(0x666666);
            scene.add(obj);
        });
    }

    function createTestAnim(scene, n) {
        const loader = new THREE.TextureLoader();
        const s = loader.load('../images/rect.jpg');
        const mat = new THREE.SpriteMaterial({
            transparent: true,
            color: 0xffffff,
            map: s,
        });
        mat.map.offset = new THREE.Vector2(0, 0);
        mat.map.repeat = new THREE.Vector2(1/4, 1/4);
        mat.deepthTest = false;
        const sprite = new THREE.Sprite(mat);
        scene.add(sprite);
        // const annie = new THREE.TextureAnimator(s, 4, 4, 16, 150);
        // scene.add(annie);
    }

    function renderScene(scene, camera, renderer, controls, stats, guiControl) {
        stats.begin();
        controls.update();
        update(scene);
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(function () {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    function main() {
        const { scene, camera, renderer } = init();
        const controls = createOrbitControls(camera, renderer);
        const guiControl = createDatGUI(scene, createTextureSprite);
        const stats = createStats(0);
        const plane = createPlane();
        const { spotLight, spotLightHelper } = createSpotLight(plane);
        const wood = createWood();
        scene.add(wood);
        createTextureSprite(scene, '1', 20);
        createTextureSprite(scene, '2', 30);
        createTextureSprite(scene, '3', 30);
        createTextureSprite(scene, '4', 20);
        createTextureSprite(scene, '5', 10);
        scene.add(plane);
        scene.add(spotLight);
        createTree(scene);
        // createTemp(scene);
        createTestAnim(scene, 0);
        createTestAnim(scene, 1);
        createTestAnim(scene, 2);
        createTestAnim(scene, 3);
        // scene.add(spotLightHelper);
        requestAnimationFrame(function () {
            renderScene(scene, camera, renderer, controls, stats, guiControl);
        });
    }

    main();


}());