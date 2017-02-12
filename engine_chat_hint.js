/*Класс описывает всплывающую подсказку;
 *Использует jQuery;
 */
var _HintObject = function (json_params)
{
	
	this.hideBF = this.hide.bind(this);
	this.HintDiv = json_params.hint_div;
	this.timeout_id = null;
	
	
};

_HintObject

_HintObject.prototype.setText = function (text)
{
	this.HintDiv.innerHTML = text;
};

_HintObject.prototype.show = function (json_params)
{
	if(json_params.text !== undefined)
	{
		this.setText(json_params.text);
	}
	$(this.HintDiv).show();
	setTimeout(this.hideBF, HINT_SHOW_TIME_MSECS);
};

_HintObject.prototype.hide = function ()
{
	$(this.HintDiv).hide();
	this.timeout_id = null;
};
