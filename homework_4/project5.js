// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
  // [TO-DO] Modify the code below to form the transformation matrix.
  var trans = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    translationX, translationY, translationZ, 1
  ];

  const cos_x = Math.cos(rotationX);
  const sin_x = Math.sin(rotationX);
  const cos_y = Math.cos(rotationY);
  const sin_y = Math.sin(rotationY);

  const rot_x = [
    1, 0, 0, 0,
    0, cos_x, sin_x, 0,
    0, -sin_x, cos_x, 0,
    0, 0, 0, 1
  ];
  const rot_y = [
    cos_y, 0, -sin_y, 0,
    0, 1, 0, 0,
    sin_y, 0, cos_y, 0,
    0, 0, 0, 1
  ];

  var mv = MatrixMult(trans, MatrixMult(rot_x, rot_y));
  return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
  // The constructor is a good place for taking care of the necessary initializations.
  constructor()
  {
    // [TO-DO] initializations
    // Initialize the shader program
    this.prog = InitShaderProgram(meshVS, meshFS);

    // Get the location of uniform variables from shaders
    this.mvp   = gl.getUniformLocation(this.prog, 'mvp');
    this.mv    = gl.getUniformLocation(this.prog, 'mv');
    this.mNrm  = gl.getUniformLocation(this.prog, 'mNrm');
    this.swap = I;

    // Setup vertex attributes and buffers
    this.vertPos = gl.getAttribLocation(this.prog, 'vrt');
    this.vertBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(this.vertPos);

    this.texCoord = gl.getAttribLocation(this.prog, 'txc');
    this.texBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(this.texCoord);

    this.normals = gl.getAttribLocation(this.prog, 'nrm');
    this.nrmBuffer = gl.createBuffer();
    gl.enableVertexAttribArray(this.normals);

    // Initialize texture
    this.texture = gl.createTexture();
    this.sampler = gl.getUniformLocation(this.prog, 'tex');
    this.showTex = gl.getUniformLocation(this.prog, 'showTex');
    
    // Lighting parameters
    this.lightDir = gl.getUniformLocation(this.prog, 'lightDir');
    this.shininess = gl.getUniformLocation(this.prog, 'shininess');
  }
  
  // This method is called every time the user opens an OBJ file.
  // The arguments of this function is an array of 3D vertex positions,
  // an array of 2D texture coordinates, and an array of vertex normals.
  // Every item in these arrays is a floating point value, representing one
  // coordinate of the vertex position or texture coordinate.
  // Every three consecutive elements in the vertPos array forms one vertex
  // position and every three consecutive vertex positions form a triangle.
  // Similarly, every two consecutive elements in the texCoords array
  // form the texture coordinate of a vertex and every three consecutive 
  // elements in the normals array form a vertex normal.
  // Note that this method can be called multiple times.
  setMesh( vertPos, texCoords, normals )
  {
    // [TO-DO] Update the contents of the vertex buffer objects.
    this.numTriangles = vertPos.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  }
  
  // This method is called when the user changes the state of the
  // "Swap Y-Z Axes" checkbox. 
  // The argument is a boolean that indicates if the checkbox is checked.
  swapYZ( swap )
  {
    // [TO-DO] Set the uniform parameter(s) of the vertex shader
    // Swap axes y-z
    const trans = [ 
      1, 0, 0, 0,
      0, 0, 1, 0,
      0, 1, 0, 0,
      0, 0, 0, 1,
    ];
    this.swap = swap ? trans : I;
  }
  
  // This method is called to draw the triangular mesh.
  // The arguments are the model-view-projection transformation matrixMVP,
  // the model-view transformation matrixMV, the same matrix returned
  // by the GetModelViewProjection function above, and the normal
  // transformation matrix, which is the inverse-transpose of matrixMV.
  draw( matrixMVP, matrixMV, matrixNormal )
  {
    // [TO-DO] Complete the WebGL initializations before drawing
    gl.useProgram(this.prog);
    gl.uniformMatrix4fv(this.mvp, false, MatrixMult(matrixMVP, this.swap));

    // Apply same transformation to model-view matrix
    var mv = MatrixMult(matrixMVP, this.swap)
    gl.uniformMatrix4fv(this.mv, false, mv);

    // Set the normal matrix
    gl.uniformMatrix3fv(this.mNrm, false, [ mv[0],mv[1],mv[2], mv[4],mv[5],mv[6], mv[8],mv[9],mv[10] ]);
    
    //Vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
    gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
    // Texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.vertexAttribPointer(this.texCoord, 2, gl.FLOAT, false, 0, 0);
    // Vertex normals
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nrmBuffer);
    gl.vertexAttribPointer(this.normals, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
  }
  
  // This method is called to set the texture of the mesh.
  // The argument is an HTML IMG element containing the texture data.
  setTexture( img )
  {
    // [TO-DO] Bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    // You can set the texture image data using the following command.
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
    gl.generateMipmap(gl.TEXTURE_2D);

    // Set texture filtering and wrapping options
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    // [TO-DO] Now that we have a texture, it might be a good idea to set
    // some uniform parameter(s) of the fragment shader, so that it uses the texture.
    gl.useProgram(this.prog);
    gl.uniform1i(this.sampler, 0);
    gl.uniform1i(this.showTex, 1);
  }
  
  // This method is called when the user changes the state of the
  // "Show Texture" checkbox. 
  // The argument is a boolean that indicates if the checkbox is checked.
  showTexture( show )
  {
    // [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
    gl.useProgram(this.prog);
    gl.uniform1i(this.showTex, show);
  }
  
  // This method is called to set the incoming light direction
  setLightDir( x, y, z )
  {
    // [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
    gl.useProgram(this.prog);
    gl.uniform3f(this.lightDir, ...arguments);
  }
  
  // This method is called to set the shininess of the material
  setShininess( shininess )
  {
    // [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
    gl.useProgram(this.prog);
    gl.uniform1f(this.shininess, shininess);
  }
}
const I = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
]

// Vertex Shader
const meshVS = `
  attribute vec3 vrt;
  attribute vec2 txc;
  attribute vec3 nrm;

  uniform mat4 mvp;
  uniform mat4 mv;
  uniform mat3 mNrm;

  varying vec3 normal;
  varying vec3 h_v;

  varying vec2 texCoord;

  uniform vec3 lightDir;
  uniform float shininess;

  void main() {
    gl_Position = mvp * vec4(vrt, 1);

    texCoord = txc;
    normal = mNrm * nrm;

    // half-way vector can be computed in vertex since it does not use the normal !!!
    vec4 vertCoord = mv * vec4(vrt, 1);
    h_v = normalize(lightDir - vertCoord.xyz);
  }
`
const meshFS = `
  precision highp float;

  varying vec3 normal;
  varying vec3 h_v;

  uniform bool showTex;
  uniform sampler2D tex;
  varying vec2 texCoord;

  uniform vec3 lightDir;
  uniform float shininess;

  void main() {
    vec3 n = normalize(normal);
    vec3 l = lightDir;

    vec3 shade = 0.05*vec3(0, 1, 0);
    float geo_term = dot(n, l);
    if (geo_term > 0.) {
      vec3 K_d = showTex ? texture2D(tex, texCoord).xyz : vec3(1, 1, 1);
      shade += geo_term*K_d + vec3(0.1)*pow(dot(h_v, n), shininess);
    }

    gl_FragColor = vec4(shade, 1);
  }
`