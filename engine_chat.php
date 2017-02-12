<!DOCTYPE html>
<html> 
<head>
<meta charset="UTF-8" /> 
<link rel="stylesheet" href="./vk_space_chat.css" />

<script src='../games_resources/libs/three.js/build/three.min.js'></script>
<script src='../games_resources/libs/three.js/examples/js/controls/FirstPersonControls.js'></script>
<script src='../games_resources/libs/three.js/examples/js/controls/PointerLockControls.js'></script>
<script src='../games_resources/libs/three.js/examples/js/controls/FlyControls.js'></script>
<script src='../games_resources/libs/three.js/src/extras/THREEx/THREEx.FullScreen.js'></script>
<script src='../games_resources/libs/three.js/src/extras/THREEx/THREEx.KeyboardState.js'></script>
<script src='../games_resources/libs/three.js/src/extras/THREEx/THREEx.WindowResize.js'></script>
<script src='../games_resources/libs/three.js/examples/js/renderers/CSS3DRenderer.js'></script>		 
<script src="../games_resources/libs/jquery.js"></script>
<script src="../games_resources/libs/peer.min.js"></script>

<script src="./vk_space_chat_constants_and_general_functions.js"></script>
<script src="./vk_space_chat_net_messages.js"></script>
<script src="./vk_space_chat.js"></script>
<script src="./vk_space_chat_menu.js"></script>
<script src="./vk_space_chat_users.js"></script>
<script src="./vk_space_chat_visual_keeper.js"></script>
<script src="./vk_space_chat_hint.js"></script>
<script src="./vk_space_chat_body.js"></script>
</head>

<body>

<script>

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;
var StreamObj = null;
var MenuObj = null;
//var MenuObj = new _Menu();

/*
IN json_parms = {
	constraints: {video: true, audio: true},
	onsuccess: this.onSuccessBF,
	onerror: this.onErrorBF
}
*/
function makeRightStreamRequest(json_params)
{
	if(navigator.mediaDevices !== undefined)
	{
		navigator.mediaDevices.getUserMedia(json_params.constraints)
		.then(json_params.onsuccess)
		.catch(json_params.onerror);
	} else
	{
		navigator.getUserMedia(json_params.constraints, 
			json_params.onsuccess,
			json_params.onerror);
	}
}


if (!navigator.getUserMedia) 
{
	alert('Sorry. <code>navigator.getUserMedia()</code> is not available.');
} else {
	makeRightStreamRequest({
		constraints: {video: true, audio: true},
		onsuccess: gotStream,
		onerror: noStream
	});
}

function gotStream(stream) 
{
	StreamObj = stream;
	
	stream.onended = noStream;
	MenuObj = new _Menu();
}

function noStream(e) 
{
	var msg = 'No camera available.';
	if (e.code == 1) 
	{   msg = 'User denied access to use camera.';   }
	//alert(e.code);
}
</script>


<script>
// создаем игру при загрузке приложения			
//var ActivityObj = new _VKSpaceChat();

/*   
navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then(function (stream) 
{
	StreamObj = stream;
	MenuObj = new _Menu();
}		 );
*/

//var MenuObj = new _Menu();

</script>


</body>
</html>

