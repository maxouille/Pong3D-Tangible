/**
*
* Copyright (c) 2013 xzimg , All Rights Reserved
* No part of this software and related documentation may be used, copied,
* modified, distributed and transmitted, in any form or by any means,
* without the prior written permission of xzimg
*
* the xzimg company is located at 76 rue Gabriel Péri - 78800 Houilles - FRANCE
* contact@xzimg.com, xzimg.com
*
*/

using UnityEngine;
using System;
using System.Runtime.InteropServices;
using System.Collections;
using System.Collections.Generic;	//List

public class xzimgMarkerUnityPluginPlane : MonoBehaviour {	
	
// Import marker detection functions
#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern bool xzimgMarkerInitialize(int CaptureWidth, int CaptureHeight, int iProcessingWidth, int iProcessingHeight, float fFOV);
 
#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern void xzimgMarkerRelease();

#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern void xzimgSetActiveIndices(ref int arrIndices, int nbrOfIndices);
	
#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern bool xzimgMarkerDetect([In][Out] ref stpImage imageIn, int markerSize, bool useFilter, int filterStrenght);

#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern int xzimgMarkerGetNumber();

#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern void xzimgMarkerGetInfoForUnity(int iId, [In][Out] ref xzimgMarkerInfoForUnity markerInfo);
	
#if UNITY_IPHONE    
	[DllImport ("__Internal")] 
#else 
	[DllImport("xzimg-Marker-SDK-Unity")] 
#endif 
    private static extern bool xzimgMarkerGetProtectionAlert();
	
	 // Create the marker structure to get marker's location according to the camera
	[StructLayout(LayoutKind.Sequential)]
    public struct xzimgMarkerInfoForUnity
	{
		public int markerID;
        public Vector3 position;
        public Vector3 euler;
        public Quaternion rotation;
	}
    private xzimgMarkerInfoForUnity markerInfo;
	
    // Create the image structure to push image data to the tracking
    [StructLayout(LayoutKind.Sequential)]
    public struct stpImage
    {
        public int  m_width;
        public int  m_height;
       	
		public IntPtr m_imageData;

	    /** 0: Black and White, 1: Color RGB, 2: Color BGR, 3: Color RGBA, 4: Color ARGB */
	    public int m_colorType;

	    /** 0: unsigned char, 1: float, 2: double */
	    public int m_type;
		
		/** Has the image to be flipped horinzontally */
		public bool m_flippedHorizontaly;
		
		/**  Id of the current frame*/
		public int m_frameId;
    }
    private stpImage ImageIn;


	// Size of the video capture (constant)
    public int CaptureWidth = 1920, CaptureHeight = 1080;
	// Size of the image for marker detection
    public int ProcessingWidth = 1920, ProcessingHeight = 1080;
	public bool MirrorVideo = false;
	public float CameraFOVX = 45.0f;
	
	// to filter object pose
	public bool RecursiveFilter = false;
	public int FilterStrength = 1;
	
	// Size of the marker to be detected (choose between 2, 3, 4 or 5)
	public int MarkerSize = 5;
	public bool StretchRendering = true;
	public List<int> TrackOnlyIndices;
	
	// private variables
	private int VideoPlaneDistance = 750;
	private GameObject RaquettePivot1, RaquetteObject1, RaquettePivot2, RaquetteObject2, FieldPivot, FieldObject;
	private WebCamTexture m_WebcamTexture;
	private Color32[] m_data;
	private WebCamDevice[] devices;
	private String deviceName;
    private GCHandle m_PixelsHandle;


