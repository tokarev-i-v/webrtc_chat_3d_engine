/*Rласс описывает 3D меню.
 *В нем будет находиться текущий корабль игрока и бэкграунд.
 */
var _Menu = function (json_params)
{
		
		/* START OF FUNCTIONS BINDS
	 * */
	this.updateBF = this.update.bind(this);
	this.onNicknameEnteringBF = this.onNicknameEntering.bind(this);
	this.createSelectOptionsByRoomsListBF = this.createSelectOptionsByRoomsList.bind(this);
	this.onRoomSelectBF = this.onRoomSelect.bind(this);
	this.onStartButtonClickBF = this.onStartButtonClick.bind(this);
	this.onConnectionOpenBF = this.onConnectionOpen.bind(this);
		/*END OF FUNCTIONS BINDS
		 */	
	
	
	this.Container = document.createElement("div");
	this.Container.setAttribute("id", "MenuContainer");
	document.body.appendChild(this.Container);
	
	this.CameraParameters = {};
	this.CameraParameters.SCREEN_WIDTH = 900;
	this.CameraParameters.SCREEN_HEIGHT = 650;
	this.CameraParameters.NEAR = 0.1;
	this.CameraParameters.FAR = 10000;
	this.CameraParameters.VIEW_ANGLE = 45;

	
	this.Camera = new THREE.PerspectiveCamera(this.CameraParameters.ANGLE, 
											  this.CameraParameters.SCREEN_WIDTH/this.CameraParameters.SCREEN_HEIGHT, 
										      this.CameraParameters.NEAR, 
											  this.CameraParameters.FAR
											);
	this.Camera.position.set(0,0,700);

	this.Material = new THREE.MeshBasicMaterial();
	
	this.CSSScene = new THREE.Scene();
	this.Scene = new THREE.Scene();
	
	this.Renderer = new THREE.WebGLRenderer();
	this.Renderer.setSize(this.CameraParameters.SCREEN_WIDTH, this.CameraParameters.SCREEN_HEIGHT);
	this.Container.appendChild(this.Renderer.domElement);
	
	
	this.SkyBox = {};
	this.SkyBox.Geometry = new THREE.BoxGeometry(10000, 10000, 10000);
	this.SkyBox.Material = new THREE.MeshBasicMaterial({color: 0x9999ff, side: THREE.BackSide});
	this.SkyBox.Mesh = new THREE.Mesh(this.SkyBox.Geometry, this.SkyBox.Material);
	this.Scene.add(this.SkyBox.Mesh);
	
	this.CSSRenderer = new THREE.CSS3DRenderer();
	this.CSSRenderer.setSize(this.CameraParameters.SCREEN_WIDTH, this.CameraParameters.SCREEN_HEIGHT);
	this.CSSRenderer.domElement.style.position = "absolute";
	this.CSSRenderer.domElement.style.top = 0;
	this.Container.appendChild(this.CSSRenderer.domElement);

	
	this.Inputs = {};
	this.Inputs.Nickname = {};
	this.Inputs.Nickname.ObjHTML = document.createElement("input");
	this.Inputs.Nickname.ObjHTML.type = "text";
	this.Inputs.Nickname.ObjHTML.id = "nickname_input";
	this.Inputs.Nickname.ObjHTML.setAttribute("autofocus", "");
	
	this.Inputs.Nickname.ObjHTML.oninput = this.onNicknameEnteringBF;
	
	this.Inputs.Nickname.Obj3DCSS = new THREE.CSS3DObject(this.Inputs.Nickname.ObjHTML);
	this.Inputs.Nickname.Obj3DCSS.position.x = Math.random();
	this.Inputs.Nickname.Obj3DCSS.position.y = Math.random();
	this.Inputs.Nickname.Obj3DCSS.position.z = Math.random();
	this.CSSScene.add(this.Inputs.Nickname.Obj3DCSS);
	
	
	this.Inputs.StartProgButton = {};
	this.Inputs.StartProgButton.ObjHTML = document.createElement("input");
	this.Inputs.StartProgButton.ObjHTML.type = "button";
	this.Inputs.StartProgButton.ObjHTML.id = "start_button";
	this.Inputs.StartProgButton.ObjHTML.value = "Начать";
	this.Inputs.StartProgButton.ObjHTML.onclick = this.onStartButtonClickBF;	
	

	this.Inputs.StartProgButton.Obj3DCSS = new THREE.CSS3DObject(this.Inputs.StartProgButton.ObjHTML);
	this.Inputs.StartProgButton.Obj3DCSS.position.x = 0;
	this.Inputs.StartProgButton.Obj3DCSS.position.y = -200;
	this.Inputs.StartProgButton.Obj3DCSS.position.z = Math.random();
	this.CSSScene.add(this.Inputs.StartProgButton.Obj3DCSS);
	

	this.checkNicknameRegExp = new RegExp("\\w+");
	
	this.Peer = new Peer({host: PEER_SERVER_ADDR, 
						  port: PEER_PORT_ADDR, 
						  path: PEER_PATH_ADDR,
						  debug: true
											});

	this.Body = new _Body();

	this.RoomID = null;

	if(GAME_ROOM_MODE === ROOM_MODE.SINGLE)
	{
		this.initSingleRoomMode();
	} else
	{
		this.initMultiRoomMode();
	}

		 
	this.Peer.on("open", this.onConnectionOpenBF);
	this.Peer.on("error", function (err) {
		window.alert(1);
	});
	this.updateBF();
};

