// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	// Convert degrees → radians
	let rad = rotation * Math.PI / 180; 
    let cos = Math.cos(rad);
    let sin = Math.sin(rad);

    // Combined transformation matrix T * R * S

	// a,b,c,d represents the rotation and scale part
    let a = scale * cos;  // a = sx * cosθ
    let b = scale * sin; 	// b = sx * sinθ
    let c = -scale * sin; // c = -sy * cosθ
    let d = scale * cos;  // d = sy * cosθ

	// e,f represents the final translation part
    let e = positionX;
    let f = positionY;

    // Column-major format
    return [
        a,  b,  0,
        c,  d,  0,
        e, f, 1
    ];
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	let finalResult = new Array(9);

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            finalResult[col * 3 + row] =
                trans2[0 * 3 + row] * trans1[col * 3 + 0] +
                trans2[1 * 3 + row] * trans1[col * 3 + 1] +
                trans2[2 * 3 + row] * trans1[col * 3 + 2];
        }
    }

    return finalResult;
}
