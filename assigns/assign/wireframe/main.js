window.requestAnimationFrame = (function () {
   return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function (callback) {
             window.setTimeout(callback, 1000 / 60);
         };
     })();

var canvas;
var device;
var meshes = [];
var mera;

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.getElementById("frontBuffer");
    mera = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas);
    mera.Position = new BABYLON.Vector3(0, 0, 10);
    mera.Target = new BABYLON.Vector3(0, 0, 0);
    device.LoadJSONFileAsync("../cube.babylon", loadJSONCompleted);
}

function loadJSONCompleted(meshesLoaded) {
    meshes = meshesLoaded;
    // Calling the HTML5 rendering loop
    //increaseSubdivision2();
    requestAnimationFrame(drawingLoop);
}

// Rendering loop handler
function drawingLoop() {
    device.clear();

    for (var i = 0; i < meshes.length; i++) {
        // rotating slightly the mesh during each frame rendered
        //meshes[i].Rotation.x += 0.01;
        meshes[i].Rotation.y += 0.01;
    }

    // Doing the various matrix operations
    device.render(mera, meshes);
    // Flushing the back buffer into the front buffer
    device.present();

    // Calling the HTML5 rendering loop recursively
    requestAnimationFrame(drawingLoop);
}

function getSurroundingVertices(currentFacePointIndex)
{
    var connectingVertices = [];
    connectingVertices.push(meshes[0].Vertices[currentFacePointIndex]);
    
    for(var i in meshes[0].Faces)
    {
        if(meshes[0].Faces[i].A === currentFacePointIndex)
        {   
            if(!existsIn(meshes[0].Vertices[meshes[0].Faces[i].A], connectingVertices));
            {
                connectingVertices.push(meshes[0].Vertices[meshes[0].Faces[i].B]);
                connectingVertices.push(meshes[0].Vertices[meshes[0].Faces[i].C]);
            }
        }
        if(meshes[0].Faces[i].B === currentFacePointIndex)
        {   
            if(!existsIn(meshes[0].Vertices[meshes[0].Faces[i].B], connectingVertices));
            {
                connectingVertices.push(meshes[0].Vertices[meshes[0].Faces[i].A]);
                connectingVertices.push(meshes[0].Vertices[meshes[0].Faces[i].C]);
            }
        }
        else if(meshes[0].Faces[i].C === currentFacePointIndex)
        {   
            if(!existsIn(meshes[0].Vertices[meshes[0].Faces[i].C], connectingVertices));
            {
                connectingVertices.push(meshes[0].Vertices[meshes[0].Faces[i].A]);
                connectingVertices.push(meshes[0].Vertices[meshes[0].Faces[i].B]);
            }
        }
    }
    connectingVertices.shift();
    return connectingVertices;
}

function getOpposite()
{

}