_Menu.prototype.onConnectionOpen = function ()
{
	this.ConnectionStatus = CONNECTION_IS_OPEN;
};

_Menu.prototype.update = function ()
{
	this.Renderer.render(this.Scene, this.Camera);
	this.CSSRenderer.render(this.CSSScene, this.Camera);
	
	this.Inputs.StartProgButton.Obj3DCSS.rotation.y += 0.005;
	
	requestAnimationFrame(this.updateBF);
};
/*Инициализация при многокомнатном режиме*/
_Menu.prototype.initMultiRoomMode = function ()
{
	this.Inputs.RoomsListSelect = {};
	this.Inputs.RoomsListSelect.ObjHTML = document.createElement("select");
	this.Inputs.RoomsListSelect.ObjHTML.id = "rooms_list_select";
	this.Inputs.RoomsListSelect.ObjHTML.onclick = this.onRoomSelectBF;

	this.Inputs.RoomsListSelect.Obj3DCSS = new THREE.CSS3DObject(this.Inputs.RoomsListSelect.ObjHTML);
	this.Inputs.RoomsListSelect.Obj3DCSS.position.x = 400;
	this.Inputs.RoomsListSelect.Obj3DCSS.position.y = 300;
	this.Inputs.RoomsListSelect.Obj3DCSS.position.z = 0;
	this.CSSScene.add(this.Inputs.RoomsListSelect.Obj3DCSS);
	
	this.setRoomsList();
	
};

/*Инициализация при однокомнатном режиме*/
_Menu.prototype.initSingleRoomMode = function ()
{
	this.RoomID = DEFAULT_ROOM_ID;
};
/*Делает запрос на 
 */
_Menu.prototype.setRoomsList = function ()
{
	this.sendServerRequest({
		request_type: REQUESTS.UTOS.GET_ROOMS_LIST,
		success_func: this.createSelectOptionsByRoomsListBF
	});
};

/*Создает нужное количетсво option's
 * и добавлят в select;
 * Доступно только в MULTI_ROOMS режиме!!!
	IN: json_params = response: {
	* 	room_id,	// идентификатор комнаты
	* 	users_count, // количетсво участников
	*   room_name // имя комнаты
	* }
*/
_Menu.prototype.createSelectOptionsByRoomsList = function (json_params)
{
	if(typeof(json_params) === "string")
		json_params = JSON.parse(json_params);

	for(var i=0; i<json_params.rooms.length; i++)
	{
		var opt = document.createElement("option");
		opt.innerHTML = json_params.rooms[i].room_name;
		opt.value = json_params.rooms[i].room_id;
		this.Inputs.RoomsListSelect.ObjHTML.appendChild(opt);
	}
	
	this.Inputs.RoomsListSelect.ObjHTML.size = json_params.rooms.length;
};

