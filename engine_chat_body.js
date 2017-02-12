/*Класс описывает структуру, в которой будут храниться все необходимые данные
 *характеризующие текущую клиентскую сессию!
 */


var _Body = function (json_params)
{
	this.ID = null;
	this.Nickname = null;
	
	this.generateID();
	this.generateNickname();
};

_Body.prototype.setNickname = function (nick)
{
	this.Nickname = nick;
};

_Body.prototype.generateID = function ()
{
	this.ID = generateRandomString(11);
};

_Body.prototype.generateNickname = function ()
{
	this.Nickname = generateRandomString(11);
};

_Body.prototype.getNickname = function ()
{
	return this.Nickname;
};

_Body.prototype.getID = function ()
{
	return this.ID;
};
