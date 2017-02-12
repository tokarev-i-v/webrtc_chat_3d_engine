
/* Класс описывает локального игрока.
 * Класс должен ОБЯЗАТЕЛЬНО принять необходимые параметры в формате JSON:
 * {
 *   user_type: type - тип игрока, фиксирован....
 *   all_users: Game.Players, - содержит список удаленных игроков, чтобы отсылать им данные
 *   scene: THREE.Scene(); - объект сцены, в которую нужно будет добавить свой корабль
 * }
 * Пользователи сами обрабатывают медиа-вызовы!
 */  
 
var _LocalUser = function (json_params)
{
	this.onMouseMoveBF = this.onMouseMove.bind(this);
	window.addEventListener("mousemove", this.onMouseMoveBF, false);

	this.onClickBF = this.onClick.bind(this);
	window.addEventListener("click", this.onClickBF, false);
	
	this.setVideoTextureBF = this.setVideoTexture.bind(this);		


	if(json_params !== undefined)
	{
		this.Scene = json_params.scene;
		this.UserType = USER_TYPES.LOCAL;
		this.AllUsers = json_params.all_users;
		this.NetMessagesObject = json_params.net_messages_object;
		this.Camera = json_params.camera;
		this.Body = json_params.body;
		this.Stream = null;
		this.Peer = json_params.peer;
		 
		this.Ship = new _VisualKeeper({scene: this.Scene, camera: this.Camera, user_type: this.UserType});

		if(json_params.stream !== undefined)
		{
			this.Stream = json_params.stream;
			this.setVideoTexture(json_params.stream);
		}else
		{
			makeRightStreamAnswer({
				constraints: {video: true, audio: true},
				onsuccess: this.setVideoTextureBF,
				onerror: function (e) {}
			}); 
		}
		
		this.GameWidth = json_params.game_width;
		this.GameHeight = json_params.game_height;
		
		this.Controls = new THREE.FlyControls(this.Ship.getMesh());
		this.Controls.movementSpeed = 70;
		this.Controls.rollSpeed = Math.PI / 24;
		this.Controls.autoForward = false;
		this.Controls.dragToLook = false;
		
		this.Raycaster = new THREE.Raycaster();
		this.MouseVector = new THREE.Vector2();
		this.INTERSECTED = null;
		
	}else
		console.log(this.constructor.name + " have no json_params!");

};

_LocalUser.prototype.updateVideoTextureData = function ()
{

	if ( this.Video.readyState === this.Video.HAVE_ENOUGH_DATA ) 
	{
		this.VideoImageContext.drawImage( this.Video, 0, 0, this.VideoImage.width, this.VideoImage.height );
		if ( this.VideoTexture ) 
			this.VideoTexture.needsUpdate = true;
	}

};

_LocalUser.prototype.onMouseMove = function (event)
{
	this.MouseVector.x = (event.clientX / this.GameWidth) * 2 - 1;
	this.MouseVector.y = -(event.clientY / this.GameHeight) * 2 + 1;
};

_LocalUser.prototype.onClick = function ()
{
		
};

/*Функция устанавливает параметры для запроса для произведения выстрела 
 * и отправки запроса другим игрокам
 * IN:
 * json_params{
 *  gun_type: type
 * }
 *
 * OUT:
 * ret_params{
 *  distance: json_params.parameters.distance,
 * 	speed: json_params.parameters.speed,
 * 	direction: json_params.direction,
 * 	start_position: json_params.parameters.start_position,
 *	gun_type: "gun_type"			
 * }
 * 
 */

_LocalUser.prototype.setDataParameters = function (json_params)
{
};

/*Вызывается,когда мы должны переслать всем  
 *перемещения/стрельбы и присылает данные об этом
 * MoveMessage | ShootMessage (класс _QBorgGameNetMessages);
 * Локальный игрок не должен принимать данные, он их только отсылает
 * остальным участникам игры;
 */
_LocalUser.prototype.sendDataToAllRemoteUsers = function (message)
{
	if(typeof(message) !== "string")
	{
		message = JSON.stringify(message);
	}
	for(var i=0;i<this.AllUsers[1].length; i++)
	{
		if(this.AllUsers[1][i].ConnectionStatus === "open")
			this.AllUsers[1][i].Connection.send(message);
	}
};

/*Обновляет данные в объекте сообщений, которые будут отправляться другим
 *пользователям при перемещении
 * 
 */
_LocalUser.prototype.updateMessages = function ()
{
	this.NetMessagesObject.setPositionDataFromMesh(this.Ship.getMesh());
};

_LocalUser.prototype.raycastingControl = function ()
{
	this.Raycaster.setFromCamera(this.MouseVector, this.Camera);

	var intersects = this.Raycaster.intersectObjects(this.Scene.children);
	if (intersects.length > 0)
	{
		if(this.INTERSECTED != intersects[0].object)
		{
			if(this.INTERSECTED)
				this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
			this.INTERSECTED = intersects[0].object;
			this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
			
			this.INTERSECTED.material.emissive.setHex(0xff0000);
		}			
	}else
	{
		if (this.INTERSECTED)
			this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
		this.INTERSECTED = null;
	}
	
};

