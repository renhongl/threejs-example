
(function() {
    var gltfLoader = new THREE.GLTFLoader();
        var jsonLoader = new THREE.ObjectLoader();
        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(74, window.innerWidth / window.innerHeight, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        camera.lookAt(scene);
        var cube = null;
        var obj1 = null;
        var controls = null;

        var renderCube = function () {
            var texture = THREE.ImageUtils.loadTexture('./images/1.png');
            var geometry = new THREE.BoxGeometry(1, 1, 1);
            var material = new THREE.MeshLambertMaterial({ map: texture });
            cube = new THREE.Mesh(geometry, material);
            cube.position.z = 5;
            cube.position.y = 3;
            scene.add(cube);
        }

        var renderObj1 = function () {
            jsonLoader.load('./objects/model1.json', function (obj) {
                scene.add(obj);
                obj.position.z = 6;
                obj.position.y = 4;
                obj.position.x = 4;
                obj1 = obj;
            });
        }

        var renderLight = function () {
            var light = new THREE.AmbientLight(0x404040);
            scene.add(light);
        }

        var renderScene1 = function () {
            gltfLoader.load('./scenes/scene.glb', function (gltf) {
                scene.add(gltf.scene);
            }, undefined, function (error) {
                console.error(error);
            });
        }

        var renderControl = function () {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            camera.position.set(0, 20, 100);
            controls.update();
        }

        var loop = function () {
            requestAnimationFrame(loop);
            if (cube) {
                cube.rotation.x += 0.01;
                cube.rotation.y += 0.01;
            }
            if (obj1) {
                obj1.rotation.x += 0.01;
                obj1.rotation.y += 0.01;
            }
            controls.update();
            renderer.render(scene, camera);
        }

        renderCube();
        renderObj1();
        renderLight();
        renderScene1();
        renderControl();
        loop();
}());