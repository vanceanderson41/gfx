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

    device.LoadJSONFileAsync("../monkey.babylon", loadJSONCompleted);
    }

function loadJSONCompleted(meshesLoaded) {
    meshes = meshesLoaded;


    requestAnimationFrame(drawingLoop);
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
        meshes[i].Rotation.y += 0.01;
    }

    device.render(mera, meshes);

    device.present();

    requestAnimationFrame(drawingLoop);
}
function increaseSubdivision2()
{
    var edges = [];

    for(var faceIndex in meshes[0].Faces)
    {
        var faceA = meshes[0].Vertices[meshes[0].Faces[faceIndex].A];
        var faceB = meshes[0].Vertices[meshes[0].Faces[faceIndex].B];
        var faceC = meshes[0].Vertices[meshes[0].Faces[faceIndex].C];

        edges.push({
            A: faceA.Coordinates,
            B: faceB.Coordinates
        });
        edges.push({
            A: faceB.Coordinates,
            B: faceC.Coordinates
        });
        edges.push({
            A: faceA.Coordinates,
            B: faceC.Coordinates
        });

        edges.push({
            A: faceB.Coordinates,
            B: faceA.Coordinates
        });
        edges.push({
            A: faceC.Coordinates,
            B: faceB.Coordinates
        });
        edges.push({
            A: faceC.Coordinates,
            B: faceA.Coordinates
        });
    }
    for(var faceIndex in meshes[0].Faces)
    {
        var faceA = meshes[0].Vertices[meshes[0].Faces[faceIndex].A];
        var faceB = meshes[0].Vertices[meshes[0].Faces[faceIndex].B];
        var faceC = meshes[0].Vertices[meshes[0].Faces[faceIndex].C];

        /////////////////////
        var aEdges = [];
        for(var i in edges)
        {
            if(edges[i].A === faceA.Coordinates || edges[i].B === faceA.Coordinates)
            {
                aEdges.push(edges[i]);
            }
        }
        // console.log("aEdges " + aEdges);
        if(aEdges.length === 0)
        {
            aEdges.push({
                A: new BABYLON.Vector3(1, 1, 1),
                B: new BABYLON.Vector3(1, 1, 1)});
        }

        var k = aEdges.length;
        var B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        var theNewPointX = 0.0;
        var theNewPointY = 0.0;
        var theNewPointZ = 0.0;
        for(var i in aEdges)
        {
            if(aEdges[i].A === faceA.Coordinates)
            {
                //if(aEdges.length <=)
                theNewPointX += B*aEdges[i].B.x;
                theNewPointY += B*aEdges[i].B.y;
                theNewPointZ += B*aEdges[i].B.z;
            }
            else
            {
                theNewPointX += B*aEdges[i].A.x;
                theNewPointY += B*aEdges[i].A.y;
                theNewPointZ += B*aEdges[i].A.z;
            }
        }  
        // Next line breaks it
        meshes[0].Vertices[meshes[0].Faces[faceIndex].A].Coordinates = new BABYLON.Vector3((1-k*B)*faceA.Coordinates.x + theNewPointX, (1-k*B)*faceA.Coordinates.y + theNewPointY, (1-k*B)*faceA.Coordinates.z + theNewPointZ);
        ///////////////////////

        var bEdges = [];
        for(var i in edges)
        {
            if(edges[i].A === faceB.Coordinates || edges[i].B === faceB.Coordinates)
            {
                bEdges.push(edges[i]);
                // console.log(bEdges);
            }
        }
        // console.log("bEdges " + bEdges);
        if(bEdges.length === 0)
        {
            bEdges.push({
                A: new BABYLON.Vector3(1, 1, 1),
                B: new BABYLON.Vector3(1, 1, 1)});
        }

        k = bEdges.length;
        var B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        theNewPointX = 0.0;
        theNewPointY = 0.0;
        theNewPointZ = 0.0;
        for(var i in bEdges)
        {
            if(bEdges[i].A === faceB.Coordinates)
            {
                theNewPointX += B*bEdges[i].B.x;
                theNewPointY += B*bEdges[i].B.y;
                theNewPointZ += B*bEdges[i].B.z;
            }
            else
            {
                theNewPointX += B*bEdges[i].A.x;
                theNewPointY += B*bEdges[i].A.y;
                theNewPointZ += B*bEdges[i].A.z;
            }
        }  
        // Next line breaks it
        meshes[0].Vertices[meshes[0].Faces[faceIndex].B].Coordinates = new BABYLON.Vector3((1-k*B)*faceB.Coordinates.x + theNewPointX, (1-k*B)*faceB.Coordinates.y + theNewPointY, (1-k*B)*faceB.Coordinates.z + theNewPointZ);
        ///////////////////////

        var cEdges = [];
        for(var i in edges)
        {
            if(edges[i].A === faceC.Coordinates || edges[i].B === faceC.Coordinates)
            {
                cEdges.push(edges[i]);
                // console.log(cEdges);
            }
        }
        // console.log("cEdges " + cEdges);
        if(cEdges.length === 0)
        {
            cEdges.push({
                A: new BABYLON.Vector3(1, 1, 1),
                B: new BABYLON.Vector3(1, 1, 1)});
        }

        k = cEdges.length;
        var B = (1 / k) * (0.625 * (Math.pow((0.375 + (0.25 * Math.cos(Math.PI / k))), 2)));
        theNewPointX = 0.0;
        theNewPointY = 0.0;
        theNewPointZ = 0.0;
        for(var i in cEdges)
        {
            if(cEdges[i].A === faceC.Coordinates)
            {
                theNewPointX += B*cEdges[i].B.x;
                theNewPointY += B*cEdges[i].B.y;
                theNewPointZ += B*cEdges[i].B.z;
            }
            else
            {
                theNewPointX += B*cEdges[i].A.x;
                theNewPointY += B*cEdges[i].A.y;
                theNewPointZ += B*cEdges[i].A.z;
            }
        }  
        // Next line breaks it
        meshes[0].Vertices[meshes[0].Faces[faceIndex].C].Coordinates = new BABYLON.Vector3((1-k*B)*faceC.Coordinates.x + theNewPointX, (1-k*B)*faceC.Coordinates.y + theNewPointY, (1-k*B)*faceC.Coordinates.z + theNewPointZ);
        ///////////////////////


        faceA = meshes[0].Vertices[meshes[0].Faces[faceIndex].A];
        faceB = meshes[0].Vertices[meshes[0].Faces[faceIndex].B];
        faceC = meshes[0].Vertices[meshes[0].Faces[faceIndex].C];
        // A-B
        var abOpp;
        for(var i in meshes[0].Faces)
        {
            if((meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceB || 
               meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceB ||
               meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceB) ||
               
               (meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceB ||
               meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceB ||
               meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceB))
            {
                abOpp = meshes[0].Faces[i];
            }
        }
        var oppPoint1;
        if((meshes[0].Vertices[abOpp.A] === faceA && meshes[0].Vertices[abOpp.B] === faceB) ||
           (meshes[0].Vertices[abOpp.B] === faceA && meshes[0].Vertices[abOpp.A] === faceB))
        {
            oppPoint1 = meshes[0].Vertices[abOpp.C];
        }
        if((meshes[0].Vertices[abOpp.A] === faceA && meshes[0].Vertices[abOpp.C] === faceB) ||
           (meshes[0].Vertices[abOpp.C] === faceA && meshes[0].Vertices[abOpp.A] === faceB))
        {
             oppPoint1 = meshes[0].Vertices[abOpp.B];
        }
        if((meshes[0].Vertices[abOpp.B] === faceA && meshes[0].Vertices[abOpp.C] === faceB) ||
           (meshes[0].Vertices[abOpp.C] === faceA && meshes[0].Vertices[abOpp.A] === faceB))
        {
             oppPoint1 = meshes[0].Vertices[abOpp.A];
        }
        
        var newVert1 = new BABYLON.Vector3(
            (faceA.Coordinates.x*(3.0/8.0) + faceB.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(1.0/8.0) + oppPoint1.Coordinates.x*(1.0/8.0)),
            (faceA.Coordinates.y*(3.0/8.0) + faceB.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(1.0/8.0) + oppPoint1.Coordinates.y*(1.0/8.0)),
            (faceA.Coordinates.z*(3.0/8.0) + faceB.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(1.0/8.0) + oppPoint1.Coordinates.z*(1.0/8.0)));
        var newNormal1 = new BABYLON.Vector3(
            (faceA.Normal.x + faceB.Normal.x)/2,
            (faceA.Normal.y + faceB.Normal.y)/2,
            (faceA.Normal.z + faceB.Normal.z)/2);

        // A-C
        var acOpp;
        for(var i in meshes[0].Faces)
        {
            if((meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC || 
               meshes[0].Vertices[meshes[0].Faces[i].A] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC ||
               meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC) ||
               
               (meshes[0].Vertices[meshes[0].Faces[i].B] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
               meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
               meshes[0].Vertices[meshes[0].Faces[i].C] === faceA && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC))
            {
                acOpp = meshes[0].Faces[i];
            }
        }

        var oppPoint2;
        if((meshes[0].Vertices[acOpp.A] === faceA && meshes[0].Vertices[acOpp.B] === faceC) ||
           (meshes[0].Vertices[acOpp.B] === faceA && meshes[0].Vertices[acOpp.A] === faceC))
        {
            oppPoint2 = meshes[0].Vertices[acOpp.C];
        }
        if((meshes[0].Vertices[acOpp.A] === faceA && meshes[0].Vertices[acOpp.C] === faceC) ||
           (meshes[0].Vertices[acOpp.C] === faceA && meshes[0].Vertices[acOpp.A] === faceC))
        {
             oppPoint2 = meshes[0].Vertices[acOpp.B];
        }
        if((meshes[0].Vertices[acOpp.B] === faceA && meshes[0].Vertices[acOpp.C] === faceC) ||
           (meshes[0].Vertices[acOpp.C] === faceA && meshes[0].Vertices[acOpp.A] === faceC))
        {
             oppPoint2 = meshes[0].Vertices[acOpp.A];
        }
        var newVert2 = new BABYLON.Vector3(
            (faceB.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(3.0/8.0) + faceA.Coordinates.x*(1.0/8.0) + oppPoint2.Coordinates.x*(1.0/8.0)),
            (faceB.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(3.0/8.0) + faceA.Coordinates.y*(1.0/8.0) + oppPoint2.Coordinates.y*(1.0/8.0)),
            (faceB.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(3.0/8.0) + faceA.Coordinates.z*(1.0/8.0) + oppPoint2.Coordinates.z*(1.0/8.0)));
        var newNormal2 = new BABYLON.Vector3(
            (faceB.Normal.x + faceC.Normal.x)/2,
            (faceB.Normal.y + faceC.Normal.y)/2,
            (faceB.Normal.z + faceC.Normal.z)/2);

         // B-C
        var bcOpp;
        for(var i in meshes[0].Faces)
        {
            if((meshes[0].Vertices[meshes[0].Faces[i].A] === faceB && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC || 
               meshes[0].Vertices[meshes[0].Faces[i].A] === faceB && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC ||
               meshes[0].Vertices[meshes[0].Faces[i].B] === faceB && meshes[0].Vertices[meshes[0].Faces[i].C] === faceC) ||
               
               (meshes[0].Vertices[meshes[0].Faces[i].B] === faceB && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
               meshes[0].Vertices[meshes[0].Faces[i].C] === faceB && meshes[0].Vertices[meshes[0].Faces[i].A] === faceC ||
               meshes[0].Vertices[meshes[0].Faces[i].C] === faceB && meshes[0].Vertices[meshes[0].Faces[i].B] === faceC))
            {
                bcOpp = meshes[0].Faces[i];
            }
        }

        var oppPoint3;
        if((meshes[0].Vertices[bcOpp.A] === faceB && meshes[0].Vertices[bcOpp.B] === faceC) ||
           (meshes[0].Vertices[bcOpp.B] === faceB && meshes[0].Vertices[bcOpp.A] === faceC))
        {
            oppPoint3 = meshes[0].Vertices[bcOpp.C];
        }
        if((meshes[0].Vertices[bcOpp.A] === faceB && meshes[0].Vertices[bcOpp.C] === faceC) ||
           (meshes[0].Vertices[bcOpp.C] === faceB && meshes[0].Vertices[bcOpp.A] === faceC))
        {
             oppPoint3 = meshes[0].Vertices[bcOpp.B];
        }
        if((meshes[0].Vertices[bcOpp.B] === faceB && meshes[0].Vertices[bcOpp.C] === faceC) ||
           (meshes[0].Vertices[bcOpp.C] === faceB && meshes[0].Vertices[bcOpp.B] === faceC))
        {
             oppPoint3 = meshes[0].Vertices[bcOpp.A];
        }
        var newVert3 = new BABYLON.Vector3(
            (faceA.Coordinates.x*(3.0/8.0) + faceC.Coordinates.x*(3.0/8.0) + faceB.Coordinates.x*(1.0/8.0) + oppPoint3.Coordinates.x*(1.0/8.0)),
            (faceA.Coordinates.y*(3.0/8.0) + faceC.Coordinates.y*(3.0/8.0) + faceB.Coordinates.y*(1.0/8.0) + oppPoint3.Coordinates.y*(1.0/8.0)),
            (faceA.Coordinates.z*(3.0/8.0) + faceC.Coordinates.z*(3.0/8.0) + faceB.Coordinates.z*(1.0/8.0) + oppPoint3.Coordinates.z*(1.0/8.0)));
        var newNormal3 = new BABYLON.Vector3(
            (faceA.Normal.x + faceC.Normal.x)/2,
            (faceA.Normal.y + faceC.Normal.y)/2,
            (faceA.Normal.z + faceC.Normal.z)/2);

        meshes[0].Vertices.push({
            Coordinates: newVert1,
            Normal: newNormal1,
            WorldCoordinates: null
        });
        var newVert1Index = meshes[0].Vertices.length - 1;
        meshes[0].Vertices.push({
            Coordinates: newVert2,
            Normal: newNormal2,
            WorldCoordinates: null
        });
        var newVert2Index = meshes[0].Vertices.length - 1;
        meshes[0].Vertices.push({
            Coordinates: newVert3,
            Normal: newNormal3,
            WorldCoordinates: null
        });
        var newVert3Index = meshes[0].Vertices.length - 1;


        // NEW FACES
        meshes[0].Faces.push({
            A: newVert1Index,
            B: newVert2Index,
            C: newVert3Index
        });
        meshes[0].Faces.push({
            A: meshes[0].Faces[faceIndex].A,
            B: newVert1Index,
            C: newVert3Index
        });
        meshes[0].Faces.push({
            A: newVert3Index,
            B: newVert2Index,
            C: meshes[0].Faces[faceIndex].C
        });
        meshes[0].Faces.push({
            A: newVert1Index,
            B: meshes[0].Faces[faceIndex].B,
            C: newVert2Index
        });
    }
}