/* Обновляет все необходимые объекты и проводит вычисления
 */
_LocalUser.prototype.update = function ()
{
//	this.raycastingControl();
//	this.updateVideoTextureData();
	this.Ship.Life();
	
	this.Controls.update(0.1);
	this.updateMessages();
	this.sendDataToAllRemoteUsers(this.NetMessagesObject.MoveMessage);
	
};


_LocalUser.prototype.getMesh = function ()
{
	return this.Ship.getMesh();
};

_LocalUser.prototype.getShip = function ()
{
	return this.Ship;
};
_LocalUser.prototype.getStream = function ()
{
	return this.Stream;
};

// Вызывается для установки видеотекстуры игрока.
_LocalUser.prototype.setVideoTexture = function(source)
{
		this.Video = document.createElement("video");
		this.Video.autoplay = 1;
		this.Video.width = 128;
		this.Video.height = 128;
		this.Video.style.visibility = "hidden";
		this.Video.style.float = "left";
		this.Video.src = window.URL.createObjectURL(source);
/*		
		this.VideoImage = document.createElement("canvas");
		this.VideoImage.width = 160;
		this.VideoImage.height = 120;
		this.VideoImage.style.visibility = "hidden";
		this.VideoImage.style.float = "left";

		this.VideoImageContext = this.VideoImage.getContext("2d");
		// background color if no video present
		this.VideoImageContext.fillStyle = "#00FF00";
		this.VideoImageContext.fillRect( 0, 0, this.VideoImage.width, this.VideoImage.height );
*/
		this.VideoTexture = new THREE.VideoTexture( this.Video);
		this.VideoTexture.minFilter = THREE.LinearFilter;
		this.VideoTexture.magFilter = THREE.LinearFilter;
		this.Ship.setTextureAndUpdateMesh(this.VideoTexture);
};

/*
 * It makes calls to all accessed remote users 
*/
_LocalUser.prototype.makeCallsToAllRemoteUsers = function (json_params)
{
	for(var i=0; i<this.AllUsers[1].length; i++)
	{
		this.Peer.call(this.AllUsers[1][i].getPeerID(), this.Stream);
	}
	
};


/* Класс описывает игрока.
 * Класс должен ОБЯЗАТЕЛЬНО принять необходимые параметры в формате JSON:
 * {
 *   net_messages_object: nmo,		
 *   connection: connection, - соединение, из которого будут приходить данные, и в которое будут данные отправляться
 *   scene: THREE.Scene(); - объект сцены, в которую нужно будет добавить свой корабль,
 *   random: true | false
 * }
 * Класс удаленного игрока обрабатывает только входящие сообщения, но НИЧЕГО НЕ ОТСЫЛАЕТ!
 * 
 */

var _RemoteUser = function (json_params)
{
		this.Scene = null;		
		this.Connection = null;
		this.NetMessagesObject = null;
		this.AllUsers = null;
		this.Ship = null;
		this.ConnectionStatus = null;
		this.Nickname = null;
		this.MediaConnection = null;
		this.UserType = USER_TYPES.REMOTE;		
		this.Video = null;
		this.VideoImage = null;
		this.VideoImageContext = null;
		this.VideoTexture = null;
				
	if(json_params !== undefined)
	{
		this.Scene = json_params.scene;		
		this.Connection = json_params.connection;
		this.NetMessagesObject = json_params.net_messages_object;
		this.AllUsers = json_params.all_users;
		
		this.Ship = new _VisualKeeper({scene: this.Scene, random: true, user_type: this.UserType});
		
		this.ID = json_params.id;		
		
	}else
		throw new Error(this.constructor.name + " have no json_params!");
  
	this.onOpenConnectionBF = this.onOpenConnection.bind(this);
	this.Connection.on("open", this.onOpenConnectionBF);
	
	this.onDataRecievedFunc = this.onDataRecieved.bind(this); 
	this.Connection.on("data",  this.onDataRecievedFunc);

	this.onCloseConnectionFunc = this.disconnect.bind(this); 
	this.Connection.on("close", this.onCloseConnectionFunc);  

	this.onConnectionErrorFunc = this.onConnectionError.bind(this); 
	this.Connection.on("error", this.onConnectionErrorFunc);

	this.makeMediaConnectionAnswerBF = this.makeMediaConnectionAnswer.bind(this);
	this.onStreamBF = this.onStream.bind(this);

};

_RemoteUser.prototype.getPeerID = function ()
{
	return this.Connection.peer;
};
/*	This is callback for Peer.js
 */
_RemoteUser.prototype.onCall = function (call)
{
	this.MediaConnection = call;
	alert("from oncall");

	this.makeMediaConnectionAnswer(this.AllUsers[0].getStream());

	this.MediaConnection.on("stream", this.onStreamBF);
	this.MediaConnection.on("close", this.onMediaConnectionCloseBF);
	this.MediaConnection.on("error", this.onMediaConnectionErrorBF);
};
/*
	This function makes answer
 */
