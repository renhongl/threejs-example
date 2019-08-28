
(function() {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();

    camera.position.set(-30, 40, 30);
    camera.lookAt(scene.position);
    document.body.appendChild(renderer.domElement);
    
    renderer.setClearColor(new THREE.Color(0x000000))
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    var axes = new THREE.AxesHelper(20);
    scene.add(axes);

    var planeGeo = new THREE.PlaneGeometry(60, 20);
    var planeMat = new THREE.MeshLambertMaterial({
        color: 0xAAAAAA
    });
    var plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(15, 0, 0);
    plane.receiveShadow = true;
    scene.add(plane);

    var cubeGeo = new THREE.BoxGeometry(4, 4, 4);
    var cubeMat = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        // wireframe: true
    });
    var cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(-4, 3, 0);
    cube.castShadow = true;
    scene.add(cube);

    var sphereGeo = new THREE.SphereGeometry(4, 20, 20);
    var sphereMat = new THREE.MeshLambertMaterial({
        color: 0x7777FF,
        // wireframe: true
    });
    var sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(20, 4, 2);
    sphere.castShadow = true;
    scene.add(sphere);

    var spotLight = new THREE.SpotLight(0xFFFFFF);
    spotLight.position.set(-40, 40, -15);
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.far = 130;
    spotLight.shadow.camera.near = 40;
    spotLight.castShadow = true;
    scene.add(spotLight);

    var initStats = function(type) {
        var paneType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
        var stats = new Stats();
        stats.showPanel(paneType);
        document.body.appendChild(stats.dom);
        return stats;
    }

    var controls = {
        rotationSpeed: 0.02,
        bouncingSpeed: 0.03,
    }

    var gui = new dat.GUI();
    gui.add(controls, 'rotationSpeed', 0, 0.5);
    gui.add(controls, 'bouncingSpeed', 0, 0.5);

    var stats = initStats(0);

    var updateCube = function() {
        cube.rotation.x += controls.rotationSpeed;
        cube.rotation.y += controls.rotationSpeed;
        cube.rotation.z += controls.rotationSpeed;
    }

    var step = 0;
    var updateSphere = function() {
        step += controls.bouncingSpeed;
        sphere.position.x = 20 + 10 * (Math.cos(step));
        sphere.position.y = 2 + 10 * Math.abs(Math.sin(step));
    }

    var trackballControls = new THREE.TrackballControls(camera, renderer.domElement);
    var clock = new THREE.Clock();

    var renderScene = function() {
        stats.begin();
        updateCube();
        updateSphere();
        trackballControls.update(clock.getDelta());
        renderer.render(scene, camera);
        stats.end();
        requestAnimationFrame(renderScene);
    }

    

    

    requestAnimationFrame(renderScene);


}());