#pragma strict

var Plan : GameObject;
var center : boolean = true;
var size : Vector2 = new Vector2 (10, 10);
var resolutionX : int = 10;
var resolutionZ : int = 10;
private var newVertices : Vector3[] = new Vector3[(resolutionX + 1) * (resolutionZ + 1)];
private var newTriangles : int[] = new int[resolutionX * resolutionZ * 6];
private var newUvs : Vector2[] = new Vector2[newVertices.Length];

function Start () {
	if (gameObject.Find("PlanePivot").transform.Find("Forme").gameObject == null) {
		Plan = GameObject("Forme");
		Plan.transform.parent = gameObject.Find("PlanePivot").transform;
	}
	else {
	Plan = gameObject.Find("PlanePivot").transform.Find("Forme").gameObject;
	}
	Plan.AddComponent(MeshFilter);
	Plan.AddComponent(MeshRenderer);
    // load the resource PlaneMaterial from folder Assets/Resources
    var mat : Material = Resources.Load("PlaneMaterial", Material);
    Plan.renderer.material = mat;
    Plan.AddComponent(MeshCollider);
	Plan.transform.parent = gameObject.Find("PlanePivot").transform;
	// la limite peut être abaissée mais il faut éviter une taille nulle car le mesh deviendra invisible
	if (size.x < 0.1f)
		size.x = 0.1f;
	if (size.y < 0.1f)
		size.y = 0.1f;
 	resolutionX = Mathf.Clamp (resolutionX, 1, 250);
	resolutionZ = Mathf.Clamp (resolutionZ, 1, 250);
	
	CreateMesh ();
	OtherFace();
	
	Plan.transform.rotation = Quaternion.Euler(-45,10,30);
}
 
// reconstruct mesh based on size and resolution
function CreateMesh () {
	// update size of newVertices and newTriangles
	newVertices = new Vector3[(resolutionX + 1) * (resolutionZ + 1)];
	newTriangles = new int[resolutionX * resolutionZ * 6];
	newUvs = new Vector2[newVertices.Length];

	// int i sert juste à accéder aux éléments des tableaux simplement
	var i : int = 0;
	
	// create vertices
	for (var z : int = 0; z <= resolutionZ; z++) {
		for (var x : int = 0; x <= resolutionX; x++) {
			newVertices[i] = Vector3 (x * size.x / resolutionX, 0, z * size.y / resolutionZ);
			if (center) {
				newVertices[i] -= Vector3 (size.x / 2, 0, size.y / 2);
			}
			// le cast en float sert à éviter la division entière de 2 int
			newUvs[i] = Vector2 ((x*1.0) / resolutionX, (z*1.0) / resolutionZ);
			i++;
		}
	}
	
	i = 0;
	// create triangles
	for (z = 0; z < resolutionZ; z++) {
		for (x = 0; x < resolutionX; x++) {
			newTriangles[i + 5] =
			newTriangles[i    ] = z * (resolutionX + 1) + x;
			newTriangles[i + 1] = (z + 1) * (resolutionX + 1) + x;
			newTriangles[i + 2] =
			newTriangles[i + 3] = (z + 1) * (resolutionX + 1) + x + 1;
			newTriangles[i + 4] = z * (resolutionX + 1) + x + 1;
			i += 6;
		}
	}
	
	//create a new mesh, assign the vertices and triangles
    var newMesh : Mesh = new Mesh ();
    newMesh.name = "Procedural Plane";    
	newMesh.Clear ();
	// cette ligne sert à nettoyer les données du mesh
	// Unity vérifie si les indices des tris ne sont pas en dehors du tableau
	// de vertices, ce qui peut facilement se produire si on en assigne de
	// nouveaux alors que le mesh contient toujours les anciens tris
	// (vous obtiendrez une jolie exception dans ce cas !)
	newMesh.vertices = newVertices;
	newMesh.uv = newUvs;
	//newMesh.colors = colors;
	newMesh.triangles = newTriangles;
	newMesh.RecalculateNormals();                               	//recalculate normals, bounds and optimize
    newMesh.RecalculateBounds();
    newMesh.Optimize();
    
    (Plan.GetComponent(MeshFilter) as MeshFilter).mesh = newMesh;  	//assign the created mesh as the used mesh 
    Plan.GetComponent(MeshCollider).sharedMesh = null;
    Plan.GetComponent(MeshCollider).sharedMesh = newMesh; 
}

function OtherFace () {
    var mesh = gameObject.Find("Forme").GetComponent(MeshFilter).sharedMesh;
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