_RemoteUser.prototype.makeMediaConnectionAnswer = function (stream)
{
	this.MediaConnection.answer(stream);
};
/*	This function catches stream from remote user 
 */
_RemoteUser.prototype.onStream = function (stream)
{
	this.setVideoTexture(stream);
	alert("it was");
//	this.Video.src = stream;

	this.Video.onerror = function(e) 
	{   
		
		console.log();   
	};
	stream.onended = noStream;
};

_RemoteUser.prototype.onMediaConnectionClose = function ()
{
};
_RemoteUser.prototype.onMediaConnectionError = function ()
{
};


/* при открытии соединения!
 */
_RemoteUser.prototype.onOpenConnection = function()
{
	this.Connection.send(JSON.stringify(this.NetMessagesObject.GetNickNameMessage));
	this.ConnectionStatus = "open";
};

/* завершаем соединение с игроком
 */
_RemoteUser.prototype.disconnect = function()
{
	this.Connection.close();
	this.ConnectionStatus = "closed";
	this.removeShipFromScene();
	console.log("connection was closed");
};

_RemoteUser.prototype.onConnectionError = function(error)
{
	this.disconnect();
	this.ConnectionStatus = "closed";
	this.removeShipFromScene();
	console.log("Had " + error + " on: " +this.constructor.name + ".onConnectionError()");
};

_RemoteUser.prototype.removeShipFromScene = function ()
{
	this.Ship.removeMesh();
};
/*Вызывается, когда удаленный игрок совершает действия типа 
 *перемещения/стрельбы и присылает данные об этом
 * MoveMessage | ShootMessage (класс _QBorgGameNetMessages)
 */  
_RemoteUser.prototype.onDataRecieved = function (json_params)
{
	// преобразуем полученные данные, если они не преобразованы в объект
	if(typeof(json_params) === "string")
	{
		json_params = JSON.parse(json_params);
	}
	
	// если игрок переместился
	if(json_params.request === "move")
	{
		this.Ship.setPosition(json_params.data.position);
		this.Ship.setRotation(json_params.data.rotation);
	} else 
	// если игрок выстрелил
	if(json_params.request === "shoot")
	{
		json_params.data.all_users = this.AllUsers;
		json_params.data.owner_id = this.ID;
		this.Ship.shoot(json_params.data);
	} else 
	// если игрок прислал свой Nickname
	if(json_params.request === "send_nickname")
	{
		this.Nickname = json_params.data.nickname;
		this.ID = json_params.data.id;
	} else 
	// если данный удаленный игрок хочет получить NICKNAME ЛОКАЛЬНОГО ИГРОКА!!!!!!!!!!!!!!!!
	if(json_params.request === "get_nickname")
	{
		this.Nickname = json_params.data.requested_user_nickname;
		this.ID = json_params.data.requested_user_id;
		this.Connection.send(JSON.stringify(this.NetMessagesObject.SendNickNameMessage));
	}
};

_RemoteUser.prototype.update = function ()
{
//	this.updateVideoTextureData();
	this.Ship.Life();
};

_RemoteUser.prototype.updateVideoTextureData = function ()
{

	if(this.Video === null)
	{
		return;
	}
	if ( this.Video.readyState === this.Video.HAVE_ENOUGH_DATA ) 
	{

		this.VideoImageContext.drawImage( this.Video, 0, 0, this.VideoImage.width, this.VideoImage.height );
		if ( this.VideoTexture ) {
			this.VideoTexture.needsUpdate = true;
		}
	}

};

_RemoteUser.prototype.getMesh = function ()
{
	return this.Ship.getMesh();
};

_RemoteUser.prototype.getShip = function ()
{
	return this.Ship;
};
// Вызывается для установки видеотекстуры удаленного игрока.
_RemoteUser.prototype.setVideoTexture = function(source)
{
		this.Video = document.createElement("video");
		this.Video.autoplay = 1;
		this.Video.width = 128;
		this.Video.height = 128;
		this.Video.style.visibility = "hidden";
		this.Video.style.float = "left";
		this.Video.src = window.URL.createObjectURL(source);
/*		
		this.VideoImage = document.createElement("canvas");
		this.VideoImage.width = 160;
		this.VideoImage.height = 120;
		this.VideoImage.style.visibility = "hidden";
		this.VideoImage.style.float = "left";

		this.VideoImageContext = this.VideoImage.getContext("2d");
		// background color if no video present
		this.VideoImageContext.fillStyle = "#00FF00";
		this.VideoImageContext.fillRect( 0, 0, this.VideoImage.width, this.VideoImage.height );
*/
		this.VideoTexture = new THREE.VideoTexture( this.Video);
		this.VideoTexture.minFilter = THREE.LinearFilter;
		this.VideoTexture.magFilter = THREE.LinearFilter;
		this.Ship.setTextureAndUpdateMesh(this.VideoTexture);
};
