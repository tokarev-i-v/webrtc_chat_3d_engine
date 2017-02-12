var express = require("express");
var ExpressPeerServer = require("peer").ExpressPeerServer;
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: false});
var jsonParser = bodyParser.json();

var const_and_funcs = require("./vk_space_chat_constants_and_general_functions.js");
var app = express();
var server = app.listen(const_and_funcs.PEER_PORT_ADDR);

var options = {
	debug: true
};

var peerServer = ExpressPeerServer(server, options);
app.use(const_and_funcs.PEER_PATH_ADDR, peerServer);
app.use(jsonParser);
app.use(urlencodedParser);

/*
 * Класс описывает комнату, в которой будут находиться до max значения человек
 *
 * PlayersIDSArray - содержит список ID's всех игроков;
 * LevelType - описывает тип комнаты;
 * RoomID - идентификатор комнаты;
 * MaxPlayersCount - максимальное число игроков для данной комнаты;
 */
var _Room = function (json_params)
{
	this.UsersIDSArray = [];
	this.RoomType = 0;
	this.MaxPlayersCount = 20;
	this.RoomID = const_and_funcs.DEFAULT_ROOM_ID;
	this.RoomName = "DefaultName";
};

/* Теперь ids содержит список неопределившихся пользователей,
 * Который никуда не должен передаваться.
 */
var UndecidedIDs = [];
/*Массив содержит массив комнат;
 */
var Rooms = [];
var DefaultRoom = new _Room();
Rooms.push(DefaultRoom);

/* SINGLEROOM_FUNCTIONS DEFINITIONS
 * ////////////////////////////////////////////////////////////////////
 */
function SingleRoom_onDisconnect(id)
{
	for(var i=0; i<UndecidedIDs.length;  i++)
	{
		if(UndecidedIDs[i] === id)
		{
			UndecidedIDs.splice(i, 1);
			console.log("was spliced from UndecidedIDs: " + id);
			return;
		}
	}
	
	for(var i=0; i<Rooms[0].UsersIDSArray.length; i++)
	{
		if(Rooms[0].UsersIDSArray[i] === id)
		{
			Rooms[0].UsersIDSArray.splice(i, 1);
			console.log("was spliced from Rooms[0].UsersIDSArray: " + id);
			return;
		}
	}
	
};

function SingleRoom_onConnect(id)
{
	UndecidedIDs.push(id);
	console.log("was add to UndecidedIDs: " + id);	
};

function SingleRoom_onGetRoomsList(req, res)
{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  
	res.send(JSON.stringify({response: Rooms}));
};

function SingleRoom_onComeIntoRoom(req, res)
{
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  console.log("Come INTO ROOM");
  for(var i=0; i<Rooms.length; i++)
  {
		if(Rooms[i].RoomID === req.body.room_id)
		{
			res.send(JSON.stringify({response: Rooms[i].UsersIDSArray})); 
			Rooms[i].UsersIDSArray.push(req.body.user_id);			
			console.log("id: " + req.body.user_id + " was add to DefaultRoom");
			for (var j=0; j < UndecidedIDs.length; j++)
			{
				if(UndecidedIDs[j] === req.body.user_id)
				{
					UndecidedIDs.splice(j, 1);
					return;
				}
			}
			throw new Error("problem in SingleRoom_onComeIntoRoom: have no user in UndecidedIDs!!!");
		}
	}
	
	throw new Error("problem in SingleRoom_onComeIntoRoom: have no room with requested id!!!");

}

function SingleRoom_onLeaveRoom(req, res)
{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  

	for(var i=0; i<Rooms[0].UsersIDSArray.length; i++)
	{
		if(Rooms[0][i] === req.query.user_id)
		{
			Rooms[0].UsersIDSArray.splice(i, 1);
			UndecidedIDs.push(req.query.user_id);
			return;
		}
	}
}

function SingleRoom_onCreateRoom(req, res)
{
}



/* MULTIROOM_FUNCTIONS
 * ////////////////////////////////////////////////////////////
 */
function MultiRoom_onDisconnect(id)
{
	for(var i=0; i<UndecidedIDs.length;  i++)
	{
		if(UndecidedIDs[i] === id)
		{
			UndecidedIDs.splice(i, 1);
			console.log("was spliced from UndecidedIDs: " + id);
			return
		}
	}
	
	for(var i=0; i<Rooms.length; i++)
	{
		for(var j=0; j<Rooms[i].UsersIDSArray.length; j++)
		{
			/*Если нашли совпадение id'шников*/
			if(Rooms[i].UsersIDSArray[j] === id)
			{
				Rooms[i].UsersIDSArray.splice(j, 1);
				return;
			}
			
		}
	}
}

function MultiRoom_onConnect(id)
{
	UndecidedIDs.push(id);
	console.log("was pushed: " + id);
}

