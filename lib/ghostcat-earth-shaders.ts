// Adapted from GhostCatcg/3d-earth (MIT, Copyright 2022 GhostCat).
// License: public/vendor/ghostcat-earth/LICENSE. Radius rescaled from 50 to 2.
export const techEarthVertex = `
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vp; varying vec3 vPositionNormal;
  void main(){
    vUv=uv;vNormal=normalize(normalMatrix*normal);vp=position*25.0;
    vPositionNormal=normalize((modelViewMatrix*vec4(position,1.0)).xyz);
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
  }
`
export const techEarthFragment = `
  uniform vec3 glowColor;uniform float bias;uniform float power;uniform float time;
  uniform float scale;uniform sampler2D map;
  varying vec2 vUv;varying vec3 vp;varying vec3 vNormal;varying vec3 vPositionNormal;
  void main(){
    // The upstream shader reads gl_FragColor before setting it; initialize explicitly.
    vec4 base=vec4(0.,0.,0.,1.);
    float rim=pow(max(0.,bias+scale*abs(dot(normalize(vNormal),normalize(vPositionNormal)))),power);
    if(vp.y>time && vp.y<time+20.){
      float t=smoothstep(0.,.8,(1.-abs(.5-(vp.y-time)/20.))/3.);
      base=mix(base,vec4(glowColor,1.),t*t);
    }
    base=mix(base,vec4(glowColor,1.),rim);
    vec3 surface=texture2D(map,vUv).rgb;
    float detail=max(surface.r,max(surface.g,surface.b));
    // Preserve the original map brightness and opaque surface; replace only its hue.
    vec3 greenSurface=glowColor*detail;
    gl_FragColor=vec4(base.rgb+greenSurface,1.);
  }
`
export const atmosphereVertex = `
  varying vec3 vVertexNormal;varying vec3 vVertexWorldPosition;
  void main(){
    vVertexNormal=normalize(normalMatrix*normal);
    vVertexWorldPosition=(modelMatrix*vec4(position,1.)).xyz;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
  }
`
export const atmosphereFragment = `
  varying vec3 vVertexNormal;varying vec3 vVertexWorldPosition;
  void main(){
    vec3 worldCameraToVertex=vVertexWorldPosition-cameraPosition;
    vec3 viewCameraToVertex=normalize((viewMatrix*vec4(worldCameraToVertex,0.)).xyz);
    float intensity=pow(max(0.,1.+dot(normalize(vVertexNormal),viewCameraToVertex)),3.);
    gl_FragColor=vec4(.463,1.,.463,intensity*.45);
  }
`
