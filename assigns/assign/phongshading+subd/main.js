// shim layer with setTimeout fallback
window.requestAnimationFrame = (function () {
   return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         function (callback) {
             window.setTimeout(callback, 1000 / 60);
         };
     })();

var canvas;
var divCurrentFPS;
var divAverageFPS;
var device;
var meshes = [];
var mera;
var previousDate = Date.now();
var lastFPSValues = new Array(60);

document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.getElementById("frontBuffer");
    divCurrentFPS = document.getElementById("currentFPS");
    divAverageFPS = document.getElementById("averageFPS");
    mera = new SoftEngine.Camera();
    device = new SoftEngine.Device(canvas);

    mera.Position = new BABYLON.Vector3(0, 0, 10);
    mera.Target = new BABYLON.Vector3(0, 0, 0);

    device.LoadJSONFileAsync("../cube.babylon", loadJSONCompleted);
}

function getSurroundingVertices(currentFacePointIndex)
{
    var connectingFaces = new Array(0);
    connectingFaces.push(currentFacePointIndex);
    
    for(var i = 0; i < meshes[0].Faces.length; i++)
    {
        if(meshes[0].Faces[i].A === currentFacePointIndex)
        {   
            if(connectingFaces.indexOf(meshes[0].Faces[i].B) == -1)
            {
                connectingFaces.push(meshes[0].Faces[i].B);
            }
            if(connectingFaces.indexOf(meshes[0].Faces[i].C) == -1)
            {
                connectingFaces.push(meshes[0].Faces[i].C);
            }
        }
        if(meshes[0].Faces[i].B === currentFacePointIndex)
        {   
            if(connectingFaces.indexOf(meshes[0].Faces[i].A) == -1)
            {
                connectingFaces.push(meshes[0].Faces[i].A);
            }
            if(connectingFaces.indexOf(meshes[0].Faces[i].C) == -1)
            {
                connectingFaces.push(meshes[0].Faces[i].C);
            }
        }
        if(meshes[0].Faces[i].C === currentFacePointIndex)
        {   
            if(connectingFaces.indexOf(meshes[0].Faces[i].A) == -1)
            {
                connectingFaces.push(meshes[0].Faces[i].A);
            }
            if(connectingFaces.indexOf(meshes[0].Faces[i].B) == -1)
            {
                connectingFaces.push(meshes[0].Faces[i].B);
            }
        }
    }
    connectingFaces.shift();
    var connectingVertices = new Array(0);
    for(var i = 0; i < connectingFaces.length; i++)
    {
        connectingVertices.push(meshes[0].Vertices[connectingFaces[i]]);
    }
    return connectingVertices;
}

