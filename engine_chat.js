
var _VKSpaceChat = function (json_params) 
{
	this.createUsersByExistingConnectionsBF = this.createUsersByExistingConnections.bind(this);
	this.updateWorkingProcessBF = this.updateWorkingProcess.bind(this);
	this.createUserByRecievedConnectionBF = this.createUserByRecievedConnection.bind(this);
	this.onCallBF = this.onCall.bind(this);
	this.makeCallsToAllRemoteUsersBF = this.makeCallsToAllRemoteUsers.bind(this);		

	// подготовка
	this.Container = document.createElement("div");
	this.Container.setAttribute("id", "MainContainer");
	document.body.appendChild(this.Container);

	this.Scene = new THREE.Scene();

	this.CameraParameters = json_params.camera_parameters;

	this.Camera = new THREE.PerspectiveCamera(this.CameraParameters.ANGLE, 
											  this.CameraParameters.SCREEN_WIDTH/this.CameraParameters.SCREEN_HEIGHT, 
											  this.CameraParameters.NEAR, 
											  this.CameraParameters.FAR
											 );
	
	this.SkyBox = {};
	this.SkyBox.Geometry = new THREE.BoxGeometry(10000, 10000, 10000);
	this.SkyBox.Material = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
	this.SkyBox.Mesh = new THREE.Mesh(this.SkyBox.Geometry, this.SkyBox.Material);
	this.Scene.add(this.SkyBox.Mesh);																						
																						
	this.Renderer = new THREE.WebGLRenderer();
	this.Renderer.setSize(this.CameraParameters.SCREEN_WIDTH, this.CameraParameters.SCREEN_HEIGHT);
	
	this.Container.appendChild(this.Renderer.domElement);
	
	this.Clock = new THREE.Clock();
	
	this.Body = json_params.body;
	
// ВНИМАНИЕ: В игре используется глобальный объект		
	this.NetMessagesObject = new _NetMessages({nickname: this.Nickname, id: this.ID});
	
	// Список удаленных игроков;
	this.RemoteUsers = [];
 
  // Локальный игрок
	this.LocalUser = null;
	/*Все игроки в системе.
	[0] - LocalUser;
	[1] - RemoteUsers - удаленные игроки
  структура, хранящая всех игроков, включая локального;	
	*/
	this.AllUsers = [];

	/*Идентификатор комнаты будет устанавливаться,
		когда пользователь будет в комнате;
	*/
	this.RoomID = null;
	if(json_params.room_id !== undefined)
		this.setRoomID(json_params.room_id);

	this.Peer = json_params.peer;
	// Устанавливаем обработчика событий
	this.Peer.on("connection", this.createUserByRecievedConnectionBF);
	this.Peer.on("call", this.onCallBF);	


		
  this.onOpenInitAndStartGame();
};		


/*Обрабатывает медиапотоки, присылваемые другими пользователями,
 *и присваивает их нужным пользователям!
 */
_VKSpaceChat.prototype.onCall = function (call)
{
	window.alert("FROM VK CALL");
	for(var i=0; i<this.AllUsers[1].length; i++)
	{
		//call.answer(Stream);
		if(this.AllUsers[1][i].getPeerID() === call.peer)
			this.AllUsers[1][i].onCall(call);
	}
};


/* Инициализирует начало работы Peer.js
 */
_VKSpaceChat.prototype.onOpenInitAndStartGame = function (e)
{
	// Локальный игрок, который будет
	this.LocalUser = new _LocalUser({
		scene: this.Scene, 
		all_users: this.AllUsers, 
		net_messages_object: this.NetMessagesObject,
		camera: this.Camera,
		game_width: this.GameWidth,
		game_height: this.GameHeight,
		body: this.Body,
		stream: StreamObj,
		peer: this.Peer
	});
	this.AllUsers.push(this.LocalUser);
	this.AllUsers.push(this.RemoteUsers);

	this.getAndSetInitConnections();

	
	this.startWorkingProcess();

}

/* Важнейшая функция.
 * Создает соединения с пользователями, которые уже
 * находятся в сети.
 * Принимает на вход:
 * json_params: {response: [ids]}
 */
