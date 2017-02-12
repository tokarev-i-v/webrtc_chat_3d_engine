/*
 * Класс описывает объект, на котором будет отображаться запись с web-камеры.
 * Летающая плоскость, на которой будет отображаться картинка с web-камеры;
 * */

var _VisualKeeper = function (json_params)
{	
	this.Geometry = new THREE.PlaneGeometry(100, 100);
	this.Material = null;
	this.UserType = null; // null, USER_TYPES.LOCAL, USER_TYPE.REMOTE
	
	this.Status = "live"; // ("live", "dead")
	
	this.Scene = null;
	this.Camera = null;

	if(json_params !== undefined)
	{
		
		if(json_params.position !== undefined)
		{
			this.Mesh.position.set(json_params.position);
		}

		if(json_params.scene !== undefined)
		{
			this.Scene = json_params.scene;
		}
		if(json_params.camera !== undefined)
		{
			this.Camera = json_params.camera;
		}
		if(json_params.user_type !== undefined)
		{
			this.UserType = json_params.user_type;
		}
		if(json_params.texture !== undefined)
		{
			this.Material = new THREE.MeshBasicMaterial( { map: json_params.texture, overdraw: true, side:THREE.DoubleSide, color: 0xff0000 } );
		}
	}
	
	if(this.Material === null)
	{
		this.Material = new THREE.MeshBasicMaterial();			
	}

	// Для локального игрока
	if(this.UserType === USER_TYPES.LOCAL)
	{
		this.ShipMesh = new THREE.Mesh(this.Geometry, this.Material);		
		this.Mesh = new THREE.Object3D();
		this.Mesh.position.set(0,0,0);
		this.ShipMesh.position.set(0, 0, 0);
		
		this.Camera.position.copy(this.ShipMesh.position);
		
		this.Camera.position.y = this.ShipMesh.position.y + 200;
		this.Camera.position.z = this.ShipMesh.position.z + 400;
		var vec = this.Mesh.getWorldDirection();
		this.Camera.lookAt(this.Mesh.position);
		this.Mesh.add(this.ShipMesh);
		this.Mesh.add(this.Camera);
	}
	// для удаленного игрока
	if(this.UserType === USER_TYPES.REMOTE)
	{
		this.Mesh = new THREE.Mesh(this.Geometry, this.Material);
	}
	
	if(json_params.random !== undefined)
	{
		this.setRandomPosition();
	} else
	{
		this.Mesh.position.set(0,0,0);
	}
	this.Scene.add(this.Mesh);

};

_VisualKeeper.prototype.setRandomPosition = function ()
{
	this.Mesh.position.set(Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200);				
};


// это функция, которая должна вызываться в главной игровой функции
_VisualKeeper.prototype.Life = function ()
{
	if(this.UserType == USER_TYPES.LOCAL)
		this.ShipMesh.geometry.computeBoundingBox();
	else
		this.Mesh.geometry.computeBoundingBox();
	
};

/* Устанавливает позицию корабля
 */ 
_VisualKeeper.prototype.setPosition = function (json_params)
{
	if(typeof(json_params) === "string")
		json_params = JSON.parse(json_params);
	
//	this.Mesh.position.set();	
	this.Mesh.position.copy(json_params);
};
/* Устанавливает поворот корабля в пространстве
 */
_VisualKeeper.prototype.setRotation = function (json_params)
{
	if(typeof(json_params) === "string")
		json_params = JSON.parse(json_params);
		
	this.Mesh.rotation.copy(json_params);
};


/* Возвращает позицию корабля 
 */
_VisualKeeper.prototype.getPosition = function ()
{
	return this.Mesh.position.clone();
};
/* Возвращает поворот корабля
 */
_VisualKeeper.prototype.getRotation = function ()
{
	return this.Mesh.rotation.clone();
};

_VisualKeeper.prototype.getMesh = function ()
{
	return this.Mesh;
};

_VisualKeeper.prototype.removeMesh = function ()
{
	this.Scene.remove(this.Mesh);
};

_VisualKeeper.prototype.setTexture = function (texture)
{
	this.Material = new THREE.MeshBasicMaterial( { map: texture, overdraw: true, side:THREE.DoubleSide, color: 0xff0000 } );
};
/*
 * Устанавливает текстуру и обновляет Mesh.
 */
_VisualKeeper.prototype.setTextureAndUpdateMesh = function (texture)
{
	this.Material = new THREE.MeshBasicMaterial( { map: texture, overdraw: true, side:THREE.DoubleSide, color: 0xff0000 } );

	this.Scene.remove(this.Mesh);	
	var temp_mesh = this.Mesh;
	if(this.UserType == USER_TYPES.LOCAL)
	{
		this.ShipMesh = new THREE.Mesh(this.Geometry, this.Material);		
		this.Mesh.add(this.ShipMesh);
	}else if(this.UserType == USER_TYPES.REMOTE)
	{
		this.Mesh = new THREE.Mesh(this.Geometry, this.Material);
		this.Mesh.position.copy(temp_mesh.position);
	}
	
	this.Scene.add(this.Mesh);
};
