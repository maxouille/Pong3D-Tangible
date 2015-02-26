#pragma strict

//paddles variables
var paddle1 : GameObject;
var paddle2 : GameObject;
var paddleHeight : float;
var paddleWidth : float;
var paddle1DirZ = 0;


//field variables
var fieldHeight : float;
var fieldWidth : float;
var field : GameObject;

//ball variables
var ball : GameObject;
var ballDirX : float = 0.1;
var ballDirZ : float = 0.1;
var ballSpeed : float = 0.1;
var goBall : boolean = true;

var D : Vector3;
var Forme : GameObject;

function Start () {
	
	Forme = gameObject.Find("PlanePivot").transform.Find("Forme").gameObject;

	ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
	ball.transform.parent = Forme.transform;
	ball.name = "Ball";
	ball.transform.localScale = new Vector3(0.1,0.1,0.1);
	ball.transform.localPosition = Vector3(0, 0, 0);
	
	ball.renderer.enabled = false;
			
			var t : Transform = Forme.transform;
			var size : Vector2 = gameObject.Find("Main Camera").GetComponent(meshPlane).size;
 			
			fieldWidth = size.x;
			fieldHeight = size.y;

			//Debug.Log("width : "+fieldWidth+" height : "+fieldHeight);
				
	paddle1 = gameObject.Find("PlanePivot").transform.Find("Forme").transform.Find("FormePaddle1").gameObject;
	paddle2 = gameObject.Find("PlanePivot").transform.Find("Forme").transform.Find("FormePaddle2").gameObject;
	
	paddleHeight = gameObject.Find("Main Camera").GetComponent(meshParallelepipoid).height * paddle1.transform.localScale.y;
	paddleWidth = gameObject.Find("Main Camera").GetComponent(meshParallelepipoid).width * paddle1.transform.localScale.x;
}

function Update () {
	/*if (Input.GetKeyDown(KeyCode.Space) == true) {
		goBall = true;
		}*/

	if (Forme.renderer.isVisible) {
	 	ball.renderer.enabled = true;
	 	//if (goBall) {
	 ballPhysics();
	 paddlePhysics();
	// }
	 }
	
	
}

function ballPhysics() {

		// update ball position in the plane frame
        ball.transform.localPosition.x += ballDirX * ballSpeed;
        ball.transform.localPosition.z += ballDirZ * ballSpeed;
        // if ball goes off the 'left' side (Player's side)
        if (ball.transform.localPosition.x <= -fieldWidth/2) {
                // Player1 scores ++
                // update scoreboard in GUI
                // reset ball to center
				//goBall = false;
                resetBall(2);
                //matchScoreCheck();
        }
        // if ball goes off the 'right' side (CPU's side)
        if (ball.transform.localPosition.x >= fieldWidth/2) {      
                // Player2 scores ++
                // update scoreboard GUI
                // reset ball to center
				//goBall = false;
                resetBall(1);
                //matchScoreCheck();
        }
        // if ball goes off the bottom side (side of table)
        if (ball.transform.localPosition.z <= -fieldHeight/2) {
                ballDirZ = -ballDirZ;
        }       
        // if ball goes off the top side (side of table)
        if (ball.transform.localPosition.z >= fieldHeight/2) {
                ballDirZ = -ballDirZ;
        }
        
        //Debug.Log("Local : X : "+ball.transform.localPosition.x+" Y : "+ball.transform.localPosition.y+" Z : "+ball.transform.localPosition.z);
        //Debug.Log("Global : X : "+ball.transform.position.x+" Y : "+ball.transform.position.y+" Z : "+ball.transform.position.z);
        
        // limit ball's y-speed to 2x the x-speed
        // this is so the ball doesn't speed from left to right super fast
        // keeps game playable for humans
        if (ballDirX > ballSpeed * 2) {
                ballDirX = ballSpeed * 2;
        }
        else if (ballDirX < -ballSpeed * 2) {
                ballDirX = -ballSpeed * 2;
        }    
}

function resetBall(loser) {
        // position the ball in the center of the table
        ball.transform.localPosition.x = 0;
        ball.transform.localPosition.y = 0;
        ball.transform.localPosition.z = 0;

        // if player lost the last point, we send the ball to opponent
        if (loser == 1) {
                ballDirX = -0.1;
        }
        // else if opponent lost, we send ball to player
        else {
                ballDirX = 0.1;
        }

        // set the ball to move towards the top of the plane
        ballDirZ = 0.1;
}

function paddlePhysics() {

	var ballPosition = ball.transform.localPosition;
	var paddle1Position = paddle1.transform.localPosition;
	var paddle2Position = paddle2.transform.localPosition;
	// if ball is aligned with paddle1 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ballPosition.x <= paddle1Position.x + paddleHeight
	&& ballPosition.y >= paddle1Position.x) {
		// and if ball is aligned with paddle1 on y plane
		if (ballPosition.z <= paddle1Position.z + paddleWidth/2
		&& ballPosition.z >= paddle1Position.z - paddleWidth/2) {
			// and if ball is travelling towards player (-ve direction)
			if (ballDirX < 0) {
				// stretch the paddle to indicate a hit
				//raquette1.scale.x *=1.5;
				// switch direction of ball travel to create bounce
				ballDirX = -ballDirX;
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				ballDirZ = -ballDirZ;
			}
		}
	}

	// if ball is aligned with paddle2 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ballPosition.x >= paddle2Position.x - paddleHeight
	&& ballPosition.x <= paddle2Position.x) {
		// and if ball is aligned with paddle2 on y plane
		if (ballPosition.z <= paddle2Position.z + paddleWidth/2
		&& ballPosition.z >= paddle2Position.z - paddleWidth/2) {
			// and if ball is travelling towards opponent (+ve direction)
			if (ballDirX > 0) {
				// stretch the paddle to indicate a hit
				//raquette2.scale.x *= 1.5;	
				// switch direction of ball travel to create bounce
				ballDirX = -ballDirX;
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				ballDirZ = -ballDirZ;
			}
		}
	}
}