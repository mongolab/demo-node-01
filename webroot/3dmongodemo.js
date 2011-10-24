/* 3dmongodemo.js
   
   Portions
   Copyright 2011 ObjectLabs, Corp.
   
   3D Demo derived from GLGE demo.  
   See ./LICENSE file for details.

   Author: Ben Wen
   */

var phraselist;
var textiter = 0;
var doc = new GLGE.Document();

doc.onLoad=function(){

    initphraselist();
    var locXtestiter = locYtestiter = locZtestiter = 0;

    //create the renderer
    var gameRenderer=new GLGE.Renderer(document.getElementById('canvas'));
    gameScene=new GLGE.Scene();
    gameScene=doc.getElement("mainscene");
    gameRenderer.setScene(gameScene);

    var mouse=new GLGE.MouseInput(document.getElementById('canvas'));
    var keys=new GLGE.KeyInput();
    var mouseovercanvas, mousedowncanvas;


    function mouselook(){
	if(mouseovercanvas && mousedowncanvas){
	    var mousepos=mouse.getMousePosition();
	    mousepos.x=mousepos.x-document.getElementById("container").offsetLeft;
	    mousepos.y=mousepos.y-document.getElementById("container").offsetTop;
	    var camera=gameScene.camera;
	    camerarot=camera.getRotation();
	    inc=(mousepos.y-(document.getElementById('canvas').offsetHeight/2))/500;
	    var trans=GLGE.mulMat4Vec4(camera.getRotMatrix(),[0,0,-1,1]);
	    var mag=Math.pow(Math.pow(trans[0],2)+Math.pow(trans[1],2),0.5);
	    trans[0]=trans[0]/mag;
	    trans[1]=trans[1]/mag;
	    camera.setRotX(1.56-trans[1]*inc);
	    camera.setRotZ(-trans[0]*inc);
	    var width=document.getElementById('canvas').offsetWidth;
	    if(mousepos.x<width*0.3){
		var turn=Math.pow((mousepos.x-width*0.3)/(width*0.3),2)*0.005*(now-lasttime);
		camera.setRotY(camerarot.y+turn);
	    }
	    if(mousepos.x>width*0.7){
		var turn=Math.pow((mousepos.x-width*0.7)/(width*0.3),2)*0.005*(now-lasttime);
		camera.setRotY(camerarot.y-turn);
	    }
	}
    }

    function checkkeys(){
	var camera=gameScene.camera;
	camerapos=camera.getPosition();
	camerarot=camera.getRotation();
	var mat=camera.getRotMatrix();
	var trans=GLGE.mulMat4Vec4(mat,[0,0,-1,1]);
	var mag=Math.pow(Math.pow(trans[0],2)+Math.pow(trans[1],2),0.5);
	trans[0]=trans[0]/mag;
	trans[1]=trans[1]/mag;
	var yinc=0;
	var xinc=0;
	if(keys.isKeyPressed(GLGE.KI_W)) {yinc=yinc+parseFloat(trans[1]);xinc=xinc+parseFloat(trans[0]);}
	if(keys.isKeyPressed(GLGE.KI_S)) {yinc=yinc-parseFloat(trans[1]);xinc=xinc-parseFloat(trans[0]);}
	if(keys.isKeyPressed(GLGE.KI_A)) {yinc=yinc+parseFloat(trans[0]);xinc=xinc-parseFloat(trans[1]);}
	if(keys.isKeyPressed(GLGE.KI_D)) {yinc=yinc-parseFloat(trans[0]);xinc=xinc+parseFloat(trans[1]);}
	if(keys.isKeyPressed(GLGE.KI_LEFT_ARROW)) {camera.setRotZ(0.5);}
	if(levelmap.getHeightAt(camerapos.x+xinc,camerapos.y)>30) xinc=0;
	if(levelmap.getHeightAt(camerapos.x,camerapos.y+yinc)>30) yinc=0;
	if(levelmap.getHeightAt(camerapos.x+xinc,camerapos.y+yinc)>30){yinc=0;xinc=0;}
	else{
	    camera.setLocZ(levelmap.getHeightAt(camerapos.x+xinc,camerapos.y+yinc)+8);
	}
	if(xinc!=0 || yinc!=0){
	    camera.setLocY(camerapos.y+yinc*0.05*(now-lasttime));camera.setLocX(camerapos.x+xinc*0.05*(now-lasttime));
	}
    }

    function scopewrapper (i) { // This feels wrong, but I am tired.  Need to keep i in scope of closure.  TODO: Fix this.
	$.get("/getentry", function (data) {
	    phraselist[i].setText(data).html;});
    }

    function updatetext(){
	for (var i = 0; i < phraselist.length; i++) {
	    scopewrapper (i);
	}
        // var testtext = $.get("/getentry", function (data) {
        //     phraselist[0].setText(data).html;});
        // var testtext2 = $.get("/getentry", function (data) {
        //     phraselist[1].setText(data).html;});
    }


    function updatepositions() {
	if (locZtestiter > 190) {
	    updatetext();
            locZtestiter = -20;
        } else {
	    for (var i = 0; i < phraselist.length; i++) {
		phraselist[i].setLocZ(-2 - 3*i + locZtestiter/5);}
            locZtestiter = locZtestiter + beats/4;
        }
    }

    function updatescene(){
	updatepositions();
    }


    levelmap=new GLGE.HeightMap("map.png",120,120,-50,50,-50,50,0,50);


    var frameratebuffer=60;
    start=parseInt(new Date().getTime());
    var now = parseInt(new Date().getTime());
    var lasttime= now - 100; 	// artificial start
    var beats = 1;
    function render(){
	now=parseInt(new Date().getTime()); // in millisec
	frameratebuffer=Math.round(((frameratebuffer*9)+1000/(now-lasttime))/10);
	document.getElementById("debug").innerHTML="Frame Rate:"+frameratebuffer;
	mouselook();
	checkkeys();
	updatescene();
	gameRenderer.render();
	beats = (now - lasttime)/10 // 1 beat = 0.01 sec
	lasttime=now;
    }
    setInterval(render,1);
    var inc=0.2;
    document.getElementById("canvas").onmouseover=function(e){mouseovercanvas=true;}
    document.getElementById("canvas").onmouseout=function(e){mouseovercanvas=false;mousedowncanvas=false;}
    document.getElementById("canvas").onmousedown=function(e){mousedowncanvas=true;}
    document.getElementById("canvas").onmouseup=function(e){mousedowncanvas=false;}

}

//
// Key processing
//

function processkey(event, value) {
    if (event.keyCode == 13) { // Carriage return
 	$.get("/addentry", { "entry": sanitize(value)}, function (data) {
	});
        phraselist[0].setText(value);
	value = ""
    }
    return value;
}

function sanitize(x) {
    // no periods
    var retval = x.replace(/\./g,"");
    retval = retval.substring(0,20);
    return retval;
}

// 
// Init functions
//

function initphraselist() {
    phraselist = new Array();
    phraselist.push(doc.getElement("text1"));
    phraselist.push(doc.getElement("text2"));
    phraselist.push(doc.getElement("text3"));
    phraselist.push(doc.getElement("text4"));
    phraselist.push(doc.getElement("text5"));
    phraselist.push(doc.getElement("text6"));
    phraselist.push(doc.getElement("text7"));
}

function randomFromTo(from, to){
    return Math.floor(Math.random() * (to - from + 1) + from);
}
