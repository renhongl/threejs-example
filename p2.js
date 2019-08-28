
(function() {

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    var axes = new THREE.AxesHelper(20);
    scene.add(axes);

    var planeGeo = new THREE.PlaneGeometry(60, 20);
    var planeMat = new THREE.MeshBasicMaterial({
        color: 0xAAAAAA
    });
    var plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.set(15, 0, 0);
    scene.add(plane);

    var cubeGeo = new THREE.BoxGeometry(4, 4, 4);
    var cubeMat = new THREE.MeshBasicMaterial({
        color: 0xFF0000,
        wireframe: true
    });
    var cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(-4, 3, 0);
    scene.add(cube);

    var sphereGeo = new THREE.SphereGeometry(4, 20, 20);
    var sphereMat = new THREE.MeshBasicMaterial({
        color: 0x7777FF,
        wireframe: true
    });
    var sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(20, 4, 2);
    scene.add(sphere);

    camera.position.set(-30, 40, 30);
    camera.lookAt(scene.position);

    document.body.appendChild(renderer.domElement);

    renderer.render(scene, camera);












}());