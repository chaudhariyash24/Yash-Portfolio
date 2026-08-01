import * as THREE from 'three';
import { gsap } from 'gsap';

export class ThreeScene {
  constructor() {
    this.container = document.getElementById('webgl-canvas');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // 6 distinct 3D Model groups for Vulk.dev style rich variance
    this.groupHome = null;
    this.groupAbout = null;
    this.groupSkills = null;
    this.groupProjects = null;
    this.groupCertifications = null;
    this.groupContact = null;
    
    // Light base grid
    this.grid = null;
    
    // Interaction states
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    
    this.init();
  }

  init() {
    // 1. Setup Scene, Camera & Renderer
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xeef1f6, 0.006); // Light slate fog

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(0, 5, 45);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
      alpha: true, // Transparent WebGL overlay
      powerPreference: "high-performance"
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // 2. Create Master Container Group
    this.neuralNetGroup = new THREE.Group();
    this.scene.add(this.neuralNetGroup);

    // 3. Build Components
    this.createLights();
    this.create3DModels();
    this.createGridBase();
    this.updateGroupPlacement();
    
    // 4. Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));

    // 5. Set Initial Opacities
    this.updateModelCrossfading();

    // 6. Start Animation Loop
    this.animate();
  }

  createLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(30, 50, 30);
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0077b6, 2.0);
    rimLight.position.set(-30, -30, -10);
    this.scene.add(rimLight);
  }

  create3DModels() {
    // Highly visible matte slate metal material
    const darkMetalMaterial = () => new THREE.MeshStandardMaterial({
      color: 0x2c3e50,      // Elegant slate steel
      metalness: 0.75,      // Metallic shine
      roughness: 0.25,      // Matte diffuse shading for readability
      transparent: true,
      opacity: 1.0
    });

    const darkWireframeMaterial = () => new THREE.MeshBasicMaterial({
      color: 0x475569,      // Faint slate gray wire
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    // ----------------------------------------------------
    // MODEL 1 (Home Section): Nested Dodecahedron Cyber Core
    // ----------------------------------------------------
    this.groupHome = new THREE.Group();
    const dodecaGeo = new THREE.DodecahedronGeometry(6.5, 0); // 12 pentagonal faces
    const dodecaMesh = new THREE.Mesh(dodecaGeo, darkMetalMaterial());
    
    const icosaWireGeo = new THREE.IcosahedronGeometry(7.8, 1); // Outer wireframe shell
    const icosaWire = new THREE.Mesh(icosaWireGeo, darkWireframeMaterial());
    
    // Add point nodes to outer wire vertices for high-tech look
    const homeVertexGeo = new THREE.SphereGeometry(0.24, 8, 8);
    const homePos = icosaWireGeo.attributes.position;
    for (let i = 0; i < homePos.count; i += 3) {
      const vNode = new THREE.Mesh(homeVertexGeo, darkMetalMaterial());
      vNode.position.set(homePos.getX(i), homePos.getY(i), homePos.getZ(i));
      this.groupHome.add(vNode);
    }
    
    this.groupHome.add(dodecaMesh);
    this.groupHome.add(icosaWire);
    this.neuralNetGroup.add(this.groupHome);

    // ----------------------------------------------------
    // MODEL 2 (About Section): Concentric Ring Gyroscope
    // ----------------------------------------------------
    this.groupAbout = new THREE.Group();
    const coreGeo = new THREE.IcosahedronGeometry(3.5, 1);
    const coreMesh = new THREE.Mesh(coreGeo, darkMetalMaterial());
    const coreWire = new THREE.Mesh(coreGeo, darkWireframeMaterial());
    coreWire.scale.setScalar(1.02);
    coreMesh.add(coreWire);
    this.groupAbout.add(coreMesh);

    this.rings = [];
    const ringRadii = [6.5, 9.0, 11.5];
    const ringThicknesses = [0.4, 0.3, 0.2];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(ringRadii[i], ringThicknesses[i], 16, 100);
      const ringMesh = new THREE.Mesh(ringGeo, darkMetalMaterial());
      const ringWire = new THREE.Mesh(ringGeo, darkWireframeMaterial());
      ringWire.scale.setScalar(1.02);
      ringMesh.add(ringWire);
      
      if (i === 0) ringMesh.rotation.x = Math.PI / 3;
      else if (i === 1) ringMesh.rotation.y = Math.PI / 4;
      else ringMesh.rotation.z = Math.PI / 6;

      this.rings.push(ringMesh);
      this.groupAbout.add(ringMesh);
    }
    this.neuralNetGroup.add(this.groupAbout);

    // ----------------------------------------------------
    // MODEL 3 (Skills Section): Geodesic Node Sphere
    // ----------------------------------------------------
    this.groupSkills = new THREE.Group();
    const geoSphereGeo = new THREE.IcosahedronGeometry(7.5, 2);
    const geoSphereMesh = new THREE.Mesh(geoSphereGeo, darkMetalMaterial());
    const geoSphereWire = new THREE.Mesh(geoSphereGeo, darkWireframeMaterial());
    geoSphereWire.scale.setScalar(1.02);
    
    // Add point joints on vertices for high-tech node aesthetics
    const vertexGeo = new THREE.SphereGeometry(0.28, 8, 8);
    const pos = geoSphereGeo.attributes.position;
    for (let i = 0; i < pos.count; i += 3) {
      const vNode = new THREE.Mesh(vertexGeo, darkMetalMaterial());
      vNode.position.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      this.groupSkills.add(vNode);
    }
    this.groupSkills.add(geoSphereMesh);
    this.groupSkills.add(geoSphereWire);
    this.neuralNetGroup.add(this.groupSkills);

    // ----------------------------------------------------
    // MODEL 4 (Projects Section): Floating Grid of Cubes
    // ----------------------------------------------------
    this.groupProjects = new THREE.Group();
    this.cubes = [];
    const cubeCount = 14;
    const cubeGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    for (let i = 0; i < cubeCount; i++) {
      const cubeMesh = new THREE.Mesh(cubeGeo, darkMetalMaterial());
      const cubeWire = new THREE.Mesh(cubeGeo, darkWireframeMaterial());
      cubeWire.scale.setScalar(1.03);
      cubeMesh.add(cubeWire);
      
      cubeMesh.position.set(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12
      );
      const scale = 0.5 + Math.random() * 0.8;
      cubeMesh.scale.set(scale, scale, scale);

      this.cubes.push({
        mesh: cubeMesh,
        speedX: 0.005 + Math.random() * 0.01,
        speedY: 0.005 + Math.random() * 0.01,
        bobSpeed: 0.001 + Math.random() * 0.002,
        bobOffset: Math.random() * Math.PI * 2,
        initialY: cubeMesh.position.y
      });
      this.groupProjects.add(cubeMesh);
    }
    this.neuralNetGroup.add(this.groupProjects);

    // ----------------------------------------------------
    // MODEL 5 (Credentials/Achievements Section): Double Helix
    // ----------------------------------------------------
    this.groupCertifications = new THREE.Group();
    const helixSphereGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const helixConnectionGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.5, 8);
    for (let i = 0; i < 20; i++) {
      const theta = (i / 20) * Math.PI * 4; // 2 complete revolutions
      const y = (i / 20) * 16 - 8;          // Vertical spans from -8 to 8
      const r = 4.2;
      
      const xA = r * Math.cos(theta);
      const zA = r * Math.sin(theta);
      const sphereA = new THREE.Mesh(helixSphereGeo, darkMetalMaterial());
      sphereA.position.set(xA, y, zA);
      this.groupCertifications.add(sphereA);
      
      const xB = r * Math.cos(theta + Math.PI);
      const zB = r * Math.sin(theta + Math.PI);
      const sphereB = new THREE.Mesh(helixSphereGeo, darkMetalMaterial());
      sphereB.position.set(xB, y, zB);
      this.groupCertifications.add(sphereB);
      
      if (i % 2 === 0) {
        const bar = new THREE.Mesh(helixConnectionGeo, darkMetalMaterial());
        bar.position.set((xA + xB) / 2, y, (zA + zB) / 2);
        bar.rotation.z = -theta;
        this.groupCertifications.add(bar);
      }
    }
    this.neuralNetGroup.add(this.groupCertifications);

    // ----------------------------------------------------
    // MODEL 6 (Contact Section): Detailed Flower Torus Knot
    // ----------------------------------------------------
    this.groupContact = new THREE.Group();
    const flowerKnotGeo = new THREE.TorusKnotGeometry(6.5, 1.1, 120, 16, 3, 5);
    const flowerKnotMesh = new THREE.Mesh(flowerKnotGeo, darkMetalMaterial());
    const flowerKnotWire = new THREE.Mesh(flowerKnotGeo, darkWireframeMaterial());
    flowerKnotWire.scale.setScalar(1.02);
    
    this.groupContact.add(flowerKnotMesh);
    this.groupContact.add(flowerKnotWire);
    this.neuralNetGroup.add(this.groupContact);
  }

  createGridBase() {
    const gridHelperSize = 250;
    const gridHelperDivisions = 50;
    this.grid = new THREE.GridHelper(
      gridHelperSize, 
      gridHelperDivisions, 
      0xc5d3e8, 
      0xeef2f7
    );
    this.grid.position.y = -25;
    if (this.grid.material) {
      this.grid.material.transparent = true;
      this.grid.material.opacity = 0.15;
    }
    this.scene.add(this.grid);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.updateGroupPlacement();
  }

  updateGroupPlacement() {
    const isMobile = window.innerWidth < 768;
    // (Master coordinates are handled dynamically in animate() to follow cursor)
    
    const scaleVal = isMobile ? 0.78 : 1.35;
    this.groupHome.scale.setScalar(scaleVal * 1.05);
    this.groupAbout.scale.setScalar(scaleVal * 1.05);
    this.groupSkills.scale.setScalar(scaleVal * 1.05);
    this.groupProjects.scale.setScalar(scaleVal * 0.95);
    this.groupCertifications.scale.setScalar(scaleVal * 1.05);
    this.groupContact.scale.setScalar(scaleVal * 1.05);
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    this.scrollProgress = window.scrollY / maxScroll;
    this.updateModelCrossfading();
  }

  updateModelCrossfading() {
    const scroll = this.scrollProgress;
    
    let opacityHome = 0;
    let opacityAbout = 0;
    let opacitySkills = 0;
    let opacityProjects = 0;
    let opacityCerts = 0;
    let opacityContact = 0;
    
    let targetCamPos = new THREE.Vector3(0, 5, 45);

    // Dynamic 6-stage crossfade transitions
    if (scroll < 0.16) {
      // 1. Home -> About
      const t = scroll / 0.16;
      opacityHome = 1 - t;
      opacityAbout = t;
      targetCamPos.set(0, 3, 40);
    } else if (scroll < 0.32) {
      // 2. About -> Skills
      const t = (scroll - 0.16) / 0.16;
      opacityAbout = 1 - t;
      opacitySkills = t;
      targetCamPos.set(-8, 8, 38);
    } else if (scroll < 0.48) {
      // 3. Skills -> Projects
      const t = (scroll - 0.32) / 0.16;
      opacitySkills = 1 - t;
      opacityProjects = t;
      targetCamPos.set(8, -4, 40);
    } else if (scroll < 0.65) {
      // 4. Projects -> Credentials
      const t = (scroll - 0.48) / 0.17;
      opacityProjects = 1 - t;
      opacityCerts = t;
      targetCamPos.set(-10, 6, 38);
    } else if (scroll < 0.82) {
      // 5. Credentials -> Contact
      const t = (scroll - 0.65) / 0.17;
      opacityCerts = 1 - t;
      opacityContact = t;
      targetCamPos.set(0, -6, 42);
    } else {
      // 6. Contact Section Max reached
      opacityContact = 1;
      targetCamPos.set(10, 2, 40);
    }

    this.setGroupOpacity(this.groupHome, opacityHome);
    this.setGroupOpacity(this.groupAbout, opacityAbout);
    this.setGroupOpacity(this.groupSkills, opacitySkills);
    this.setGroupOpacity(this.groupProjects, opacityProjects);
    this.setGroupOpacity(this.groupCertifications, opacityCerts);
    this.setGroupOpacity(this.groupContact, opacityContact);

    gsap.to(this.camera.position, {
      x: targetCamPos.x,
      y: targetCamPos.y,
      z: targetCamPos.z,
      duration: 1.8,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  setGroupOpacity(group, opacity) {
    group.traverse(child => {
      if (child.isMesh) {
        child.material.opacity = opacity;
        child.visible = (opacity > 0.01);
      }
    });
  }

  pulseSkillNode(nodeId) {
    gsap.to(this.camera.position, {
      x: this.camera.position.x + (Math.random() - 0.5) * 1.5,
      y: this.camera.position.y + (Math.random() - 0.5) * 1.5,
      duration: 0.15,
      yoyo: true,
      repeat: 1
    });

    let activeGroup = null;
    if (this.scrollProgress < 0.16) activeGroup = this.groupHome;
    else if (this.scrollProgress < 0.32) activeGroup = this.groupAbout;
    else if (this.scrollProgress < 0.48) activeGroup = this.groupSkills;
    else if (this.scrollProgress < 0.65) activeGroup = this.groupProjects;
    else if (this.scrollProgress < 0.82) activeGroup = this.groupCertifications;
    else activeGroup = this.groupContact;

    if (activeGroup) {
      gsap.to(activeGroup.rotation, {
        y: activeGroup.rotation.y + Math.PI / 4,
        x: activeGroup.rotation.x + Math.PI / 6,
        duration: 0.6,
        ease: 'back.out'
      });
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const time = Date.now() * 0.001;

    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

    const isMobile = window.innerWidth < 768;
    // Follow mouse position: ranges up to 25 units horizontally, 14 units vertically on desktop
    const targetPosX = isMobile ? (this.mouse.x * 2.2) : (this.mouse.x * 24);
    const targetPosY = isMobile ? (this.mouse.y * 1.5) : (this.mouse.y * 13);

    // Smooth lerp movement to follow the cursor everywhere on the screen
    this.neuralNetGroup.position.x += (targetPosX - this.neuralNetGroup.position.x) * 0.08;
    this.neuralNetGroup.position.y += (targetPosY - this.neuralNetGroup.position.y) * 0.08;

    this.camera.lookAt(0, 0, 0);

    if (this.grid) {
      this.grid.position.x = Math.sin(time * 0.15) * 2;
    }

    // Rotations for 6 active models
    if (this.groupHome && this.groupHome.visible) {
      this.groupHome.rotation.y = time * 0.25 + (this.mouse.x * 0.15);
      this.groupHome.rotation.x = time * 0.1 + (this.mouse.y * 0.1);
    }
    if (this.groupAbout && this.groupAbout.visible) {
      this.groupAbout.rotation.y = this.mouse.x * 0.2;
      this.groupAbout.rotation.x = this.mouse.y * 0.15;
      if (this.rings.length === 3) {
        this.rings[0].rotation.z += 0.005;
        this.rings[1].rotation.x -= 0.008;
        this.rings[2].rotation.y += 0.012;
      }
    }
    if (this.groupSkills && this.groupSkills.visible) {
      this.groupSkills.rotation.y = time * 0.15 + (this.mouse.x * 0.15);
      this.groupSkills.rotation.x = time * 0.15 + (this.mouse.y * 0.15);
    }
    if (this.groupProjects && this.groupProjects.visible) {
      this.groupProjects.rotation.y = this.mouse.x * 0.15;
      this.groupProjects.rotation.x = this.mouse.y * 0.1;
      for (let i = 0; i < this.cubes.length; i++) {
        const c = this.cubes[i];
        c.mesh.rotation.y += c.speedY;
        c.mesh.rotation.x += c.speedX;
        c.mesh.position.y = c.initialY + Math.sin(time * 2.0 + c.bobOffset) * 0.8;
      }
    }
    if (this.groupCertifications && this.groupCertifications.visible) {
      this.groupCertifications.rotation.y = time * 0.2 + (this.mouse.x * 0.15);
      this.groupCertifications.rotation.x = this.mouse.y * 0.1;
    }
    if (this.groupContact && this.groupContact.visible) {
      this.groupContact.rotation.y = time * 0.25 + (this.mouse.x * 0.15);
      this.groupContact.rotation.x = time * 0.1 + (this.mouse.y * 0.1);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
