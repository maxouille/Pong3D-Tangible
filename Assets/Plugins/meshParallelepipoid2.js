#pragma strict

var Parallelepipoid : GameObject;
private var newVertices : Vector3[] = new Vector3[8];
private var newTriangles : int[] = new int[3*12];
var length : float = 8f;
var width : float = 4f;
var height : float = 2f;
var center : boolean = true;
 
function Start () { 

  // create Parallelepipoid if don't exists
	if(gameObject.Find("PlanePivot").transform.Find ("Forme").transform.Find("FormePaddle2") == null) {
		Parallelepipoid = new GameObject ("FormePaddle2");
		Parallelepipoid.transform.parent = gameObject.Find("PlanePivot").transform.Find("Forme").transform;
	}
	else {
		Parallelepipoid = gameObject.Find("PlanePivot").transform.Find("Forme").transform.Find("FormePaddle2").gameObject;
	}
	
	Parallelepipoid.AddComponent(MeshFilter);                           	
	Parallelepipoid.AddComponent(MeshRenderer);
    var mat : Material = Resources.Load("PlaneMaterial", Material);
    Parallelepipoid.renderer.material = mat;
    Parallelepipoid.AddComponent(MeshCollider);
    
    Parallelepipoid.transform.localScale = new Vector3(0.2,0.2,0.2);
    	  
    UpdateMesh ();
	OtherFace();
	
	var scaleX = gameObject.Find("PlanePivot").transform.Find("Forme").transform.localScale.x;
	
	Parallelepipoid.transform.localPosition.x = gameObject.Find("Main Camera").GetComponent(meshPlane).size.x /2;
	Parallelepipoid.renderer.enabled = false;
}

function UpdateMesh () {
	var uv : Vector2[] = new Vector2[newVertices.Length];
	
	var p0 : Vector3 = Vector3(0,0,0);                              			//the eight points that make a parallelepipoid
    var p1 : Vector3 = Vector3(1*width,0,0);
    var p2 : Vector3 = Vector3(1*width,1*height,0);
    var p3 : Vector3 = Vector3(0,1*height,0);
    var p4 : Vector3 = Vector3(0,0,1*length);
    var p5 : Vector3 = Vector3(1*width,0,1*length);
    var p6 : Vector3 = Vector3(1*width,1*height,1*length);
    var p7 : Vector3 = Vector3(0,1*height,1*length);
 
 	newVertices = [p0,p1,p2,p3,p4,p5,p6,p7];
 		
	for (var i : int = 0; i < 8; i++) {
		if (center) {
			newVertices[i] -= Vector3 (width / 2, height / 2, length / 2);
		}
		uv[i] = Vector2(newVertices[i].x, newVertices[i].z);
	}
	
	newTriangles = [  
	    0,2,1,
	    0,3,2,
	    0,1,4,
	    1,5,4,
	    1,2,6,
	    1,6,5,
	    2,3,6,
	    3,7,6,
	    0,4,3,
	    3,4,7,
	    4,5,6,
	    4,6,7
	];
 
    var newMesh : Mesh = new Mesh ();                               			//create a new mesh, assign the vertices and triangles
    	newMesh.name = "Procedural Parallelepipoid";
    	newMesh.Clear();
        newMesh.vertices = newVertices;
        newMesh.uv = uv;
        newMesh.triangles = newTriangles;
        newMesh.RecalculateNormals();                               			//recalculate normals, bounds and optimize
        newMesh.RecalculateBounds();
        newMesh.Optimize();                             
             
    (Parallelepipoid.GetComponent(MeshFilter) as MeshFilter).mesh = newMesh;  	//assign the created mesh as the used mesh
	Parallelepipoid.GetComponent(MeshCollider).sharedMesh = null;
	Parallelepipoid.GetComponent(MeshCollider).sharedMesh = newMesh;
}

function OtherFace () {
    var mesh = gameObject.Find("PlanePivot").transform.Find("Forme").transform.Find("FormePaddle2").GetComponent(MeshFilter).sharedMesh;
	var vertices = mesh.vertices;
	var uv = mesh.uv;
	var normals = mesh.normals;
	var szV = vertices.length;
	var newVerts = new Vector3[szV*2];
	var newUv = new Vector2[szV*2];
	var newNorms = new Vector3[szV*2];
	for (var j=0; j< szV; j++){
		// duplicate vertices and uvs:
		newVerts[j] = newVerts[j+szV] = vertices[j];
		newUv[j] = newUv[j+szV] = uv[j];
		// copy the original normals...
		newNorms[j] = normals[j];
		// and revert the new ones
		newNorms[j+szV] = -normals[j];
	}
	var triangles = mesh.triangles;
	var szT = triangles.length;
	var newTris = new int[szT*2]; // double the triangles
	for (var i=0; i< szT; i+=3){
		// copy the original triangle
		newTris[i] = triangles[i];
		newTris[i+1] = triangles[i+1];
		newTris[i+2] = triangles[i+2];
		// save the new reversed triangle
		j = i+szT; 
		newTris[j] = triangles[i]+szV;
		newTris[j+2] = triangles[i+1]+szV;
		newTris[j+1] = triangles[i+2]+szV;
	}
	mesh.vertices = newVerts;
	mesh.uv = newUv;
	mesh.normals = newNorms;
    mesh.triangles = newTris; // assign triangles last!
}