var SoftEngine;
(function (SoftEngine) {
    var Camera = (function () {
        function Camera() {
            this.Position = BABYLON.Vector3.Zero();
            this.Target = BABYLON.Vector3.Zero();
        }
        return Camera;
    })();
    SoftEngine.Camera = Camera;    
    var Mesh = (function () {
        function Mesh(name, verticesCount, facesCount) {
            this.name = name;
            this.Vertices = new Array(verticesCount);
            this.Faces = new Array(facesCount);
            this.Rotation = new BABYLON.Vector3(0, 0, 0);
            this.Position = new BABYLON.Vector3(0, 0, 0);
        }
        return Mesh;
    })();
    SoftEngine.Mesh = Mesh;    
    var Device = (function () {
        function Device(canvas) {
            this.workingCanvas = canvas;
            this.workingWidth = canvas.width;
            this.workingHeight = canvas.height;
            this.workingContext = this.workingCanvas.getContext("2d");
            this.depthBuffer = new Array(this.workingWidth * this.workingHeight);
        }
        Device.prototype.clear = function () {
            this.workingContext.clearRect(0, 0, this.workingWidth, this.workingHeight);
            this.backbuffer = this.workingContext.getImageData(0, 0, this.workingWidth, this.workingHeight);
            for(var i = 0; i < this.depthBuffer.length; i++)
            {
                this.depthBuffer[i] = 10000000;
            }
        };
        Device.prototype.present = function () {
            this.workingContext.putImageData(this.backbuffer, 0, 0);
        };
        Device.prototype.putPixel = function (x, y, z, color) {
            this.backbufferdata = this.backbuffer.data;
            var index = ((x >> 0) + (y >> 0) * this.workingWidth) * 4;
            if(this.depthBuffer[index] < z) return;
            this.depthBuffer[index] = z;
            if(color != "undefined") this.backbufferdata[index] = color.r * 255;
            this.backbufferdata[index + 1] = color.g * 255;
            this.backbufferdata[index + 2] = color.b * 255;
            this.backbufferdata[index + 3] = color.a * 255;
        };
        Device.prototype.project = function (coord, transMat) 
        {
            var point = BABYLON.Vector3.TransformCoordinates(coord, transMat);
            // The transformed coordinates will be based on coordinate system
            // starting on the center of the screen. But drawing on screen normally starts
            // from top left. We then need to transform them again to have x:0, y:0 on top left.
            var x = point.x * this.workingWidth + this.workingWidth / 2.0 >> 0;
            var y = -point.y * this.workingHeight + this.workingHeight / 2.0 >> 0;
            return (new BABYLON.Vector3(x, y, point.z));
        };
        Device.prototype.drawPoint = function (point, color) {
            if(point.x >= 0 && point.y >= 0 && point.x < this.workingWidth && point.y < this.workingHeight) {
                this.putPixel(point.x, point.y, point.z, color);
            }
        };
        Device.prototype.drawLine = function (point0, point1) {
            var dist = point1.subtract(point0).length();
            if(dist < 2) {
                return;
            }
            var middlePoint = point0.add((point1.subtract(point0)).scale(0.5));
            this.drawPoint(middlePoint);
            this.drawLine(point0, middlePoint);
            this.drawLine(middlePoint, point1);
        };
        Device.prototype.drawBline = function (point0, point1) {
            var x0 = point0.x >> 0;
            var y0 = point0.y >> 0;
            var x1 = point1.x >> 0;
            var y1 = point1.y >> 0;
            var dx = Math.abs(x1 - x0);
            var dy = Math.abs(y1 - y0);
            var sx = (x0 < x1) ? 1 : -1;
            var sy = (y0 < y1) ? 1 : -1;
            var err = dx - dy;
            while(true) {
                this.drawPoint(new BABYLON.Vector2(x0, y0));
                if((x0 == x1) && (y0 == y1)) {
                    break;
                }
                var e2 = 2 * err;
                if(e2 > -dy) {
                    err -= dy;
                    x0 += sx;
                }
                if(e2 < dx) {
                    err += dx;
                    y0 += sy;
                }
            }
        };

        Device.prototype.drawCurve = function(point0, point1, point2)
        {
            x0 = point0.x;
            x1 = point1.x;
            x2 = point2.x;
            y0 = point0.y;
            y1 = point1.y;
            y2 = point2.y;

            t = 1;
            for(var i = 0; i < t; i+= 0.01)
            {   
                this.drawPoint(new BABYLON.Vector2((1-i)*((1-i)*x0 + i*x1) + i*((1-i)*x1+i*x2),
                    (1-i)*((1-i)*y0 + i*y1) + i*((1-i)*y1+i*y2)));
            }

        }

        // drawing surface method - INCOMPLETE
        Device.prototype.drawSurface = function(point0, point1, point2, point3)
        {
            x0 = point0.x;
            x1 = point1.x;
            x2 = point2.x;
            x3 = point3.x;
            y0 = point0.y;
            y1 = point1.y;
            y2 = point2.y;
            y3 = point3.y;

            for(var u = 0; u < t; u += 0.01)
            {
                drawCurve();
                for(v = 1; v < t; v += 0.01)
                {

                }
            }
        }

        // Clamping values to keep them between 0 and 1
        Device.prototype.clamp = function (value, min, max) 
        {
            if (typeof min === "undefined") { min = 0; }
            if (typeof max === "undefined") { max = 1; }
            return Math.max(min, Math.min(value, max));
        };

        Device.prototype.interpolate = function (min, max, gradient) {
            return min + (max - min) * this.clamp(gradient);
        };

        // drawing line between 2 points from left to right
        // papb -> pcpd
        // pa, pb, pc, pd must then be sorted before
        Device.prototype.processScanLine = function (y, pa, pb, pc, pd, color) {
            // Thanks to current Y, we can compute the gradient to compute others values like
            // the starting X (sx) and ending X (ex) to draw between    
            // if pa.Y == pb.Y or pc.Y == pd.Y, gradient is forced to 1
            var gradient1 = pa.y != pb.y ? (y - pa.y) / (pb.y - pa.y) : 1;
            var gradient2 = pc.y != pd.y ? (y - pc.y) / (pd.y - pc.y) : 1;

            var sx = this.interpolate(pa.x, pb.x, gradient1) >> 0;
            var ex = this.interpolate(pc.x, pd.x, gradient2) >> 0;

            // starting Z & ending Z
            var z1 = this.interpolate(pa.z, pb.z, gradient1);
            var z2 = this.interpolate(pc.z, pd.z, gradient2);

            // drawing a line from left (sx) to right (ex) 
            for(var x = sx; x < ex; x++) 
            {
                var gradient = (x-sx)/(ex-sx);
                var z = this.interpolate(z1, z2, gradient);
                this.drawPoint(new BABYLON.Vector3(x, y, z), color);
            }
        };

        Device.prototype.drawTriangle = function (p1, p2, p3, color) {
            // Sorting the points in order to always have this order on screen p1, p2 & p3
            // with p1 always up (thus having the Y the lowest possible to be near the top screen)
            // then p2 between p1 & p3
            if(p1.y > p2.y) {
                var temp = p2;
                p2 = p1;
                p1 = temp;
            }
            if(p2.y > p3.y) {
                var temp = p2;
                p2 = p3;
                p3 = temp;
            }
            if(p1.y > p2.y) {
                var temp = p2;
                p2 = p1;
                p1 = temp;
            }

            // inverse slopes
            var dP1P2; var dP1P3;

            // http://en.wikipedia.org/wiki/Slope
            // Computing slopes
            if(p2.y - p1.y > 0) {
                dP1P2 = (p2.x - p1.x) / (p2.y - p1.y);
            } else {
                dP1P2 = 0;
            }

            if(p3.y - p1.y > 0) {
                dP1P3 = (p3.x - p1.x) / (p3.y - p1.y);
            } else {
                dP1P3 = 0;
            }

            // First case where triangles are like that:
            // P1
            // -
            // -- 
            // - -
            // -  -
            // -   - P2
            // -  -
            // - -
            // -
            // P3
            if(dP1P2 > dP1P3) {
                for(var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                    if(y < p2.y) {
                        this.processScanLine(y, p1, p3, p1, p2, color);
                    } else {
                        this.processScanLine(y, p1, p3, p2, p3, color);
                    }
                }
            }
            // First case where triangles are like that:
            //       P1
            //        -
            //       -- 
            //      - -
            //     -  -
            // P2 -   - 
            //     -  -
            //      - -
            //        -
            //       P3
            else {
                for(var y = p1.y >> 0; y <= p3.y >> 0; y++) {
                    if(y < p2.y) {
                        this.processScanLine(y, p1, p2, p1, p3, color);
                    } else {
                        this.processScanLine(y, p2, p3, p1, p3, color);
                    }
                }
            }
        };


        Device.prototype.render = function (camera, meshes) {
            var viewMatrix = BABYLON.Matrix.LookAtLH(camera.Position, camera.Target, BABYLON.Vector3.Up());
            var projectionMatrix = BABYLON.Matrix.PerspectiveFovLH(0.78, this.workingWidth / this.workingHeight, 0.01, 1.0);
            for(var index = 0; index < meshes.length; index++) {
                var cMesh = meshes[index];
                var worldMatrix = BABYLON.Matrix.RotationYawPitchRoll(cMesh.Rotation.y, cMesh.Rotation.x, cMesh.Rotation.z).multiply(BABYLON.Matrix.Translation(cMesh.Position.x, cMesh.Position.y, cMesh.Position.z));
                var transformMatrix = worldMatrix.multiply(viewMatrix).multiply(projectionMatrix);
                

                // OLD
                // for(var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
                //     var currentFace = cMesh.Faces[indexFaces];
                //     var vertexA = cMesh.Vertices[currentFace.A];
                //     var vertexB = cMesh.Vertices[currentFace.B];
                //     var vertexC = cMesh.Vertices[currentFace.C];
                //     var pixelA = this.project(vertexA, transformMatrix);
                //     var pixelB = this.project(vertexB, transformMatrix);
                //     var pixelC = this.project(vertexC, transformMatrix);
                //     this.drawBline(pixelA, pixelB);
                //     this.drawBline(pixelB, pixelC);
                //     this.drawBline(pixelC, pixelA);
                // }
                // END OLD
                
                for (var indexFaces = 0; indexFaces < cMesh.Faces.length; indexFaces++) {
                    var currentFace = cMesh.Faces[indexFaces];
                    var vertexA = cMesh.Vertices[currentFace.A];
                    var vertexB = cMesh.Vertices[currentFace.B];
                    var vertexC = cMesh.Vertices[currentFace.C];

                    var pixelA = this.project(vertexA, transformMatrix);
                    var pixelB = this.project(vertexB, transformMatrix);
                    var pixelC = this.project(vertexC, transformMatrix);

                    var color = 0.25 + ((indexFaces % cMesh.Faces.length) / cMesh.Faces.length) * 0.75;
                    this.drawTriangle(pixelA, pixelB, pixelC, new BABYLON.Color4(color, color, color, 1));
                }
            }
            
            // this calls the draw curve stuff we were doing in class
            // var point0 = new BABYLON.Vector2(100,100);
            // var point1 = new BABYLON.Vector2(150, 200);
            // var point2 = new BABYLON.Vector2(300, 100);

            // this.drawCurve(point0, point1, point2);
            // this.drawBline(point0, point1);
            // this.drawBline(point0, point2);
            // this.drawBline(point2, point1);
        };
        Device.prototype.LoadJSONFileAsync = function (fileName, callback) {
            var jsonObject = {
            };
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", fileName, true);
            var that = this;
            xmlhttp.onreadystatechange = function () {
                if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    jsonObject = JSON.parse(xmlhttp.responseText);
                    callback(that.CreateMeshesFromJSON(jsonObject));
                }
            };
            xmlhttp.send(null);
        };
        Device.prototype.CreateMeshesFromJSON = function (jsonObject) {
            var meshes = [];
            for(var meshIndex = 0; meshIndex < jsonObject.meshes.length; meshIndex++) {
                var verticesArray = jsonObject.meshes[meshIndex].vertices;
                var indicesArray = jsonObject.meshes[meshIndex].indices;
                var uvCount = jsonObject.meshes[meshIndex].uvCount;
                var verticesStep = 1;
                switch(uvCount) {
                    case 0:
                        verticesStep = 6;
                        break;
                    case 1:
                        verticesStep = 8;
                        break;
                    case 2:
                        verticesStep = 10;
                        break;
                }
                var verticesCount = verticesArray.length / verticesStep;
                var facesCount = indicesArray.length / 3;
                var mesh = new SoftEngine.Mesh(jsonObject.meshes[meshIndex].name, verticesCount, facesCount);
                for(var index = 0; index < verticesCount; index++) {
                    var x = verticesArray[index * verticesStep];
                    var y = verticesArray[index * verticesStep + 1];
                    var z = verticesArray[index * verticesStep + 2];
                    mesh.Vertices[index] = new BABYLON.Vector3(x, y, z);
                }
                for(var index = 0; index < facesCount; index++) {
                    var a = indicesArray[index * 3];
                    var b = indicesArray[index * 3 + 1];
                    var c = indicesArray[index * 3 + 2];
                    mesh.Faces[index] = {
                        A: a,
                        B: b,
                        C: c
                    };
                }
                var position = jsonObject.meshes[meshIndex].position;
                mesh.Position = new BABYLON.Vector3(position[0], position[1], position[2]);
                meshes.push(mesh);
            }
            return meshes;
        };
        return Device;
    })();
    SoftEngine.Device = Device;    
})(SoftEngine || (SoftEngine = {}));
