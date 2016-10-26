 

var game = null;
 
function StartGame()
{
	game = new Game();
}

function addEntity(entity)
{
	for(var  i = -1; i <= 1; i++)
	{
		for(var  j = -1; j <= 1; j++)
		{
			var gx = (Math.floor(entity.x / game.gridSize) + i);
			var gy = (Math.floor(entity.y / game.gridSize) + j);
			var dx = entity.x - gx * game.gridSize;
			var dy = entity.y - gy * game.gridSize;
			
			//distance from cell
			var r = (game.gridSize/2 + Math.max(8, entity.radius)); 
			if(dx * dx + dy * dy <= r * r)
			{
				var key = gx + "," + gy;
				if(game.space[key] == undefined)
					game.space[key] = [];
				
				game.space[key].push(entity);
			}
		}
	}
}


function updateEntity(entity, oldX, oldY)
{
	for(var  i = -1; i <= 1; i++)
	{
		for(var  j = -1; j <= 1; j++)
		{
			var gx = (Math.floor(oldX / game.gridSize) + i);
			var gy = (Math.floor(oldY / game.gridSize) + j); 
			var dx = oldX - gx * game.gridSize;
			var dy = oldY - gy * game.gridSize;
			
			//distance from cell
			var r = (game.gridSize/2 + Math.max(8, entity.radius)); 
			if(dx * dx + dy * dy <= r * r)
			{
				var key = gx + "," + gy; 
				var list = game.space[key];
				 
				var index = list.indexOf(entity);
				if(index > -1)
					 game.space[key].splice(index, 1);
				  
			}
		}
	}
	addEntity(entity);
}
	 
	
function Entity(x, y, radius, xspeed, yspeed)
{
	game.entities.push(this);
	this.id = Math.round(Math.random()*1000);
	this.x = x;
	this.y = y;
	this.sx = (xspeed != undefined) ? xspeed : (-3 + Math.random() * 3);
	this.sy = (yspeed != undefined) ? yspeed : (-3 + Math.random() * 3);
	this.sxNew = this.sx;
	this.syNew = this.sy;
	this.radius = (radius != undefined)? radius : 8 + Math.random() * 32; 
	this.mass =  Math.PI * this.radius * this.radius * this.radius;
	this.charge = Math.random() > 0.5 ? 1 : -1;  
	this.drag = false;
 
	 addEntity(this);
	 
	this.Compute = function(e)
	{
		dx = this.x - e.x;
		dy = this.y - e.y;
		r = Math.sqrt(dx * dx + dy * dy);
		var p = this.radius + e.radius - r;
		
		r2 = r * r;
		if(r == 0)
			return;
		nx = dx / r;
		ny = dy / r;
		if(p > 0)
		{ 
			//fix position
			var ratio = e.mass / (e.mass + this.mass);									
			this.x += p * ratio * nx;									
			this.y += p * ratio * ny;
			
			//calculate collision							
			dot = (this.sx - e.sx) * dx + (this.sy - e.sy) * dy;
			var f = 2 * e.mass / (this.mass + e.mass) * dot / r2;
			this.sxNew = this.sx - f * dx * 0.8;
			this.syNew = this.sy - f * dy * 0.8;
		}
		else
		{
			var chargeSign = this.charge * (-e.charge);
			this.sxNew -= 0.001 * nx * e.mass * chargeSign / r2;
			this.syNew -= 0.001 * ny * e.mass * chargeSign/ r2;
		}
	}
	this.Update = function()
	{ 
		var dx = 0;
		var dy = 0;
		var nx = 0;
		var ny = 0;
		var dot = 0;
		var len = game.entities.length;
		var r, r2;
		if(!this.drag)
		{
			
			
			for(var  i = -1; i <= 1; i++)
			{
				for(var  j = -1; j <= 1; j++)
				{
					var gx = (Math.floor(this.x / game.gridSize) + i);
					var gy = (Math.floor(this.y / game.gridSize) + j);
					
					var key = gx + "," + gy;
					var list = game.space[key];
					if(list != undefined)
					{  
						var len = list.length;
						for(var k = 0; k < len; k++)
						{
							e = list[k];
							if(e != this)
							{
								this.Compute(e);
							}
						}
					}
				}
			} 
			/*
			
			for(var i = 0; i < len; i ++)
			{
				var e = game.entities[i];
				if(e != this)
				{
					this.Compute(e);
				}
			}
			*/
			
			/*if(this.x < this.radius) this.x = game.areaW + this.radius;
			if(this.x > game.areaW + this.radius) this.x = -this.radius;
			if(this.y < this.radius) this.y = game.areaH + this.radius;
			if(this.y > game.areaH + this.radius) this.y = -this.radius;*/
			
			
			if(Inputs.GetMousePress(1))
			{ 
				var dx = this.x - (Inputs.mouseX - game.centerX) / game.scaling;
				var dy = this.y - (Inputs.mouseY - game.centerY) / game.scaling;
				if(dx*dx + dy*dy < this.radius * this.radius)
					this.drag = true; 
			}
		}
		else
		{
			if(Inputs.GetMouseDown(1))
			{
				this.x = (Inputs.mouseX - game.centerX) / game.scaling;
				this.y = (Inputs.mouseY - game.centerY) / game.scaling;
			}
			 else
			{
				this.sxNew = Inputs.meanDeltaX;
				this.syNew = Inputs.meanDeltaY;
				this.drag = false;
			} 		
		}
		
	} 
} 
   