function existsIn(item, arr)
{
    var exists = arr.some(function(element)
                          {
                              return element === item;
                          });
    return exists;
}
function getWeightX(verts)
{
    var total = 0.0;
    var factor = 3/(8*verts.length);
    for(var i in verts)
    {
        total += verts[i].Coordinates.x * factor;
    }
    return total;
}
function getWeightY(verts)
{
    var total = 0.0;
    var factor = 3/(8*verts.length);
    for(var i in verts)
    {
        total += verts[i].Coordinates.y * factor;
    }
    return total;
}
function getWeightZ(verts)
{
    var total = 0.0;
    var factor = 3/(8*verts.length);
    for(var i in verts)
    {
        total += verts[i].Coordinates.z * factor;
    }
    return total;
}
function increaseSubdivision2()
{   
    for(var faceIndex in meshes[0].Faces)
    {
        var faceA = meshes[0].Vertices[meshes[0].Faces[faceIndex].A];
        var faceB = meshes[0].Vertices[meshes[0].Faces[faceIndex].B];
        var faceC = meshes[0].Vertices[meshes[0].Faces[faceIndex].C];

        // A
        var connectingVertices = getSurroundingVertices(meshes[0].Faces[faceIndex].A);
        var k = connectingVertices.length;
        //var B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        var B = 3/(8 * k);
        var theNewPointX = getWeightX(connectingVertices);
        var theNewPointY = getWeightY(connectingVertices);
        var theNewPointZ = getWeightZ(connectingVertices);
        meshes[0].Vertices[meshes[0].Faces[faceIndex].A].Coordinates.x = (1-k*B) * faceA.Coordinates.x  + theNewPointX;
        meshes[0].Vertices[meshes[0].Faces[faceIndex].A].Coordinates.y = (1-k*B) * faceA.Coordinates.y  + theNewPointY;
        meshes[0].Vertices[meshes[0].Faces[faceIndex].A].Coordinates.z = (1-k*B) * faceA.Coordinates.z  + theNewPointZ;
        // B
        connectingVertices = getSurroundingVertices(meshes[0].Faces[faceIndex].B);
        k = connectingVertices.length;
        theNewPointX = getWeightX(connectingVertices);
        theNewPointY = getWeightY(connectingVertices);
        theNewPointZ = getWeightZ(connectingVertices);
        meshes[0].Vertices[meshes[0].Faces[faceIndex].B].Coordinates.x = (1-k*B) * faceB.Coordinates.x  + theNewPointX;
        meshes[0].Vertices[meshes[0].Faces[faceIndex].B].Coordinates.y = (1-k*B) * faceB.Coordinates.y  + theNewPointY;
        meshes[0].Vertices[meshes[0].Faces[faceIndex].B].Coordinates.z = (1-k*B) * faceB.Coordinates.z  + theNewPointZ;
        // C
        connectingVertices = getSurroundingVertices(meshes[0].Faces[faceIndex].C);
        k = connectingVertices.length;
        theNewPointX = getWeightX(connectingVertices);
        theNewPointY = getWeightY(connectingVertices);
        theNewPointZ = getWeightZ(connectingVertices);
        meshes[0].Vertices[meshes[0].Faces[faceIndex].C].Coordinates.x = (1-k*B) * faceC.Coordinates.x  + theNewPointX;
        meshes[0].Vertices[meshes[0].Faces[faceIndex].C].Coordinates.y = (1-k*B) * faceC.Coordinates.y  + theNewPointY;
        meshes[0].Vertices[meshes[0].Faces[faceIndex].C].Coordinates.z = (1-k*B) * faceC.Coordinates.z  + theNewPointZ;
        
        // var connectingFaces = [];
        // for(var i in meshes[0].Faces)
        // {
        //     if(meshes[0].Faces[i].A === meshes[0].Faces[faceIndex].C ||
        //        meshes[0].Faces[i].B === meshes[0].Faces[faceIndex].C || 
        //        meshes[0].Faces[i].C === meshes[0].Faces[faceIndex].C)
        //     {
        //         connectingFaces.push(meshes[0].Faces[i]);
        //     }
        // }
        // k = connectingFaces.length;
        // //var B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        // B = (3/8) * k;
        // theNewPointX = 0.0;
        // theNewPointY = 0.0;
        // theNewPointZ = 0.0;
        
        // meshes[0].Vertices[meshes[0].Faces[faceIndex].C].Coordinates = new BABYLON.Vector3(
        //     (1-k*B)*faceC.Coordinates.x + theNewPointX, 
        //     (1-k*B)*faceC.Coordinates.y + theNewPointY, 
        //     (1-k*B)*faceC.Coordinates.z + theNewPointZ);


        // // faceA = meshes[0].Vertices[meshes[0].Faces[faceIndex].A];
        // // faceB = meshes[0].Vertices[meshes[0].Faces[faceIndex].B];
        // // faceC = meshes[0].Vertices[meshes[0].Faces[faceIndex].C];
        // // A-B
        // var abOpp;
        // for(var i in meshes[0].Faces)
        // {
        //     if((meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceB || 
        //        meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceB ||
        //        meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceB) ||
               
        //        (meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceB ||
        //        meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceB ||
        //        meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceB))
        //     {
        //         abOpp = meshes[0].Faces[i];
        //     }
        // }
        // var oppPoint1;
        // if((meshes[0].Vertices[abOpp.A] === faceA && meshes[0].Vertices[abOpp.B] === faceB) ||
        //    (meshes[0].Vertices[abOpp.B] === faceA && meshes[0].Vertices[abOpp.A] === faceB))
        // {
        //     oppPoint1 = meshes[0].Vertices[abOpp.C];
        // }
        // if((meshes[0].Vertices[abOpp.A] === faceA && meshes[0].Vertices[abOpp.C] === faceB) ||
        //    (meshes[0].Vertices[abOpp.C] === faceA && meshes[0].Vertices[abOpp.A] === faceB))
        // {
        //      oppPoint1 = meshes[0].Vertices[abOpp.B];
        // }
        // if((meshes[0].Vertices[abOpp.B] === faceA && meshes[0].Vertices[abOpp.C] === faceB) ||
        //    (meshes[0].Vertices[abOpp.C] === faceA && meshes[0].Vertices[abOpp.A] === faceB))
        // {
        //      oppPoint1 = meshes[0].Vertices[abOpp.A];
        // }
        
        // var newVert1 = new BABYLON.Vector3(
        //     (faceA.Coordinates.x*(3.0/8.0) + faceB.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(1.0/8.0) + oppPoint1.Coordinates.x*(1.0/8.0)),
        //     (faceA.Coordinates.y*(3.0/8.0) + faceB.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(1.0/8.0) + oppPoint1.Coordinates.y*(1.0/8.0)),
        //     (faceA.Coordinates.z*(3.0/8.0) + faceB.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(1.0/8.0) + oppPoint1.Coordinates.z*(1.0/8.0)));
        // var newNormal1 = new BABYLON.Vector3(
        //     (faceA.Normal.x + faceB.Normal.x)/2,
        //     (faceA.Normal.y + faceB.Normal.y)/2,
        //     (faceA.Normal.z + faceB.Normal.z)/2);

        // // A-C
        // var acOpp;
        // for(var i in meshes[0].Faces)
        // {
        //     if((meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC || 
        //        meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC ||
        //        meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC) ||
               
        //        (meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
        //        meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
        //        meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC))
        //     {
        //         acOpp = meshes[0].Faces[i];
        //     }
        // }

        // var oppPoint2;
        // if((meshes[0].Vertices[acOpp.A] === faceA && meshes[0].Vertices[acOpp.B] === faceC) ||
        //    (meshes[0].Vertices[acOpp.B] === faceA && meshes[0].Vertices[acOpp.A] === faceC))
        // {
        //     oppPoint2 = meshes[0].Vertices[acOpp.C];
        // }
        // if((meshes[0].Vertices[acOpp.A] === faceA && meshes[0].Vertices[acOpp.C] === faceC) ||
        //    (meshes[0].Vertices[acOpp.C] === faceA && meshes[0].Vertices[acOpp.A] === faceC))
        // {
        //      oppPoint2 = meshes[0].Vertices[acOpp.B];
        // }
        // if((meshes[0].Vertices[acOpp.B] === faceA && meshes[0].Vertices[acOpp.C] === faceC) ||
        //    (meshes[0].Vertices[acOpp.C] === faceA && meshes[0].Vertices[acOpp.A] === faceC))
        // {
        //      oppPoint2 = meshes[0].Vertices[acOpp.A];
        // }
        // var newVert2 = new BABYLON.Vector3(
        //     (faceA.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(3.0/8.0) + faceB.Coordinates.x*(1.0/8.0) + oppPoint2.Coordinates.x*(1.0/8.0)),
        //     (faceA.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(3.0/8.0) + faceB.Coordinates.y*(1.0/8.0) + oppPoint2.Coordinates.y*(1.0/8.0)),
        //     (faceA.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(3.0/8.0) + faceB.Coordinates.z*(1.0/8.0) + oppPoint2.Coordinates.z*(1.0/8.0)));
        // var newNormal2 = new BABYLON.Vector3(
        //     (faceA.Normal.x + faceC.Normal.x)/2,
        //     (faceA.Normal.y + faceC.Normal.y)/2,
        //     (faceA.Normal.z + faceC.Normal.z)/2);

        //  // B-C
        // var bcOpp;
        // for(var i in meshes[0].Faces)
        // {
        //     if((meshes[0].Vertices[meshes[0].Faces[i].A] === faceB && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC || 
        //        meshes[0].Vertices[meshes[0].Faces[i].A] === faceB && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC ||
        //        meshes[0].Vertices[meshes[0].Faces[i].B] === faceB && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC) ||
               
        //        (meshes[0].Vertices[meshes[0].Faces[i].B] === faceB && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
        //        meshes[0].Vertices[meshes[0].Faces[i].C] === faceB && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
        //        meshes[0].Vertices[meshes[0].Faces[i].C] === faceB && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC))
        //     {
        //         bcOpp = meshes[0].Faces[i];
        //     }
        // }

        // var oppPoint3;
        // if((meshes[0].Vertices[bcOpp.A] === faceB && meshes[0].Vertices[bcOpp.B] === faceC) ||
        //    (meshes[0].Vertices[bcOpp.B] === faceB && meshes[0].Vertices[bcOpp.A] === faceC))
        // {
        //     oppPoint3 = meshes[0].Vertices[bcOpp.C];
        // }
        // if((meshes[0].Vertices[bcOpp.A] === faceB && meshes[0].Vertices[bcOpp.C] === faceC) ||
        //    (meshes[0].Vertices[bcOpp.C] === faceB && meshes[0].Vertices[bcOpp.A] === faceC))
        // {
        //      oppPoint3 = meshes[0].Vertices[bcOpp.B];
        // }
        // if((meshes[0].Vertices[bcOpp.B] === faceB && meshes[0].Vertices[bcOpp.C] === faceC) ||
        //    (meshes[0].Vertices[bcOpp.C] === faceB && meshes[0].Vertices[bcOpp.B] === faceC))
        // {
        //      oppPoint3 = meshes[0].Vertices[bcOpp.A];
        // }
        // var newVert3 = new BABYLON.Vector3(
        //     (faceB.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(3.0/8.0) + faceA.Coordinates.x*(1.0/8.0) + oppPoint3.Coordinates.x*(1.0/8.0)),
        //     (faceB.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(3.0/8.0) + faceA.Coordinates.y*(1.0/8.0) + oppPoint3.Coordinates.y*(1.0/8.0)),
        //     (faceB.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(3.0/8.0) + faceA.Coordinates.z*(1.0/8.0) + oppPoint3.Coordinates.z*(1.0/8.0)));
        // var newNormal3 = new BABYLON.Vector3(
        //     (faceB.Normal.x + faceC.Normal.x)/2,
        //     (faceB.Normal.y + faceC.Normal.y)/2,
        //     (faceB.Normal.z + faceC.Normal.z)/2);

        // meshes[0].Vertices.push({
        //     Coordinates: newVert1,
        //     Normal: newNormal1,
        //     WorldCoordinates: null
        // });
        // var newVert1Index = meshes[0].Vertices.length - 1;
        // meshes[0].Vertices.push({
        //     Coordinates: newVert2,
        //     Normal: newNormal2,
        //     WorldCoordinates: null
        // });
        // var newVert2Index = meshes[0].Vertices.length - 1;
        // meshes[0].Vertices.push({
        //     Coordinates: newVert3,
        //     Normal: newNormal3,
        //     WorldCoordinates: null
        // });
        // var newVert3Index = meshes[0].Vertices.length - 1;


        // // NEW FACES
        // meshes[0].Faces.push({
        //     A: newVert1Index,
        //     B: newVert2Index,
        //     C: newVert3Index
        // });
        // meshes[0].Faces.push({
        //     A: meshes[0].Faces[faceIndex].A,
        //     B: newVert1Index,
        //     C: newVert3Index
        // });
        // meshes[0].Faces.push({
        //     A: newVert3Index,
        //     B: newVert2Index,
        //     C: meshes[0].Faces[faceIndex].C
        // });
        // meshes[0].Faces.push({
        //     A: newVert1Index,
        //     B: meshes[0].Faces[faceIndex].B,
        //     C: newVert2Index
        // });
    }
}

