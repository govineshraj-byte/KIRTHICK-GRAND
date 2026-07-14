/* ==========================================================================
   KIRTHICK GRAND 2.0 - Three.js Procedural Furniture Viewer
   ========================================================================== */

// --- Global ThreeJS Context ---
let threeContext = {
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    currentModel: null,
    animationId: null,
    woodType: 'Walnut', // Default wood type
    productId: null
};

// --- Wood Texture Canvas Generator ---
function createProceduralWoodTexture(woodType) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Select color palette
    let baseColor = '#5c4033'; // Deep brown
    let grainColor1 = 'rgba(40, 24, 16, 0.6)';
    let grainColor2 = 'rgba(26, 12, 6, 0.4)';
    
    if (woodType === 'Oak') {
        baseColor = '#d2b48c'; // Light tan/oak
        grainColor1 = 'rgba(139, 90, 43, 0.35)';
        grainColor2 = 'rgba(105, 75, 45, 0.2)';
    } else if (woodType === 'Teak') {
        baseColor = '#c49a6c'; // Teak orange-gold
        grainColor1 = 'rgba(92, 64, 43, 0.4)';
        grainColor2 = 'rgba(64, 40, 24, 0.2)';
    }

    // Fill base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    // Draw growth rings/grain waves
    ctx.lineWidth = 1.5;
    
    // Horizontal wood lines with noise
    for (let y = 0; y < 512; y += 4) {
        ctx.strokeStyle = Math.random() > 0.5 ? grainColor1 : grainColor2;
        ctx.beginPath();
        let x = 0;
        let cy = y;
        ctx.moveTo(x, cy);
        
        while (x < 512) {
            x += 8;
            // Add wave noise using sin waves and random fluctuation
            cy += Math.sin(x * 0.04) * 0.9 + (Math.random() - 0.5) * 0.3;
            ctx.lineTo(x, cy);
        }
        ctx.stroke();
    }

    // Add wooden knots occasionally
    for (let k = 0; k < 2; k++) {
        const knotX = Math.random() * 300 + 100;
        const knotY = Math.random() * 300 + 100;
        ctx.strokeStyle = grainColor1;
        ctx.lineWidth = 2.5;
        
        for (let r = 5; r < 40; r += 6) {
            ctx.beginPath();
            ctx.ellipse(knotX, knotY, r, r * 0.4, Math.PI / 6, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    return new THREE.CanvasTexture(canvas);
}

// --- Initialize Scene & Render Loop ---
function initThreeScene() {
    const root = document.getElementById('three-canvas-root');
    if (!root) return;

    // Clean up any existing instances
    destroyThreeInstance();

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0c0b0a');
    scene.fog = new THREE.FogExp2('#0c0b0a', 0.08);
    threeContext.scene = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, root.clientWidth / root.clientHeight, 0.1, 100);
    camera.position.set(6, 4, 8);
    threeContext.camera = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(root.clientWidth, root.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    root.appendChild(renderer.domElement);
    threeContext.renderer = renderer;

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit rotating below ground
    controls.minDistance = 2;
    controls.maxDistance = 20;
    threeContext.controls = controls;

    // Lights Setup
    // 1. Ambient lighting for soft infill
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.35);
    scene.add(ambientLight);

    // 2. Main Studio Spotlight for premium gloss and shadow definition
    const spotLight = new THREE.SpotLight('#f5f5e9', 1.8);
    spotLight.position.set(5, 8, 5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 15;
    spotLight.shadow.bias = -0.001;
    scene.add(spotLight);

    // 3. Rim light from behind for silhouette highlights
    const rimLight = new THREE.DirectionalLight('#dfb66d', 0.85);
    rimLight.position.set(-5, 4, -5);
    scene.add(rimLight);

    // 4. Fill Point Light for wood specular gloss reflection
    const pointLight = new THREE.PointLight('#ffffff', 0.6, 10);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Grid Floor
    const floorGeo = new THREE.PlaneGeometry(15, 15);
    const floorMat = new THREE.MeshStandardMaterial({
        color: '#161514',
        roughness: 0.85,
        metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor Grid Helper (Subtle gold-bronze grid)
    const gridHelper = new THREE.GridHelper(15, 15, '#c5a059', '#242220');
    gridHelper.position.y = -1.79;
    scene.add(gridHelper);

    // Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Start Rendering Loop
    animate();
}

function animate() {
    threeContext.animationId = requestAnimationFrame(animate);
    
    if (threeContext.controls) {
        threeContext.controls.update();
    }
    
    if (threeContext.renderer && threeContext.scene && threeContext.camera) {
        threeContext.renderer.render(threeContext.scene, threeContext.camera);
    }
}

function onWindowResize() {
    const root = document.getElementById('three-canvas-root');
    if (!root || !threeContext.camera || !threeContext.renderer) return;

    threeContext.camera.aspect = root.clientWidth / root.clientHeight;
    threeContext.camera.updateProjectionMatrix();
    threeContext.renderer.setSize(root.clientWidth, root.clientHeight);
}

function destroyThreeInstance() {
    if (threeContext.animationId) {
        cancelAnimationFrame(threeContext.animationId);
        threeContext.animationId = null;
    }
    window.removeEventListener('resize', onWindowResize);

    const root = document.getElementById('three-canvas-root');
    if (root) {
        root.innerHTML = '';
    }

    threeContext.renderer = null;
    threeContext.scene = null;
    threeContext.camera = null;
    threeContext.controls = null;
    threeContext.currentModel = null;
}

// --- Procedural Furniture Mesh Construction ---
function generateFurnitureMesh(productId, woodType) {
    if (!threeContext.scene) return;

    // Clear previous model if it exists
    if (threeContext.currentModel) {
        threeContext.scene.remove(threeContext.currentModel);
        threeContext.currentModel = null;
    }

    // Create Group Container
    const furnitureGroup = new THREE.Group();

    // Materials
    const woodTexture = createProceduralWoodTexture(woodType);
    
    // Create detailed Physical Material for high-end feel
    const woodMaterial = new THREE.MeshPhysicalMaterial({
        map: woodTexture,
        bumpMap: woodTexture,
        bumpScale: 0.008,
        roughness: 0.35,  // Slight shine for premium oiled finish
        metalness: 0.05,
        clearcoat: 0.15,  // Luxury hardwax coating feel
        clearcoatRoughness: 0.2
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.4,
        metalness: 0.8
    });

    const brassMaterial = new THREE.MeshStandardMaterial({
        color: '#c5a059',
        roughness: 0.2,
        metalness: 0.95
    });

    // Build specific geometry based on products
    if (productId === 'quarter-dining' || productId === 'walnut-bench') {
        // --- 1. Dining Table / Bench ---
        const isBench = productId === 'walnut-bench';
        
        // Table Top Box
        const topGeo = new THREE.BoxGeometry(isBench ? 3.6 : 4.4, isBench ? 0.1 : 0.16, isBench ? 1.0 : 2.4);
        const topMesh = new THREE.Mesh(topGeo, woodMaterial);
        topMesh.position.y = isBench ? -0.4 : 0.8;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        furnitureGroup.add(topMesh);

        // Legs (Four thick wooden blocks or cylindrical columns)
        const legGeo = new THREE.BoxGeometry(isBench ? 0.15 : 0.22, isBench ? 1.2 : 2.4, isBench ? 0.15 : 0.22);
        const legOffsets = isBench ? 
            [ {x: -1.6, z: -0.35}, {x: 1.6, z: -0.35}, {x: -1.6, z: 0.35}, {x: 1.6, z: 0.35} ] :
            [ {x: -1.9, z: -0.9}, {x: 1.9, z: -0.9}, {x: -1.9, z: 0.9}, {x: 1.9, z: 0.9} ];
            
        legOffsets.forEach(offset => {
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            leg.position.set(offset.x, isBench ? -1.0 : -0.4, offset.z);
            leg.castShadow = true;
            leg.receiveShadow = true;
            furnitureGroup.add(leg);
        });

        // Frame rail underneath top
        const railGeo = new THREE.BoxGeometry(isBench ? 3.0 : 3.8, isBench ? 0.1 : 0.15, isBench ? 0.8 : 2.0);
        const rail = new THREE.Mesh(railGeo, woodMaterial);
        rail.position.y = isBench ? -0.5 : 0.65;
        furnitureGroup.add(rail);

    } else if (productId === 'walnut-coffee') {
        // --- 2. Round Coffee Table ---
        // Top cylinder (Round wood surface)
        const topGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32);
        const topMesh = new THREE.Mesh(topGeo, woodMaterial);
        topMesh.position.y = 0;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        furnitureGroup.add(topMesh);

        // Three splayed legs
        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3;
            const legGeo = new THREE.CylinderGeometry(0.06, 0.04, 1.2, 16);
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            
            // Angled position
            const x = Math.cos(angle) * 1.0;
            const z = Math.sin(angle) * 1.0;
            leg.position.set(x, -0.6, z);
            
            // Tilt leg slightly outwards
            leg.rotation.z = Math.cos(angle) * 0.25;
            leg.rotation.x = -Math.sin(angle) * 0.25;
            leg.castShadow = true;
            furnitureGroup.add(leg);
        }

    } else if (productId === 'executive-desk') {
        // --- 3. Executive Desk ---
        // Large Top
        const topGeo = new THREE.BoxGeometry(4.2, 0.2, 2.2);
        const topMesh = new THREE.Mesh(topGeo, woodMaterial);
        topMesh.position.y = 0.8;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        furnitureGroup.add(topMesh);

        // Drawer blocks underneath
        const drawerGeo = new THREE.BoxGeometry(0.9, 0.5, 1.8);
        const leftDrawer = new THREE.Mesh(drawerGeo, woodMaterial);
        leftDrawer.position.set(-1.4, 0.45, 0);
        leftDrawer.castShadow = true;
        furnitureGroup.add(leftDrawer);
        
        // Handles on drawers (brass cylinders)
        const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
        const handle = new THREE.Mesh(handleGeo, brassMaterial);
        handle.rotation.z = Math.PI / 2;
        handle.position.set(-1.4, 0.45, 0.92);
        furnitureGroup.add(handle);

        // Four solid legs with metal brass tips
        const legGeo = new THREE.CylinderGeometry(0.08, 0.06, 2.2, 16);
        const legOffsets = [
            {x: -1.8, z: -0.9}, {x: 1.8, z: -0.9}, {x: -1.8, z: 0.9}, {x: 1.8, z: 0.9}
        ];
        
        legOffsets.forEach(offset => {
            const legGroup = new THREE.Group();
            
            // Wooden leg body
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            leg.position.y = -0.3;
            leg.castShadow = true;
            legGroup.add(leg);
            
            // Brass leg foot tip
            const tipGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.2, 16);
            const tip = new THREE.Mesh(tipGeo, brassMaterial);
            tip.position.y = -1.35;
            legGroup.add(tip);
            
            legGroup.position.set(offset.x, 0.8, offset.z);
            furnitureGroup.add(legGroup);
        });

    } else if (productId === 'oak-bed') {
        // --- 4. Platform Bed ---
        // Mattress base frame
        const frameGeo = new THREE.BoxGeometry(4.0, 0.4, 4.4);
        const frame = new THREE.Mesh(frameGeo, woodMaterial);
        frame.position.set(0, -0.6, 0);
        frame.castShadow = true;
        frame.receiveShadow = true;
        furnitureGroup.add(frame);

        // Large Bed Headboard
        const headGeo = new THREE.BoxGeometry(4.0, 1.8, 0.25);
        const head = new THREE.Mesh(headGeo, woodMaterial);
        head.position.set(0, 0.3, -2.1);
        head.castShadow = true;
        furnitureGroup.add(head);

        // Headboard cushion padding overlay
        const padGeo = new THREE.BoxGeometry(3.6, 1.2, 0.1);
        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: '#eae3d5',
            roughness: 0.9,
            bumpScale: 0.05
        });
        const cushion = new THREE.Mesh(padGeo, cushionMaterial);
        cushion.position.set(0, 0.3, -1.95);
        furnitureGroup.add(cushion);

        // Pillow box cubes
        const pillowGeo = new THREE.BoxGeometry(1.4, 0.2, 0.8);
        const pillow1 = new THREE.Mesh(pillowGeo, cushionMaterial);
        pillow1.position.set(-0.8, -0.35, -1.3);
        pillow1.rotation.x = 0.2;
        const pillow2 = pillow1.clone();
        pillow2.position.x = 0.8;
        furnitureGroup.add(pillow1);
        furnitureGroup.add(pillow2);

        // Sheets/Mattress block
        const sheetGeo = new THREE.BoxGeometry(3.8, 0.4, 3.8);
        const sheetMaterial = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 });
        const sheet = new THREE.Mesh(sheetGeo, sheetMaterial);
        sheet.position.set(0, -0.2, 0.25);
        sheet.castShadow = true;
        furnitureGroup.add(sheet);

    } else if (productId === 'live-edge-console') {
        // --- 5. Console Table ---
        // Slab top (wavy edge simulated by box)
        const topGeo = new THREE.BoxGeometry(4.0, 0.12, 1.2);
        const topMesh = new THREE.Mesh(topGeo, woodMaterial);
        topMesh.position.y = 0.6;
        topMesh.castShadow = true;
        topMesh.receiveShadow = true;
        furnitureGroup.add(topMesh);

        // Slim geometric steel dowel legs
        const leftLegGeo = new THREE.TorusGeometry(0.7, 0.04, 8, 3, Math.PI); // Half arc
        const rightLegGeo = leftLegGeo.clone();
        
        const legStructureGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
        const legOffsets = [ -1.6, 1.6 ];
        
        legOffsets.forEach(xPos => {
            const steelLeg = new THREE.Mesh(legStructureGeo, metalMaterial);
            steelLeg.position.set(xPos, -0.3, 0);
            steelLeg.castShadow = true;
            furnitureGroup.add(steelLeg);
            
            // Cross diagonal support bars
            const crossGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.9, 8);
            const cross = new THREE.Mesh(crossGeo, metalMaterial);
            cross.position.set(xPos, -0.3, 0);
            cross.rotation.z = xPos > 0 ? 0.3 : -0.3;
            furnitureGroup.add(cross);
        });

    } else if (productId === 'wedge-stool') {
        // --- 6. Wedge Stool ---
        // Thick circular seat
        const seatGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.14, 24);
        const seat = new THREE.Mesh(seatGeo, woodMaterial);
        seat.position.y = 0;
        seat.castShadow = true;
        seat.receiveShadow = true;
        furnitureGroup.add(seat);

        // Three splayed legs
        for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3;
            const legGeo = new THREE.CylinderGeometry(0.05, 0.035, 1.0, 8);
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            const x = Math.cos(angle) * 0.4;
            const z = Math.sin(angle) * 0.4;
            leg.position.set(x, -0.5, z);
            leg.rotation.z = Math.cos(angle) * 0.2;
            leg.rotation.x = -Math.sin(angle) * 0.2;
            leg.castShadow = true;
            furnitureGroup.add(leg);
        }

    } else {
        // --- 7. Outdoor Chair (Default Fallback) ---
        // Seat panel
        const seatGeo = new THREE.BoxGeometry(1.8, 0.1, 1.8);
        const seat = new THREE.Mesh(seatGeo, woodMaterial);
        seat.position.y = -0.2;
        seat.castShadow = true;
        seat.receiveShadow = true;
        furnitureGroup.add(seat);

        // Backrest panel
        const backGeo = new THREE.BoxGeometry(1.8, 1.4, 0.1);
        const back = new THREE.Mesh(backGeo, woodMaterial);
        back.position.set(0, 0.5, -0.85);
        back.rotation.x = -0.15; // Reclined
        back.castShadow = true;
        furnitureGroup.add(back);

        // Frame / Arms
        const armGeo = new THREE.BoxGeometry(0.08, 0.08, 1.9);
        const leftArm = new THREE.Mesh(armGeo, woodMaterial);
        leftArm.position.set(-0.92, 0.15, 0);
        const rightArm = leftArm.clone();
        rightArm.position.x = 0.92;
        furnitureGroup.add(leftArm);
        furnitureGroup.add(rightArm);

        // Solid block base supports
        const baseGeo = new THREE.BoxGeometry(0.12, 1.2, 0.12);
        const baseOffsets = [
            {x: -0.85, z: -0.8}, {x: 0.85, z: -0.8}, {x: -0.85, z: 0.8}, {x: 0.85, z: 0.8}
        ];
        baseOffsets.forEach(o => {
            const support = new THREE.Mesh(baseGeo, woodMaterial);
            support.position.set(o.x, -0.7, o.z);
            support.castShadow = true;
            furnitureGroup.add(support);
        });
    } else if (productId === 'slim-tv-unit') {
        // --- 7. Slim TV Unit ---
        // Long TV cabinet shell
        const shellGeo = new THREE.BoxGeometry(4.6, 0.8, 1.2);
        const shell = new THREE.Mesh(shellGeo, woodMaterial);
        shell.position.y = 0.2;
        shell.castShadow = true;
        shell.receiveShadow = true;
        furnitureGroup.add(shell);

        // Black metal/slate divider panels
        const divGeo = new THREE.BoxGeometry(0.04, 0.68, 1.1);
        [ -1.4, 0, 1.4 ].forEach(x => {
            const div = new THREE.Mesh(divGeo, metalMaterial);
            div.position.set(x, 0.2, 0);
            furnitureGroup.add(div);
        });

        // Sliding slatted wood front door (left/right open slots)
        const slatDoorGeo = new THREE.BoxGeometry(1.35, 0.68, 0.04);
        const slatDoor = new THREE.Mesh(slatDoorGeo, woodMaterial);
        slatDoor.position.set(-0.7, 0.2, 0.58);
        slatDoor.castShadow = true;
        furnitureGroup.add(slatDoor);

        // Cabinet legs (4 angled tapered pegs)
        const legGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.8, 12);
        [ {x:-2.1, z:-0.4}, {x:2.1, z:-0.4}, {x:-2.1, z:0.4}, {x:2.1, z:0.4} ].forEach(o => {
            const leg = new THREE.Mesh(legGeo, woodMaterial);
            leg.position.set(o.x, -0.6, o.z);
            leg.rotation.z = o.x > 0 ? -0.15 : 0.15;
            leg.castShadow = true;
            furnitureGroup.add(leg);
        });

    } else if (productId === 'two-seater-sofa') {
        // --- 8. Two Seater Sofa ---
        // Teak structural side frames (Armrests & legs combined)
        const armGeo = new THREE.BoxGeometry(0.12, 1.4, 2.4);
        const leftArmFrame = new THREE.Mesh(armGeo, woodMaterial);
        leftArmFrame.position.set(-1.66, -0.1, 0);
        leftArmFrame.castShadow = true;
        
        const rightArmFrame = leftArmFrame.clone();
        rightArmFrame.position.x = 1.66;
        furnitureGroup.add(leftArmFrame);
        furnitureGroup.add(rightArmFrame);

        // Lower support bars
        const beamGeo = new THREE.BoxGeometry(3.2, 0.08, 0.16);
        const beamF = new THREE.Mesh(beamGeo, woodMaterial);
        beamF.position.set(0, -0.6, 1.0);
        const beamB = beamF.clone();
        beamB.position.z = -1.0;
        furnitureGroup.add(beamF);
        furnitureGroup.add(beamB);

        // Cushion seat box (plush cream cushion)
        const seatCushionGeo = new THREE.BoxGeometry(3.2, 0.35, 2.0);
        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: '#eae3d5',
            roughness: 0.95
        });
        const seatCushion = new THREE.Mesh(seatCushionGeo, cushionMaterial);
        seatCushion.position.set(0, -0.25, 0.1);
        seatCushion.castShadow = true;
        seatCushion.receiveShadow = true;
        furnitureGroup.add(seatCushion);

        // Two backrest cushions (tilted back)
        const backCushionGeo = new THREE.BoxGeometry(1.5, 1.0, 0.3);
        const backCushionL = new THREE.Mesh(backCushionGeo, cushionMaterial);
        backCushionL.position.set(-0.78, 0.35, -0.75);
        backCushionL.rotation.x = -0.18; // lean back
        backCushionL.castShadow = true;
        
        const backCushionR = backCushionL.clone();
        backCushionR.position.x = 0.78;
        
        furnitureGroup.add(backCushionL);
        furnitureGroup.add(backCushionR);

    } else if (productId === 'storage-bench') {
        // --- 9. Storage Bench ---
        // Rectangular storage bin box chest
        const boxGeo = new THREE.BoxGeometry(3.6, 0.9, 1.4);
        const boxBody = new THREE.Mesh(boxGeo, woodMaterial);
        boxBody.position.y = -0.15;
        boxBody.castShadow = true;
        boxBody.receiveShadow = true;
        furnitureGroup.add(boxBody);

        // Cushion cover lid
        const lidGeo = new THREE.BoxGeometry(3.64, 0.15, 1.44);
        const cushionMaterial = new THREE.MeshStandardMaterial({
            color: '#7e6d61',
            roughness: 0.9
        });
        const lidCushion = new THREE.Mesh(lidGeo, cushionMaterial);
        lidCushion.position.y = 0.35;
        lidCushion.castShadow = true;
        furnitureGroup.add(lidCushion);

        // Small round wooden block feet
        const footGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16);
        [ {x:-1.6, z:-0.5}, {x:1.6, z:-0.5}, {x:-1.6, z:0.5}, {x:1.6, z:0.5} ].forEach(o => {
            const foot = new THREE.Mesh(footGeo, woodMaterial);
            foot.position.set(o.x, -0.7, o.z);
            foot.castShadow = true;
            furnitureGroup.add(foot);
        });
    }

    // Add generated piece to Scene
    threeContext.currentModel = furnitureGroup;
    threeContext.scene.add(furnitureGroup);
}