	/* Called one when we launch the application */
    IEnumerator Start () {
		Camera.main.clearFlags = CameraClearFlags.Skybox;
		//Put camera in the center of the screen.
		Camera.main.transform.position = new Vector3(0, 0, 0);
		Camera.main.transform.eulerAngles = new Vector3(0, 0, 0);
		transform.position = new Vector3(0, 0, 0);

		//yield : Return a generator with method next.
		yield return Application.RequestUserAuthorization (UserAuthorization.WebCam | UserAuthorization.Microphone);

		//If we can use the camera or the microphone
		if (Application.HasUserAuthorization(UserAuthorization.WebCam | UserAuthorization.Microphone)) {
			// Add the webcam to the devices array
	        devices = WebCamTexture.devices;
       		deviceName = devices[0].name;
			//Create a texture from the deviceName with a defined width and height with 30 FPS
            m_WebcamTexture = new WebCamTexture(deviceName, CaptureWidth, CaptureHeight, 30);
			//Calculate the ratio according to the width and height of the texture.
            float aspect_ratio = (float)m_WebcamTexture.requestedWidth / (float)m_WebcamTexture.requestedHeight;
			//Change the fieldOfView of the camera.
            Camera.main.fieldOfView = CameraFOVX / (aspect_ratio);
			
	        if (!m_WebcamTexture)
	            Debug.Log("No camera detected!");
			else {
				m_WebcamTexture.Play();
				
		        // Assign video texture to the renderer
		        if (renderer) {
					// Modify Game Object's position & orientation according to the main camera's focal
			        transform.position = new Vector3(0, 0, VideoPlaneDistance);
			        transform.eulerAngles = new Vector3(270, 0, 0);
					double tan_fov_rad_h = Math.Tan((double)(Camera.main.fieldOfView*aspect_ratio) / 2.0 * (Math.PI / 180.0));
					double tan_fov_rad_v = Math.Tan((double)Camera.main.fieldOfView / 2.0 * (Math.PI / 180.0));
					
                    double scale_u = (2.0f * (float)VideoPlaneDistance * tan_fov_rad_h);
			        double scale_v = (2.0f * (float)VideoPlaneDistance * tan_fov_rad_v);
					
					if (MirrorVideo)
			            transform.localScale = new Vector3((float)scale_u/10.0f, (float)1, (float)-scale_v/(9.8f));
			        else
			            transform.localScale = new Vector3((float)-scale_u/10.0f, (float)1, (float)-scale_v/(9.8f));
	
					renderer.material = new Material(
						"Shader \"Simple\" {" +
				        "SubShader {" +
				        "    Pass {" +
				        "        Color (1,1,1,0) Material { Diffuse (1,1,1,0) Ambient (1,1,1,0) }" +
				        "        Lighting Off" +
				        "        SetTexture [_MainTex]" +
				        "    }" +
				        "}" +
				        "}"
						);		
	
		        }
		        else {
		            Debug.Log("No renderer available for this object!");
				}
				
                xzimgMarkerInitialize(m_WebcamTexture.requestedWidth, m_WebcamTexture.requestedHeight, ProcessingWidth, ProcessingHeight, Camera.main.fieldOfView * aspect_ratio);
			
				// Find the gameobjects for pivot and 3D model
		        RaquettePivot1 = GameObject.Find("RaquettePivot1");
		        RaquetteObject1 = GameObject.Find("RaquetteObject1");

				// Find the gameobjects for pivot and 3D model
				RaquettePivot2 = GameObject.Find("RaquettePivot2");
				RaquetteObject2 = GameObject.Find("RaquetteObject2");

				// Find the gameobjects for pivot and 3D model
				FieldPivot = GameObject.Find("FieldPivot");
				FieldObject = GameObject.Find("FieldObject");
				
				GameObject go = new GameObject("MarkerInfo");
			}
			
			// Restore a camera fov that takes the screen width and height into account
			if (StretchRendering) Camera.main.aspect = aspect_ratio;
			
			if (TrackOnlyIndices.Count > 0) {
				int [] arrIndices = new int[TrackOnlyIndices.Count];
				for (int i=0; i<TrackOnlyIndices.Count; i++)
					arrIndices[i] = TrackOnlyIndices[i];
				xzimgSetActiveIndices(ref arrIndices[0], TrackOnlyIndices.Count);
			}
			
			// Image structure
            ImageIn.m_width = m_WebcamTexture.requestedWidth;
            ImageIn.m_height = m_WebcamTexture.requestedHeight;
            ImageIn.m_colorType = 3;
            ImageIn.m_type = 0;
			ImageIn.m_flippedHorizontaly = true;
			
    		m_data = new Color32[m_WebcamTexture.requestedWidth * m_WebcamTexture.requestedHeight];
			m_PixelsHandle = GCHandle.Alloc(m_data, GCHandleType.Pinned);
            renderer.material.mainTexture = m_WebcamTexture;
		}
    }
    