_VKSpaceChat.prototype.createUsersByExistingConnections = function (json_params)
{
	if(json_params === "undefined")
	{
		throw new Error(this.constructor.name + ".createUsersByExistingConnections(json_response) - have no json_response");
		return;
	}
	
	if(typeof(json_params) === "string")
	{
		json_params = JSON.parse(json_params);
	}
	for(var i=0; i<json_params.response.length; i++)
	{
		// на сервере уже будет установлено наше соединение;
		// а сами к себе мы подсоединяться не должны!
		if(this.Peer.id === json_params.response[i])
		{
			continue;
		}
		var conn = this.Peer.connect(json_params.response[i]);
		this.RemoteUsers.push(new _RemoteUser({
				net_messages_object: this.NetMessagesObject,
				all_users: this.AllUsers,
				scene: this.Scene,
				connection: conn
			}));
	}

	this.AllUsers[0].makeCallsToAllRemoteUsers();	
};
/*
 * 
*/
_VKSpaceChat.prototype.makeCallsToAllRemoteUsers = function (stream)
{
	for(var i=0; i<this.AllUsers[1].length; i++)
	{
		this.Peer.call(this.AllUsers[1][i].getPeerID(), stream);
	}
	
};

/* Важнейшая функция игры, в которой происходит управление и обновление всех систем!!
 */

_VKSpaceChat.prototype.updateWorkingProcess = function ()
{
		this.Renderer.render(this.Scene, this.Camera);
		this.LocalUser.update();
		this.updateRemoteUsers();

	  requestAnimationFrame(this.updateWorkingProcessBF);
}

/* Производит обновление телодвижений удаленных игроков.
 */
_VKSpaceChat.prototype.updateRemoteUsers = function ()
{
		for(var j=0; j<this.RemoteUsers.length; j++)
	  	{
			this.RemoteUsers[j].update();
		}
}

_VKSpaceChat.prototype.setRoomID = function(id)
{
	this.RoomID = id;
}

/*
	Получает список находящихся в комнате пользователей,
	и создает с ними соединения.
*/
_VKSpaceChat.prototype.getAndSetInitConnections = function (json_params)
{
	if(this.RoomID === null)
	{
		throw new Error("Problem with room_id in function getAndSetInitConnections");
		return;
	}
	var req_str = SERVER_REQUEST_ADDR  + "/" + REQUESTS.UTOS.COME_INTO_ROOM;
	$.ajax({
		type:"POST",
		url: req_str,
		async: false,
		data: {room_id : this.RoomID, user_id: this.Peer.id},
		success: this.createUsersByExistingConnectionsBF,
		error: function (jqXHR, textStatus, errorThrown) {
			alert(textStatus + " " + errorThrown);
		}
	});
}

/* функция добавляет полученное соединение в массив соединений Connections
 * и сразу отправляет запрос на получение nickname нового игрока
 */
_VKSpaceChat.prototype.createUserByRecievedConnection = function (conn)
{
	alert("Recieved Connection");
	var last_remote_user = new _RemoteUser({
					connection: conn,
					scene: this.Scene,
					all_users: this.AllUsers,
					net_messages_object: this.NetMessagesObject													
	}); 

	this.Peer.call(last_remote_user.getPeerID(), this.AllUsers[0].getStream());
	this.RemoteUsers.push(last_remote_user);
};


/* завершаем соединение с игроком
 */
_VKSpaceChat.prototype.disconnectRemoteUsers = function()
{
	while(this.RemoteUsers.length > 0)
	{
		this.RemoteUsers[this.RemoteUsers.length-1].Conection.close();
		this.RemoteUsers.pop();
	}
};
/*Устанавливает Nickname во всех необходимых структурах
*/
_VKSpaceChat.prototype.setNickname = function (nickname)
{
	this.Nickname = nickname;
	this.NetMessagesObject.setNickname(nickname);
}

_VKSpaceChat.prototype.startWorkingProcess = function ()
{
		requestAnimationFrame(this.updateWorkingProcessBF);	
}