_Menu.prototype.onRoomSelect = function ()
{
	
};

/* Отправляет запросы и обрабатывает ответы.
	* Формирует из параметров строку запроса и отправляет запрос на сервер.
	IN: json_params = Room{
	* 	request_type, // тип запроса, параметров не требует
	* 	success_func[, // функция, которая будет вызвана
	* 	data, // даннные. если есть. Не обязательны для некоторых запросов 
	* 	]
	* }
*/
_Menu.prototype.sendServerRequest = function (json_params)
{

	req_obj = {};
	if(json_params.request_type === undefined)
	{
			throw new Error("PROBLEM WITH sendServerRequest");
	}	
	if(json_params.success_func === undefined)
	{
			throw new Error("PROBLEM WITH sendServerRequest");
	}
	if(json_params.data !== undefined)
	{
			req_obj.data = json_params.data
	}
	req_str = SERVER_REQUEST_ADDR;
	req_str += "/" + json_params.request_type + "/";
	
	req_obj.type = "POST";
	req_obj.url	= req_str;	
	req_obj.async = false;
	req_obj.success = json_params.success_func;
	
	$.ajax(req_obj);

};

_Menu.prototype.hasSelectedRoom = function ()
{
	if(GAME_ROOM_MODE === ROOM_MODE.SINGLE)
	{
		return true;
	}	else
	{
		///////////////////////////////////
		//////////////////////////////////
		////СДЕЛАТЬ ПРОВЕРКУ НА ВЫБОР ОДНОЙ ИЗ КОМНАТ!
	}
};

_Menu.prototype.canStart = function ()
{
	if(this.Inputs.Nickname.ObjHTML.value.length === 0)
	{
		return false;
	}
	if(this.hasSelectedRoom() !== true)
	{
		return false;
	}
	if(this.ConnectionStatus !== CONNECTION_IS_OPEN)
	{
		return false;
	}
	
	this.Body.setNickname(this.Inputs.Nickname.ObjHTML.value);
	return true;
};

/*Обрабатывает нажатие на кнопку запуска чата
 *Так же производит копирование в тело никнейма пользователя.
 *В дальнейшем из тела будут читаться данные ID, Nickname
 */
_Menu.prototype.onStartButtonClick = function ()
{
	if(this.canStart() === true)
	{
		this.SpaceChat = new _VKSpaceChat({
				room_id: this.RoomID,
				camera_parameters: this.CameraParameters,
				peer: this.Peer,
				body: this.Body
			});
	}
};


/*проверка на правильность вводимых символов*/
_Menu.prototype.onNicknameEntering = function ()
{
		if((this.Inputs.Nickname.ObjHTML.value.charAt(this.Inputs.Nickname.ObjHTML.value.length-1)).match(this.checkNicknameRegExp) === null)
		{			
			this.onErrorNicknameEntering();
		}else if(this.Inputs.Nickname.ObjHTML.value.length > MAX_NICKNAME_LENGTH)
		{
			this.onNicknameMaxLength();
		}else
		{
			this.onRightNicknameEntering();
		}
};

_Menu.prototype.onNicknameMaxLength = function ()
{
	this.Inputs.Nickname.ObjHTML.value = this.Inputs.Nickname.ObjHTML.value.slice(0, this.Inputs.Nickname.ObjHTML.value.length-1);
};


_Menu.prototype.onErrorNicknameEntering = function ()
{
	this.Inputs.Nickname.ObjHTML.value = this.Inputs.Nickname.ObjHTML.value.slice(0, this.Inputs.Nickname.ObjHTML.value.length-1);
	this.Inputs.Nickname.ObjHTML.style.border = "5px solid red";
};

_Menu.prototype.onRightNicknameEntering = function ()
{
	this.Inputs.Nickname.ObjHTML.style.border = "5px solid green";
};