    void OnDisable() {
		xzimgMarkerRelease();
		m_PixelsHandle.Free();
    }
  
    void Update () {
        if (m_WebcamTexture && m_WebcamTexture.didUpdateThisFrame) {
            m_WebcamTexture.GetPixels32(m_data);


	        // Reset rendering
	        if (RaquetteObject1) {
				Renderer[] renderers = RaquetteObject1.GetComponentsInChildren<Renderer>();
				foreach (Renderer r in renderers) r.enabled = false;
	        }
			if (RaquetteObject2) {
				Renderer[] renderers = RaquetteObject2.GetComponentsInChildren<Renderer>();
				foreach (Renderer r in renderers) r.enabled = false;
			}
			if (FieldObject) {
				Renderer[] renderers = FieldObject.GetComponentsInChildren<Renderer>();
				foreach (Renderer r in renderers) r.enabled = false;
			}


            ImageIn.m_imageData = m_PixelsHandle.AddrOfPinnedObject();
			xzimgMarkerDetect(ref ImageIn, MarkerSize, RecursiveFilter, FilterStrength);
			bool ProtectionFailed = xzimgMarkerGetProtectionAlert();

	        int iNbrOfDetection = xzimgMarkerGetNumber();

	        if (iNbrOfDetection > 0) {
	        
				for (int i = 0; i < iNbrOfDetection; i++) {
					//Put the marker info i into markerInfo
	                xzimgMarkerGetInfoForUnity(i, ref markerInfo);

	                if (RaquetteObject1 && markerInfo.markerID == 866) {
	                    Renderer[] renderer = RaquetteObject1.GetComponentsInChildren<Renderer>();
	                    foreach (Renderer r in renderer) r.enabled = true;
						
						Vector3 position = markerInfo.position;
						Quaternion quat = Quaternion.Euler(markerInfo.euler);
						//If mirror video enabled, invert values
						if (MirrorVideo) {
							quat.y = -quat.y;
							quat.z = -quat.z;
							position.x = -position.x;
						}
						//Put the raquette in the right place.
	                    RaquettePivot1.transform.position = position;
						RaquettePivot1.transform.rotation = quat;
	                }

					if (RaquetteObject2 && markerInfo.markerID == 2388) {
						Renderer[] renderer = RaquetteObject2.GetComponentsInChildren<Renderer>();
						foreach (Renderer r in renderer) r.enabled = true;
						
						Vector3 position = markerInfo.position;
						Quaternion quat = Quaternion.Euler(markerInfo.euler);
						if (MirrorVideo) {
							quat.y = -quat.y;
							quat.z = -quat.z;
							position.x = -position.x;
						}
						RaquettePivot2.transform.position = position;
						RaquettePivot2.transform.rotation = quat;
					}

					if (FieldObject && markerInfo.markerID == 1000) {
						Renderer[] renderer = FieldObject.GetComponentsInChildren<Renderer>();
						foreach (Renderer r in renderer) r.enabled = true;
						
						Vector3 position = markerInfo.position;
						Quaternion quat = Quaternion.Euler(markerInfo.euler);
						if (MirrorVideo) {
							quat.y = -quat.y;
							quat.z = -quat.z;
							position.x = -position.x;
						}
						FieldPivot.transform.position = position;
						FieldPivot.transform.rotation = quat;
					}
	            }
	        }
		}
    }    

    
}

