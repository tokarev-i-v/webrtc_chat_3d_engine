
/* Объект содержит сообщения, которые должны пересылаться между игроками
 * IN:
 * json_params = {
 * 	nickname,
 * 	id,
 * }
 * 
 * UtoU - от юзера к юзеру
 * UtoS - от юзера к серверу
 */
var _NetMessages = function (json_params)
{
this.MoveMessage = {};
	this.MoveMessage.request = "move";
	this.MoveMessage.data = 
	{
		position: {x:0, y:0, z:0}, // Mesh.position.clone();
		rotation: {x:0, y:0, z:0}, // Mesh.rotation.clone();
	};
	
	this.ShootMessage = {};
	this.ShootMessage.request = "shoot";
	this.ShootMessage.data = 
	{
		distance: 0,
		speed: 0,
		direction: {x:0,y:0,z:0},
		start_position: {x:0,y:0,z:0},
		gun_type: "",
		bullet_type: "",
		damage: 0 				
	};
	/*Это сообщение должно отправляться для того, чтобы получить nickname'ы
	 * уже существующих игроков!
	 */ 
	this.GetNickNameMessage = {};
	this.GetNickNameMessage.request = "get_nickname";
	this.GetNickNameMessage.data = {
		requested_user_nickname: json_params.nickname,
		requested_user_id: json_params.id
	};
	/*Это сообщение должно отправляться только в ответ на запрос "get_nickname";
	*/ 
	this.SendNickNameMessage = {};
	this.SendNickNameMessage.request = "send_nickname";
	this.SendNickNameMessage.data = 
	{
		nickname: json_params.nickname,
		id: json_params.id
	};

};

_NetMessages.prototype.setNickname = function (json_params)
{
	this.GetNickNameMessage.data.requested_user_nickname = json_params.nickname;
	this.SendNickNameMessage.data.nickname = json_params.nickname;
};

_NetMessages.prototype.setID = function (json_params)
{
	this.GetNickNameMessage.data.requested_user_id = json_params.id;
	this.SendNickNameMessage.data.id = json_params.id;
};

/* Устанавливает новые о позиции корабля в пространстве, которые затем будут отправлены остальным пользователям;
 */

_NetMessages.prototype.setPositionDataFromMesh = function (mesh_object)
{
	this.MoveMessage.data.position = mesh_object.position.clone();
	this.MoveMessage.data.rotation = mesh_object.rotation.clone();
};

_NetMessages.prototype.setDataForGetRoomsRequest = function (json_params)
{
}