// --- Launch Modal View & Setup ---
window.launch3DViewer = function(productId) {
    const modal = document.getElementById('three-modal');
    const loader = document.getElementById('three-loader');
    
    if (!modal) return;
    
    // Capture metadata details
    const product = (window.PIECES || PIECES).find(item => item.id === productId);
    if (!product) return;
    
    threeContext.productId = productId;
    threeContext.woodType = product.wood.includes('Oak') ? 'Oak' : (product.wood.includes('Teak') ? 'Teak' : 'Walnut');
    
    // Update labels in side panel
    document.getElementById('three-product-title').textContent = product.name;
    document.getElementById('three-product-desc').textContent = product.desc;
    
    // Show modal
    modal.classList.add('open');
    if (loader) loader.classList.remove('hidden');
    
    // Build canvas scene inside timeout to ensure dimensions are rendered
    setTimeout(() => {
        initThreeScene();
        generateFurnitureMesh(productId, threeContext.woodType);
        
        // Sync texture controls active button state
        const selectButtons = document.querySelectorAll('.wood-select-btn');
        selectButtons.forEach(btn => {
            const btnType = btn.getAttribute('data-wood-type');
            if (btnType === threeContext.woodType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        if (loader) loader.classList.add('hidden');
    }, 400);
};

// --- Modal Control Bindings ---
document.addEventListener('DOMContentLoaded', () => {
    const modalClose = document.getElementById('three-modal-close');
    const modalOverlay = document.getElementById('three-modal-overlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            document.getElementById('three-modal').classList.remove('open');
            destroyThreeInstance();
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            document.getElementById('three-modal').classList.remove('open');
            destroyThreeInstance();
        });
    }
    
    // Wood Switcher Button triggers
    const woodButtons = document.querySelectorAll('.wood-select-btn');
    woodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            woodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const selectedType = btn.getAttribute('data-wood-type');
            threeContext.woodType = selectedType;
            
            // Regenerate furniture models with selected textures!
            generateFurnitureMesh(threeContext.productId, selectedType);
        });
    });
    
    // Camera Presets trigger controls
    const btnTop = document.getElementById('camera-focus-top');
    const btnLegs = document.getElementById('camera-focus-legs');
    const btnReset = document.getElementById('camera-focus-reset');
    
    if (btnTop) {
        btnTop.addEventListener('click', () => {
            if (!threeContext.camera || !threeContext.controls) return;
            // Target look direction directly downwards on top
            gsap.to(threeContext.camera.position, { x: 0, y: 3.5, z: 0.1, duration: 1 });
            gsap.to(threeContext.controls.target, { x: 0, y: 0.6, z: 0, duration: 1 });
        });
    }
    
    if (btnLegs) {
        btnLegs.addEventListener('click', () => {
            if (!threeContext.camera || !threeContext.controls) return;
            // Target look direction closely at bottom joint corners
            gsap.to(threeContext.camera.position, { x: 1.5, y: -0.6, z: 1.2, duration: 1 });
            gsap.to(threeContext.controls.target, { x: 1.9, y: -0.4, z: 0.9, duration: 1 });
        });
    }
    
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (!threeContext.camera || !threeContext.controls) return;
            // Reset to original isometric viewpoint
            gsap.to(threeContext.camera.position, { x: 6, y: 4, z: 8, duration: 1 });
            gsap.to(threeContext.controls.target, { x: 0, y: 0, z: 0, duration: 1 });
        });
    }

    // Modal Add-to-Wishlist from 3D View button
    const addToWishlist3dBtn = document.getElementById('wishlist-add-3d-btn');
    if (addToWishlist3dBtn) {
        addToWishlist3dBtn.addEventListener('click', () => {
            if (threeContext.productId) {
                toggleWishlist(threeContext.productId);
                document.getElementById('three-modal').classList.remove('open');
                destroyThreeInstance();
            }
        });
    }
});