function Game()
{
	this.div = document.getElementById("GameDiv");
	this.canvas = document.getElementById("GameCanvas");
	var w = window.innerWidth - 25;
	var h = window.innerHeight- 25;
	this.div.style.width = w + "px";
	this.div.style.height = h + "px";
	this.canvas.setAttribute("width", w);
	this.canvas.setAttribute("height", h);
	
	this.canvas.oncontextmenu = function() {return false;}
	this.canvas.defaultWidth = this.canvas.width;
	this.canvas.defaultHeight = this.canvas.height;
	 
	this.ctx = this.canvas.getContext("2d");
	this.fullscreen = false;
	
	this.gridSize = 1024;
	this.space = [];
	
	this.viewX = 0;
	this.viewY = 0;
	this.scaling = 1;
	this.paused = false;  
	this.sleep = false;  
	
	this.areaW = this.canvas.width;
	this.areaH = this.canvas.height; 
	this.centerX = Math.round(this.areaW / 2);
	this.centerY = Math.round(this.areaH / 2);
	
	//fps counter
	this.dt = 0;
	this.fps = 0;
	this.frames = 0;
	this.millisec = 0;
	this.prevTime = Date.now();
	
	screenfull.onchange = function(){
		if(screenfull.isFullscreen){  
			game.canvas.width = game.canvas.height*window.innerWidth/window.innerHeight;
			game.canvas.style.width = window.innerWidth + "px";
			game.canvas.style.height = window.innerHeight + "px";
		}else{
			game.canvas.width = game.canvas.defaultWidth;
			game.canvas.height = game.canvas.defaultHeight;
			game.canvas.style.width = game.canvas.defaultWidth + "px";
			game.canvas.style.height = game.canvas.defaultHeight + "px"; 
		}
	}
	
	this.canvas.addEventListener("click", function(){ 
		/*if(Inputs.MouseInsideRect(game.canvas.width-60, game.canvas.height - 60,  game.sprFullscreen.width, game.sprFullscreen.height)){
			screenfull.toggle(game.canvas);
		}*/
	}, false);
	
	this.OnBlur = function(){ 
	}
	
	this.OnResize = function()
	{ 
		var w = window.innerWidth - 25;
		var h = window.innerHeight- 25;
		game.div.style.width = w + "px";
		game.div.style.height = h + "px";
		game.canvas.setAttribute("width", w);
		game.canvas.setAttribute("height", h);
	}
	
	this.OnFocus = function(){ 
	}
	 
	rh = new ResourcesHandler( function(){
		game.LoadLevel(0);
		game.GameLoop();
	});
	  
	/// Backgrounds 
	this.background1 = rh.LoadSprite("img/sky.png", 1); 
 
	this.Update = function()
	{ 
		for(var i = 0; i < this.entities.length; i ++) 
			this.entities[i].Update();
		
		for(var i = 0; i < this.entities.length; i ++) 
		{
			var e = this.entities[i];
			e.sx = e.sxNew;
			e.sy = e.syNew;
			if(e.sx != 0 || e.sy != 0)
			{
				var oldX = e.x;
				var oldY = e.y;
				e.x += e.sx;
				e.y += e.sy;
				updateEntity(e, oldX, oldY);
			}
		}
		if(Inputs.dragRight)
		{
			this.centerX += Inputs.dragRightX;
			this.centerY += Inputs.dragRightY;
		}
	}
	
	this.canvas.addEventListener("mousewheel", function(f)
	{
		game.scaling += f.wheelDelta/(1000/game.scaling); 
		 if(game.scaling < 0.0005){
				game.scaling = 0.0005;
		} 
		
		var x = Math.round(f.x - game.ctx.canvas.offsetLeft );
		var y = Math.round(f.y - game.ctx.canvas.offsetTop );
		
		game.centerX -= (x - game.centerX) * f.wheelDelta/10000;
		game.centerY -= (y - game.centerY) * f.wheelDelta/10000;
		 
   }, false);
   
	this.Draw = function()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		 
		this.ctx.drawImage(this.background1, 0, 0, this.canvas.width, this.canvas.height);
		  
		this.ctx.lineWidth = 1;
		
		
		//center origin
		var n = this.areaW / this.gridSize / this.scaling;
		if(this.scaling < 0.05)
			n = 0;
		for(var i = 0; i < n ; i++)
		{
			var s = this.gridSize * this.scaling;
			this.ctx.beginPath();
			this.ctx.moveTo(-s/2 + i * s + this.centerX % s - 10000 +0.5, -s/2 + i * s + this.centerY % s +0.5);
			this.ctx.lineTo(-s/2 + i * s + this.centerX % s + 10000 +0.5, -s/2 + i * s + this.centerY % s +0.5); 
			this.ctx.moveTo(-s/2 + i * s + this.centerX % s +0.5, -s/2 + i * s + this.centerY % s -10000 +0.5);
			this.ctx.lineTo(-s/2 + i * s + this.centerX % s +0.5,-s/2 +  i * s + this.centerY % s + 10000 +0.5);
			this.ctx.stroke();
		}
		  
			 
		this.ctx.globalAlpha = 0.5;
		this.ctx.save();
		var len = this.entities.length;
		this.ctx.translate(this.centerX, this.centerY); 
		for(var i = 0; i < len; i ++)
		{
			var e = this.entities[i];
			var dx = e.x - this.centerX;
			var dy = e.y - this.centerY;
			//if(dx * dx + dy * dy < this.areaW * this.areaH)
			{
				if(e.charge == 1) 
					this.ctx.fillStyle="#aa0000";
				else
					this.ctx.fillStyle="#0000aa";
					
				this.ctx.beginPath();
				this.ctx.arc(
					e.x * this.scaling,
					e.y * this.scaling,
					Math.max(2, e.radius * this.scaling),
					0, 2 * Math.PI);
				this.ctx.fill();		
				
				this.ctx.beginPath();
				this.ctx.moveTo(e.x * this.scaling, e.y * this.scaling);
				this.ctx.lineTo((e.x + e.sx * 4) * this.scaling, (e.y + e.sy*4) * this.scaling);
				this.ctx.stroke();
			}
		  
		}
		
		this.ctx.restore();
		
		this.ctx.globalAlpha = 1;
		this.ctx.strokeStyle = "#000";
		
		this.ctx.fillText( this.fps + " , " + this.scaling, 30, 30);
		 
	}
	
	
	this.ResetLevel = function()
	{
		this.entities = [];
	}
	
	this.LoadLevel = function(lev)
	{ 
		this.ResetLevel();
		var range = 1;
		for(var i = 0; i < 100; i++)
		{
			this.entities.push(new Entity(-this.areaW * range + Math.random()*this.areaW * range*2, -this.areaH*range + Math.random()*this.areaH * range*2));
		} 
		
		new Entity(game.gridSize/2, game.gridSize/2, 8, 0, 0);
		new Entity(110,  0, 60, 2, 22);
		new Entity(510,  0, 250, 0, 2); 
		new Entity(-510,  0, 250, 0, 2); 
		new Entity(-1510, 1111, 250, 0, 2); 
	}
	
	this.GameLoop = function()
	{
		
		this.dt = Date.now() - this.prevTime;
		this.millisec += this.dt;
		if(this.millisec >= 1000)
		{
			this.millisec = this.millisec % 1000;
			this.fps = this.frames;
			this.frames = 0;
		}
		this.prevTime = Date.now();
		this.frames++;
		 
		if(!this.sleep)
		{
			if(!this.paused)
				this.Update();
		}
		
		this.Draw();
		
		if(Inputs.GetKeyPress(KEY_SPACE))
		{
			this.paused = ! this.paused;
		}
		Inputs.Clear();
		
		window.requestAnimFrame(function(){
          game.GameLoop();
        });
	}
}