/* OUT: 
 * response: {
			room_id,
			users_count, 
			room_name,
 * 
 * }
 */
function MultiRoom_onGetRoomsList(req, res)
{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  
  answer = [];
  for(var i=0; i<Rooms.length; i++)
  {
		answer.push({
			room_id: Rooms[i].RoomID, 
			room_name: Rooms[i].RoomName
		});
	}
	res.send(JSON.stringify({"rooms": answer}));
}

function MultiRoom_onComeIntoRoom(req, res)
{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
	   
  for(var i=0; i<Rooms.length; i++)
  {
		if(Rooms[i].RoomID === req.body.room_id)
		{
			res.send(JSON.stringify({response: Rooms[i].UsersIDSArray})); 
			Rooms[i].UsersIDSArray.push(req.body.user_id);			
			for (var j=0; j < UndecidedIDs.length; j++)
			{
				if(UndecidedIDs[j] === req.body.user_id)
				{
					UndecidedIDs.splice(j, 1);
					return;
				}
			}
			throw new Error("problem in MultiRoom_onComeIntoRoom: have no user in UndecidedIDs!!!");
		}
	}	
	throw new Error("problem in MultiRoom_onComeIntoRoom: have no room with requested id!!!");
}

/*Удаляет пользователя из комнаты;
 *Добавляет его в список неопределившихся пользователей UndecidedIDs;
 *Проверяет комнату на пустоту;
 */
function MultiRoom_onLeaveRoom(req, res)
{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  send();

	for(var i=0; i<Rooms.length; i++)
	{
		if(Rooms[i].RoomID === req.body.room_id)
		{
			for(var j=0; j<Rooms[i].UsersIDSArray.length; j++)
			{
				/*Если нашли совпадение id'шников*/
				if(Rooms[i].UsersIDSArray[j] === req.body.user_id)
				{
					Rooms[i].UsersIDSArray.splice(j, 1);
					if((Rooms[i].UsersIDSArray.length === 0) && (Rooms[i].UsersIDSArray.RoomID !== DefaultRoom.RoomID))
					{
						Rooms.splice(i, 1);
					}
				}	
			}
		}
	}
}

function MultiRoom_onCreateRoom(req, res)
{
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
  //res.contentType('json');
	res.send(JSON.stringify({response: ids}));
}

var ServiceFunctions = {};

if(const_and_funcs.GAME_ROOM_MODE === const_and_funcs.ROOM_MODE.SINGLE)
{
	ServiceFunctions.onConnect = SingleRoom_onConnect;
	ServiceFunctions.onDisconnect = SingleRoom_onDisconnect;
	ServiceFunctions.onGetRoomsList = SingleRoom_onGetRoomsList;
	ServiceFunctions.onComeIntoRoom = SingleRoom_onComeIntoRoom;
	ServiceFunctions.onLeaveRoom = SingleRoom_onLeaveRoom;
	ServiceFunctions.onCreateRoom = SingleRoom_onCreateRoom;
} else
{
	ServiceFunctions.onConnect = MultiRoom_onConnect;
	ServiceFunctions.onDisconnect = MultiRoom_onDisconnect;
	ServiceFunctions.onGetRoomsList = MultiRoom_onGetRoomsList;
	ServiceFunctions.onComeIntoRoom = MultiRoom_onComeIntoRoom;
	ServiceFunctions.onLeaveRoom = MultiRoom_onLeaveRoom;
	ServiceFunctions.onCreateRoom = MultiRoom_onCreateRoom;
}
/*Запрос на получение списка всех комнат*/
app.post("/" + const_and_funcs.REQUESTS.UTOS.GET_ROOMS_LIST, ServiceFunctions.onGetRoomsList);
/*Запрос на вход в комнату
 *Должен вернуть список idшников игроков, которые в ней находятся. */
app.post("/" + const_and_funcs.REQUESTS.UTOS.COME_INTO_ROOM, ServiceFunctions.onComeIntoRoom);
/*Если пользователь решил выйти из в основное меню*/
app.post("/" + const_and_funcs.REQUESTS.UTOS.LEAVE_ROOM, ServiceFunctions.onLeaveRoom);
/*Запрос на создание новой комнаты*/
app.post("/" + const_and_funcs.REQUESTS.UTOS.CREATE_ROOM, ServiceFunctions.onCreateRoom);
/*При создании соединения, игрок автоматически добавляеся в список
 *неопределившихся игроков;
 **/
peerServer.on("connection", ServiceFunctions.onConnect);
/*При ризрыве соединения, выходит, что пользователь полностью покинул игру;
 *Должен быть автоматически удален из всех структур, в которых он содержится;
 **/
peerServer.on("disconnect", ServiceFunctions.onDisconnect);
