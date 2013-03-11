attribute vec3 position;
attribute vec3 normal;
attribute vec2 texCoord1;
attribute vec2 texCoord2;
attribute vec2 texCoord3;
attribute vec4 color;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldInverseTransposeMatrix;

uniform bool drawShadow;

varying vec2 vTexCoord1;
varying vec2 vTexCoord2;
varying vec2 vTexCoord3;
varying vec4 vTransformedNormal;
varying vec4 vPosition;
varying vec4 vColor;


attribute vec3 ps_Vertex;
attribute vec4 ps_Color;

varying vec4 frontColor;

uniform float ps_PointSize;
uniform vec3 ps_Attenuation;

uniform vec3 lightPos;
uniform vec3 objCenter;

void drawShadowF(in vec3 l, in vec4 v){

  // Calculate rise / run
  float slopeX = (l.y-v.y)/(l.x-v.x);
  float slopeZ = (l.y-v.y)/(l.z-v.z);

  // We need to flatten by making all the y components the same.
  v.y = 0.0;
  v.x = l.x - (l.y / slopeX);
  v.z = l.z - (l.y / slopeZ);

  //gl_Position = ps_ProjectionMatrix * ps_ModelViewMatrix * v;
  gl_Position = projectionMatrix * v;
  vColor = vec4(0.0, 0.0, 0.0, 1.0);
}

void main(void) {
  vPosition = worldMatrix * vec4(position, 1.0);
  vTransformedNormal = worldInverseTransposeMatrix * vec4(normal, 1.0);

  vec3 vert = normal;

  vTexCoord1 = texCoord1;
  vTexCoord2 = texCoord2;
  vTexCoord3 = texCoord3;
  vColor = color;
  gl_Position = projectionMatrix * vPosition;

/*float dist = length( position );
  float attn = ps_Attenuation[0] +
              (ps_Attenuation[1] * dist) +
              (ps_Attenuation[2] * dist * dist);

  if(attn <= 0.0){ attn = 1.0;}

  gl_PointSize = ps_PointSize * sqrt(1.0/attn);

  if(drawShadow){
    drawShadowF(lightPos, vert);
  } else{
    //frontColor = ps_Color;
    vColor = color;
    gl_Position = projectionMatrix * vPosition;
    //gl_Position = projectionMatrix * ps_ModelViewMatrix * vPosition;
  }*/
}



