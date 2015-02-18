#pragma strict

//paddles variables
var paddle1 : GameObject;
var paddle2 : GameObject;
var paddleHeight : float;
var paddleWidth : float;

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

function Start () {

	ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
	ball.transform.parent = gameObject.Find("PlanePivot").transform.Find("Forme").transform;
	ball.name = "Ball";
	ball.transform.localPosition = Vector3(0, 0, 0); 
	
	ball.renderer.enabled = false;
			
			var field : GameObject = gameObject.Find("PlanePivot").transform.Find("Forme").gameObject;
			var t : Transform = field.transform;
			var size : Vector3 = t.renderer.bounds.size;
 			
			fieldWidth = size.x;
			fieldHeight = size.z;

			Debug.Log("width : "+fieldWidth+" height : "+fieldHeight);
				
	/*paddle1 = gameObject.Find("Paddle1Pivot").transform.Find("Paddle1Object").gameObject;
	paddle2 = gameObject.Find("Paddle2Pivot").transform.Find("Paddle2Object").gameObject;
	
	paddleHeight = paddle1.renderer.bounds.size.z;
	paddleWidth = paddle1.renderer.bounds.size.x;*/
}

function Update () {
	/*if (Input.GetKeyDown(KeyCode.Space) == true) {
		goBall = true;
		}*/

	if (gameObject.Find("PlanePivot").transform.Find("Forme").renderer.isVisible) {
	 	ball.renderer.enabled = true;
	 	//if (goBall) {
	 ballPhysics();
	// }
	 }
	
	
}

function ballPhysics() {

//Origin of the plane frame : 
	D = gameObject.Find("PlanePivot").transform.Find("Forme").renderer.bounds.center;
		
		//Get the position of the ball in the world frame
		var ballposX = ball.transform.position.x;
		var ballposY = ball.transform.position.y;
		var ballposZ = ball.transform.position.z;
		
		//Compute the position of the ball in the plane frame
		var ballposXplane = -D.x + ballposX;
		var ballposYplane = -D.y + ballposY;
		var ballposZplane = -D.z + ballposZ;
		
		// update ball position in the plane frame
        ballposXplane += ballDirX * ballSpeed;
        ballposZplane += ballDirZ * ballSpeed;
        // if ball goes off the 'left' side (Player's side)
        if (ballposXplane <= -fieldWidth/2) {
                // Player1 scores ++
                // update scoreboard in GUI
                // reset ball to center
				//goBall = false;
                resetBall(2);
                //matchScoreCheck();
        }
        // if ball goes off the 'right' side (CPU's side)
        if (ballposXplane >= fieldWidth/2) {      
                // Player2 scores ++
                // update scoreboard GUI
                // reset ball to center
				//goBall = false;
                resetBall(1);
                //matchScoreCheck();
        }
        // if ball goes off the bottom side (side of table)
        if (ballposZplane <= -fieldHeight/2) {
                ballDirZ = -ballDirZ;
        }       
        // if ball goes off the top side (side of table)
        if (ballposZplane >= fieldHeight/2) {
                ballDirZ = -ballDirZ;
        }
        
        Debug.Log("X : "+ballposX);
        
        // limit ball's y-speed to 2x the x-speed
        // this is so the ball doesn't speed from left to right super fast
        // keeps game playable for humans
        if (ballDirX > ballSpeed * 2) {
                ballDirX = ballSpeed * 2;
        }
        else if (ballDirX < -ballSpeed * 2) {
                ballDirX = -ballSpeed * 2;
        }
        
        
        ball.transform.position.x = ballposXplane + D.x;
        ball.transform.position.y = ballposYplane + D.y;
        ball.transform.position.z = ballposZplane + D.z;
     
}

function transformToWorld() {
	
	
	
	
}

function resetBall(loser) {
Debug.Log("reset");
        // position the ball in the center of the table
        ball.transform.position.x = D.x;
        ball.transform.position.y = D.y;
        ball.transform.position.z = D.z;

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
/*
function paddlePhysics() {
	// if ball is aligned with paddle1 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.y <= raquette1.position.y + paddleHeight
	&& ball.position.y >= raquette1.position.y) {
		// and if ball is aligned with paddle1 on y plane
		if (ball.position.x <= raquette1.position.x + paddleWidth/2
		&& ball.position.x >= raquette1.position.x - paddleWidth/2) {
			// and if ball is travelling towards player (-ve direction)
			if (ballDirY < 0) {
				// stretch the paddle to indicate a hit
				raquette1.scale.x *=1.5;
				// switch direction of ball travel to create bounce
				ballDirY = -ballDirY;
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				ballDirX -= raquette1DirY * 0.7;
			}
		}
	}

	// if ball is aligned with paddle2 on x plane
	// remember the position is the CENTER of the object
	// we only check between the front and the middle of the paddle (one-way collision)
	if (ball.position.y >= raquette2.position.y - paddleHeight
	&& ball.position.y <= raquette2.position.y) {
		// and if ball is aligned with paddle2 on y plane
		if (ball.position.x <= raquette2.position.x + paddleWidth/2
		&& ball.position.x >= raquette2.position.x - paddleWidth/2) {
			// and if ball is travelling towards opponent (+ve direction)
			if (ballDirY > 0) {
				// stretch the paddle to indicate a hit
				raquette2.scale.x *= 1.5;	
				// switch direction of ball travel to create bounce
				ballDirY = -ballDirY;
				// we impact ball angle when hitting it
				// this is not realistic physics, just spices up the gameplay
				// allows you to 'slice' the ball to beat the opponent
				ballDirX -= raquette2DirY * 0.7;
			}
		}
	}*/
//}