function getOpposite(edgeA, edgeB, notThisPoint)
{
    var possibleFace;
    for(var i in meshes[0].Faces)
    {
        if(meshes[0].Faces[i].A === edgeA ||
           meshes[0].Faces[i].B === edgeA ||
           meshes[0].Faces[i].C === edgeA)
        {
            possibleFace = meshes[0].Faces[i];
            if(possibleFace.A === edgeB ||
               possibleFace.B === edgeB ||
               possibleFace.C === edgeB)
            {
                if(possibleFace.A !== edgeA && possibleFace.A !== edgeB && possibleFace.A !== notThisPoint)
                {
                    return possibleFace.A;
                }
                if(possibleFace.B !== edgeA && possibleFace.B !== edgeB && possibleFace.B !== notThisPoint)
                {
                    return possibleFace.B;
                }
                if(possibleFace.C !== edgeA && possibleFace.C !== edgeB && possibleFace.C !== notThisPoint)
                {
                    return possibleFace.C;
                }
            }
        }
    }
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

function loadJSONCompleted(meshesLoaded) {
    meshes = meshesLoaded;
    
    increaseSubdivision2();
    increaseSubdivision2();
    requestAnimationFrame(drawingLoop);
}

function increaseSubdivision2()
{   
    var tempVerticesArray = new Array(0);
    var tempFacesArray = new Array(0);
    for(var i = 0; i < meshes[0].Vertices.length; i++)
    {
        tempVerticesArray.push({
            Coordinates: new BABYLON.Vector3(meshes[0].Vertices[i].Coordinates.x, meshes[0].Vertices[i].Coordinates.y, meshes[0].Vertices[i].Coordinates.z),
            Normal: new BABYLON.Vector3(meshes[0].Vertices[i].Normal.x, meshes[0].Vertices[i].Normal.y, meshes[0].Vertices[i].Normal.z),
            WorldCoordinates: meshes[0].Vertices[i].WorldCoordinates});
    }
    for(var faceIndex in meshes[0].Faces)
    {
        var faceA = meshes[0].Vertices[meshes[0].Faces[faceIndex].A];
        var faceB = meshes[0].Vertices[meshes[0].Faces[faceIndex].B];
        var faceC = meshes[0].Vertices[meshes[0].Faces[faceIndex].C];
        var evenFaces = [meshes[0].Faces[faceIndex].A, meshes[0].Faces[faceIndex].B, meshes[0].Faces[faceIndex].C];

        // A
        var connectingVertices = getSurroundingVertices(meshes[0].Faces[faceIndex].A);
        var k = connectingVertices.length;
        // var B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        var B = 3/(8 * k);
        var theNewPointX = getWeightX(connectingVertices);
        var theNewPointY = getWeightY(connectingVertices);
        var theNewPointZ = getWeightZ(connectingVertices);
        tempVerticesArray[meshes[0].Faces[faceIndex].A].Coordinates.x = (1-k*B) * faceA.Coordinates.x + theNewPointX;
        tempVerticesArray[meshes[0].Faces[faceIndex].A].Coordinates.y = (1-k*B) * faceA.Coordinates.y + theNewPointY;
        tempVerticesArray[meshes[0].Faces[faceIndex].A].Coordinates.z = (1-k*B) * faceA.Coordinates.z + theNewPointZ;
        tempVerticesArray[meshes[0].Faces[faceIndex].A].Normal.x = (1-k*B) * faceA.Normal.x + theNewPointX;
        tempVerticesArray[meshes[0].Faces[faceIndex].A].Normal.y = (1-k*B) * faceA.Normal.y + theNewPointY;
        tempVerticesArray[meshes[0].Faces[faceIndex].A].Normal.z = (1-k*B) * faceA.Normal.z + theNewPointZ;
        // B
        connectingVertices = getSurroundingVertices(meshes[0].Faces[faceIndex].B);
        k = connectingVertices.length;
        // B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        B = 3/(8 * k);
        theNewPointX = getWeightX(connectingVertices);
        theNewPointY = getWeightY(connectingVertices);
        theNewPointZ = getWeightZ(connectingVertices);
        tempVerticesArray[meshes[0].Faces[faceIndex].B].Coordinates.x = (1-k*B) * faceB.Coordinates.x + theNewPointX;
        tempVerticesArray[meshes[0].Faces[faceIndex].B].Coordinates.y = (1-k*B) * faceB.Coordinates.y + theNewPointY;
        tempVerticesArray[meshes[0].Faces[faceIndex].B].Coordinates.z = (1-k*B) * faceB.Coordinates.z + theNewPointZ;
        tempVerticesArray[meshes[0].Faces[faceIndex].B].Normal.x = (1-k*B) * faceB.Normal.x + theNewPointX;
        tempVerticesArray[meshes[0].Faces[faceIndex].B].Normal.y = (1-k*B) * faceB.Normal.y + theNewPointY;
        tempVerticesArray[meshes[0].Faces[faceIndex].B].Normal.z = (1-k*B) * faceB.Normal.z + theNewPointZ;

        // C
        connectingVertices = getSurroundingVertices(meshes[0].Faces[faceIndex].C);
        k = connectingVertices.length;
        // B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        B = 3/(8 * k);
        theNewPointX = getWeightX(connectingVertices);
        theNewPointY = getWeightY(connectingVertices);
        theNewPointZ = getWeightZ(connectingVertices);
        tempVerticesArray[meshes[0].Faces[faceIndex].C].Coordinates.x = (1-k*B) * faceC.Coordinates.x + theNewPointX;
        tempVerticesArray[meshes[0].Faces[faceIndex].C].Coordinates.y = (1-k*B) * faceC.Coordinates.y + theNewPointY;
        tempVerticesArray[meshes[0].Faces[faceIndex].C].Coordinates.z = (1-k*B) * faceC.Coordinates.z + theNewPointZ;
        tempVerticesArray[meshes[0].Faces[faceIndex].C].Normal.x = (1-k*B) * faceC.Normal.x + theNewPointX;
        tempVerticesArray[meshes[0].Faces[faceIndex].C].Normal.y = (1-k*B) * faceC.Normal.y + theNewPointY;
        tempVerticesArray[meshes[0].Faces[faceIndex].C].Normal.z = (1-k*B) * faceC.Normal.z + theNewPointZ;
        
        // A-B
        var abOpp = getOpposite(meshes[0].Faces[faceIndex].A, meshes[0].Faces[faceIndex].B, meshes[0].Faces[faceIndex].C);
        if(abOpp != undefined)
        {
            var newVert1 = new BABYLON.Vector3(
                (faceA.Coordinates.x*(3.0/8.0) + faceB.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(1.0/8.0) + meshes[0].Vertices[abOpp].Coordinates.x*(1.0/8.0)),
                (faceA.Coordinates.y*(3.0/8.0) + faceB.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(1.0/8.0) + meshes[0].Vertices[abOpp].Coordinates.y*(1.0/8.0)),
                (faceA.Coordinates.z*(3.0/8.0) + faceB.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(1.0/8.0) + meshes[0].Vertices[abOpp].Coordinates.z*(1.0/8.0)));
            var newNormal1 = new BABYLON.Vector3(
                (faceA.Normal.x*(3.0/8.0) + faceB.Normal.x*(3.0/8.0) + faceC.Normal.x*(1.0/8.0) + meshes[0].Vertices[abOpp].Normal.x*(1.0/8.0)),
                (faceA.Normal.y*(3.0/8.0) + faceB.Normal.y*(3.0/8.0) + faceC.Normal.y*(1.0/8.0) + meshes[0].Vertices[abOpp].Normal.y*(1.0/8.0)),
                (faceA.Normal.z*(3.0/8.0) + faceB.Normal.z*(3.0/8.0) + faceC.Normal.z*(1.0/8.0) + meshes[0].Vertices[abOpp].Normal.z*(1.0/8.0)));
        }

        // B-C
        var bcOpp = getOpposite(meshes[0].Faces[faceIndex].B, meshes[0].Faces[faceIndex].C, meshes[0].Faces[faceIndex].A);
        if(bcOpp != undefined)
        {
            var newVert2 = new BABYLON.Vector3(
                (faceB.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(3.0/8.0) + faceA.Coordinates.x*(1.0/8.0) + meshes[0].Vertices[bcOpp].Coordinates.x*(1.0/8.0)),
                (faceB.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(3.0/8.0) + faceA.Coordinates.y*(1.0/8.0) + meshes[0].Vertices[bcOpp].Coordinates.y*(1.0/8.0)),
                (faceB.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(3.0/8.0) + faceA.Coordinates.z*(1.0/8.0) + meshes[0].Vertices[bcOpp].Coordinates.z*(1.0/8.0)));
            var newNormal2 = new BABYLON.Vector3(
                (faceB.Normal.x*(3.0/8.0) + faceC.Normal.x*(3.0/8.0) + faceA.Normal.x*(1.0/8.0) + meshes[0].Vertices[bcOpp].Normal.x*(1.0/8.0)),
                (faceB.Normal.y*(3.0/8.0) + faceC.Normal.y*(3.0/8.0) + faceA.Normal.y*(1.0/8.0) + meshes[0].Vertices[bcOpp].Normal.y*(1.0/8.0)),
                (faceB.Normal.z*(3.0/8.0) + faceC.Normal.z*(3.0/8.0) + faceA.Normal.z*(1.0/8.0) + meshes[0].Vertices[bcOpp].Normal.z*(1.0/8.0)));
        }
        
         // C-A
        var caOpp = getOpposite(meshes[0].Faces[faceIndex].C, meshes[0].Faces[faceIndex].A, meshes[0].Faces[faceIndex].B);
        if(caOpp != undefined)
        {
            var newVert3 = new BABYLON.Vector3(
                (faceC.Coordinates.x*(3.0/8.0) + faceA.Coordinates.x*(3.0/8.0) + faceB.Coordinates.x*(1.0/8.0) + meshes[0].Vertices[caOpp].Coordinates.x*(1.0/8.0)),
                (faceC.Coordinates.y*(3.0/8.0) + faceA.Coordinates.y*(3.0/8.0) + faceB.Coordinates.y*(1.0/8.0) + meshes[0].Vertices[caOpp].Coordinates.y*(1.0/8.0)),
                (faceC.Coordinates.z*(3.0/8.0) + faceA.Coordinates.z*(3.0/8.0) + faceB.Coordinates.z*(1.0/8.0) + meshes[0].Vertices[caOpp].Coordinates.z*(1.0/8.0)));
            var newNormal3 = new BABYLON.Vector3(
                (faceC.Normal.x*(3.0/8.0) + faceA.Normal.x*(3.0/8.0) + faceB.Normal.x*(1.0/8.0) + meshes[0].Vertices[caOpp].Normal.x*(1.0/8.0)),
                (faceC.Normal.y*(3.0/8.0) + faceA.Normal.y*(3.0/8.0) + faceB.Normal.y*(1.0/8.0) + meshes[0].Vertices[caOpp].Normal.y*(1.0/8.0)),
                (faceC.Normal.z*(3.0/8.0) + faceA.Normal.z*(3.0/8.0) + faceB.Normal.z*(1.0/8.0) + meshes[0].Vertices[caOpp].Normal.z*(1.0/8.0)));
        }
        

        if(newVert1 != undefined)
        {
            tempVerticesArray.push({
                Coordinates: newVert1,
                Normal: newNormal1,
                WorldCoordinates: null
            });
        }
        var newVert1Index = tempVerticesArray.length - 1;

        if(newVert2 != undefined)
        {
            tempVerticesArray.push({
                Coordinates: newVert2,
                Normal: newNormal2,
                WorldCoordinates: null
            });
        }
        var newVert2Index = tempVerticesArray.length - 1;

        if(newVert3 != undefined)
        {
            tempVerticesArray.push({
                Coordinates: newVert3,
                Normal: newNormal3,
                WorldCoordinates: null
            });
        }
        var newVert3Index = tempVerticesArray.length - 1;
        
        tempFacesArray.push({
            A: evenFaces[0],
            B: newVert1Index,
            C: newVert3Index
        });
        tempFacesArray.push({
            A: evenFaces[1],
            B: newVert2Index,
            C: newVert1Index
        });
        tempFacesArray.push({
            A: evenFaces[2],
            B: newVert3Index,
            C: newVert2Index
        });
        tempFacesArray.push({
            A: newVert1Index,
            B: newVert2Index,
            C: newVert3Index
        });
    }
    var count = 0;
    var temps = [];
    for(var i = 0; i < meshes[0].Vertices.length - 1; i++)
    {
        for(var j = i + 1; j < meshes[0].Vertices.length; j++)
        {
            if(meshes[0].Vertices[j].Coordinates.equals(meshes[0].Vertices[i].Coordinates))
            {
                if(temps.indexOf(j) == -1)
                {
                    temps.push(j);
                    for(var k = 0; k < tempFacesArray.length; k++)
                    {
                        if(tempFacesArray[k].A == j) tempFacesArray[k].A = i;
                        if(tempFacesArray[k].B == j) tempFacesArray[k].B = i;
                        if(tempFacesArray[k].C == j) tempFacesArray[k].C = i;
                    }
                }
            }
        }
    }

    meshes[0].Vertices = tempVerticesArray;
    meshes[0].Faces = tempFacesArray;
}

function equalVerts(vert1, vert2)
{
    var keys = Object.keys(vert1);
    for(var i = 0, iter = keys.length; i < iter; i++) 
    {
        if(vert1[keys[i]] != vert2[keys[i]]) 
        {
            return false;
        }
    }
    return true;
}

function drawingLoop() {
    var now = Date.now();
    var currentFPS = 1000 / (now - previousDate);
    previousDate = now;

    divCurrentFPS.textContent = currentFPS.toFixed(2);

    if (lastFPSValues.length < 60) {
        lastFPSValues.push(currentFPS);
    } else {
        lastFPSValues.shift();
        lastFPSValues.push(currentFPS);
        var totalValues = 0;
        for (var i = 0; i < lastFPSValues.length; i++) {
            totalValues += lastFPSValues[i];
        }

        var averageFPS = totalValues / lastFPSValues.length;
        divAverageFPS.textContent = averageFPS.toFixed(2);
    }

    device.clear();

    for (var i = 0; i < meshes.length; i++) {
        meshes[i].Rotation.y += 0.02;
    }

    device.render(mera, meshes);

    device.present();

    requestAnimationFrame(drawingLoop);
}
