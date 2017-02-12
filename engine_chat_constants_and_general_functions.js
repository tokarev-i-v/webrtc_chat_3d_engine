
var	ROOM_MODE = {};
		ROOM_MODE.SINGLE = 0;
		ROOM_MODE.MULTI = 1;

var USER_TYPES = {};
		USER_TYPES.LOCAL = 0;
		USER_TYPES.REMOTE = 1;

var GAME_ROOM_MODE = ROOM_MODE.SINGLE;

var HINT_SHOW_TIME_MSECS = 3000;

var MAX_NICKNAME_LENGTH = 15;


var PEER_SERVER_ADDR = "www.polyzer.org";
var PEER_PORT_ADDR = "9002";
var PEER_PATH_ADDR = "/vk_space_chat";
var SERVER_REQUEST_ADDR = "https://" + PEER_SERVER_ADDR + ":" + PEER_PORT_ADDR;

var MAX_ROOM_USERS = 100; // максимум человек в комнате;

var MIN_ROOMS_COUNT = 1; // минимальное количество комнат;


/*Значения, возвращаемые сообщениями;*/
var MESSAGE_RESULT_OK = 0;
var MESSAGE_RESULT_ERROR = 1;


/*Значения, определяющие статус */
var NICKNAME_STATUS_OK = 0; // если верно
var NICKNAME_STATUS_ERROR = 1; // если косяк
var NICKNAME_STATUS_EMPTY = 2; // если пустой

var DEFAULT_ROOM_ID = "Default";

var CONNECTION_IS_OPEN = 0;
var CONNECTION_ERROR = 1;


/*Подсказки */
var HINT_STATUS = {};
		HINT_STATUS.ERROR = 0;
		HINT_STATUS.WARNING = 1;
		HINT_STATUS.DEFAULT = 2;

/*Типы запросов */
var REQUESTS = {};
		
		REQUESTS.UTOS = {}
		REQUESTS.UTOS.COME_INTO_ROOM = "come_into_room";
		REQUESTS.UTOS.GET_ROOMS_LIST = "get_rooms_list";
		REQUESTS.UTOS.LEAVE_ROOM = "leave_room";
		REQUESTS.UTOS.CREATE_ROOM = "create_room";


/* генерирует рандомную строку заданной длины
 */
function generateRandomString(len)
{
	var text = [];
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	if((len !== undefined) && (len > 0)){
		for(var i=0; i<len; i++)
			text.push(possible.charAt(Math.floor(Math.random() * possible.length)));
	}
	text = text.join("");
	return text;
}


if(typeof(exports) !== "undefined")
{
	exports.ROOM_MODE = ROOM_MODE;
	exports.GAME_ROOM_MODE = GAME_ROOM_MODE;
	exports.PEER_SERVER_ADDR = PEER_SERVER_ADDR;
	exports.PEER_PORT_ADDR = PEER_PORT_ADDR;
	exports.PEER_PATH_ADDR = PEER_PATH_ADDR;
	exports.MAX_ROOM_USERS = MAX_ROOM_USERS; // максимум человек в комнате;
	exports.REQUESTS = REQUESTS;

	exports.PEER_PORT_ADDR = PEER_PORT_ADDR;
	exports.DEFAULT_ROOM_ID = DEFAULT_ROOM_ID;
}
