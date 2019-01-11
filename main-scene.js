//Global variables
let cart = [];

//Color constants
const red = Color.of(0.99, 0.0, 0.0, 1.0);
const green = Color.of(0.0, 1.0, 0.0, 1.0);
const blue = Color.of( 0,0,1,0.2 ); 
const yellow = Color.of(0.8, 0.8, 0.0, 1.0);
const orange = Color.of(1.0, 0.6, 0.2, 1.0);
const sand = Color.of(0.9921, 0.8745, 0.466, 1);
const tan = Color.of(0.8, 0.6, 0.0, 1.0);
const black = Color.of(0.0, 0.0, 0.0, 1.0);

//Game constants
const gameTime = 180;
const startingMoney = 100;
const startingNumPlants = 6;

//In sandbox mode:
//- Items in the market are free to purchase
//- Time resets once hitting zero (game doesn't end)
const sandBoxMode = false;

class Fish_Food {
    constructor(pos_x, pos_y, pos_z, velocity) {
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.pos_z = pos_z;
        this.velocity = velocity;
        this.impact = false;
    }

    fall(dt) {
        if (this.pos_y > 10.0) {
            this.velocity = this.velocity - 9.8 * dt;
        } else if (this.pos_y > -10.0){
            if (this.velocity < -1.0) {
                this.velocity += 70.0 * dt;
            }

            if (this.velocity >= -1.0) {
            	this.velocity = -1.0;
            }
        } else {
            this.velocity = 0;
        }
        this.pos_y = this.pos_y + this.velocity * dt;
    }
}

window.Final_Project_Scene = window.classes.Final_Project_Scene =
class Final_Project_Scene extends Scene_Component
{ 
	constructor(context, control_box)     // The scene begins by requesting the camera, shapes, and materials it will need.
    { 
    	super(context, control_box);    // First, include a secondary Scene that provides movement controls:
        if(!context.globals.has_controls) 
          	context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell())); 
		
        context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 0, 15), Vec.of(0, 0, 0), Vec.of(0, 1, 0)).times(Mat4.translation([0, 0, -25]));

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI/4, r, .1, 1000);
        this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);

		//Shapes used for our scene
        const shapes = 
        {
            tank: new Cube(),
            rectangle: new Cube(),
            fish_food: new Subdivision_Sphere(1),
            sphere: new Subdivision_Sphere(4),
            bump_shape: new Cube_TBN()
        }
        
        this.submit_shapes(context, shapes);

        this.clay = context.get_instance(Phong_Shader).material(Color.of(0.9, 0.5, 0.9, 1), {ambient: 0.4, diffusivity: 0.4});
        this.white = context.get_instance(Basic_Shader).material();
        this.plastic = this.clay.override({specularity: 0.6});
        this.plastic_regular = context.get_instance(Regular_Shader).material(Color.of(0.9, 0.5, 0.9, 1), {ambient: 0.8, diffusivity: 0.4, specularity: 0.6, texture: this.texture })
        this.plastic_shadow = context.get_instance(Shadow_Shader).material(Color.of(0.9, 0.5, 0.9, 1), {ambient: 0.8, diffusivity: 0.4, specularity: 0.6});

        this.materials =
        {
            fish: context.get_instance(Regular_Shader).material(red, {ambient: 1, texture: this.texture}),
            fin: context.get_instance(Regular_Shader).material(tan, {ambient: 1, texture: this.texture}),
            fish_food: context.get_instance(Regular_Shader).material(Color.of(0.5, 0.3, 0.15, 1), {ambient:1, texture: this.texture}),
            puffer: context.get_instance(Regular_Shader).material(yellow, {ambient: 1, texture: this.texture}),
            plant: context.get_instance(Regular_Shader).material(green, {ambient: 1, diffusivity: 1, texture: this.texture}),
            standWithTexture: context.get_instance(Phong_Shader).material(Color.of(0, 0, 0, 1), {ambient: 1 , texture: context.get_instance("assets/wood.jpg", true)}),
            standWitoutTexture: context.get_instance(Phong_Shader).material(Color.of(0.5, 0.5, 0.5, 1), {ambient: 1}), 
            bump_material: context.get_instance(Bump_Shader).material(Color.of(0.35, 0.35, 0.35, 1), {ambient: 1, specularity: 0, texture: {diffuse: context.get_instance("assets/sandclean.png", true), normal: context.get_instance("assets/sand_normal.png", true)}})
        }

        this.food = [];
        this.rotatecount = 0;

        this.rflag = 1;

        this.fish = [];
        this.add_fish("minnow");
        this.add_fish("minnow");
        this.add_fish("minnow");

        this.plants = [];
        for (let i = 0; i < startingNumPlants; i++)
        {
            if (i % 2 === 0)
                this.plants.push(new Plant());
            else
                this.plants.push(new Plant2());
        }
        
        this.feed_area_x = 0.0;
        this.feed_area_z = 0.0;

        this.totalmon = startingMoney;
        this.foodamt = 0;

        this.prev= -1;

		//Set prices of items in market
        this.prices = new Map();
		if (sandBoxMode)
		{
			this.prices.set("food", 0);
        	this.prices.set("plant", 0);
        	this.prices.set("minnow", 0);
        	this.prices.set("tiger", 0);
        	this.prices.set("puffer", 0);
		}
		else
		{
			this.prices.set("food", 0.50);
			this.prices.set("plant", 2.5);
			this.prices.set("minnow", 2.0);
			this.prices.set("tiger", 4.0);
			this.prices.set("puffer", 10.0);	
		}

        this.drop_x = 0;
        this.cover_countdown = 0;

        this.timerem = gameTime;
        this.iterations = 0;
        this.gameOver = false;

        this.mapMode = "shadow";

        this.lights = [new Light(Vec.of(0, 25, 0, 1), Color.of(0, 0, 1, 1), 100000)];
		
		//Shadows
		
		this.webgl_manager = context;      // Save off the Webgl_Manager object that created the scene.
		this.scratchpad = document.createElement('canvas');
		this.scratchpad_context = this.scratchpad.getContext('2d');     // A hidden canvas for re-sizing the real canvas to be square.
		this.scratchpad.width   = 256;
		this.scratchpad.height  = 256;
		this.texture = new Texture ( context.gl, "", false, false );        // Initial image source: Blank gif file
		this.texture.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
		
      }

    make_control_panel()
    { 
        this.key_triggered_button("Menu",  ["1"], () => 
        {
            toggleMenu();
        });

        this.key_triggered_button("Feed", ["2"], () => 
        {
            this.cover_countdown = 3;
            this.drop_x = this.feed_area_x;        
            if(!this.gameOver && this.foodamt > 0)
            {
                this.add_food(this.feed_area_x, 50, this.feed_area_z, 0);
                this.foodamt--;
            }
        });

        
        //Control feed location

        this.key_triggered_button( "Right", ["l"], () => 
        {
        	let x = this.feed_area_x;
        	let z = this.feed_area_z;

        	switch (this.rotatecount % 4)
        	{
        		case 0: x += 0.5; break;
        		case 1: z -= 0.5; break;
        		case 2: x -= 0.5; break;
        		case 3: z += 0.5; break;
        	}

        	if (x > -14 && x < 14)
        		this.feed_area_x = x;
        	if (z > -14 && z < 14)
        		this.feed_area_z = z;
        });
        
        this.key_triggered_button( "Down", ["k"], () => 
        {
			let x = this.feed_area_x;
        	let z = this.feed_area_z;

        	switch (this.rotatecount % 4)
        	{
        		case 0: z += 0.5; break;
        		case 1: x += 0.5; break;
        		case 2: z -= 0.5; break;
        		case 3: x -= 0.5; break;
        	}

        	if (x > -14 && x < 14)
        		this.feed_area_x = x;
        	if (z > -14 && z < 14)
        		this.feed_area_z = z;
        });

        this.key_triggered_button( "Left", ["j"], () => 
        {
			let x = this.feed_area_x;
        	let z = this.feed_area_z;

        	switch (this.rotatecount % 4)
        	{
        		case 0: x -= 0.5; break;
        		case 1: z += 0.5; break;
        		case 2: x += 0.5; break;
        		case 3: z -= 0.5; break;
        	}

        	if (x > -14 && x < 14)
        		this.feed_area_x = x;
        	if (z > -14 && z < 14)
        		this.feed_area_z = z;
        });

        this.key_triggered_button( "Up", ["i"], () => 
        {
			let x = this.feed_area_x;
        	let z = this.feed_area_z;

        	switch (this.rotatecount % 4)
        	{
        		case 0: z -= 0.5; break;
        		case 1: x -= 0.5; break;
        		case 2: z += 0.5; break;
        		case 3: x += 0.5; break;
        	}

        	if (x > -14 && x < 14)
        		this.feed_area_x = x;
        	if (z > -14 && z < 14)
        		this.feed_area_z = z;
        });

        this.key_triggered_button( "Rotate Camera",  [ "t" ], () => 
        {
            this.rotatecount++;
            if(this.rotatecount == 5)
                this.rotatecount = 1;
           	
            this.rflag = 1;

        });

        this.key_triggered_button( "Free Camera",  [ "y" ], () => 
        {
            this.rflag = 0;
        });

        this.key_triggered_button("Toggle map mode",  ["0"], () => 
        {
        	if (this.mapMode === "shadow")
        		this.mapMode = "bump";
        	else
        		this.mapMode = "shadow";
        });
    }

    display(graphics_state)
    {   
        graphics_state.lights = this.lights;
		const t = graphics_state.animation_time / 1000;
		const dt = graphics_state.animation_delta_time / 1000;
        
		let saved_camera = this.webgl_manager.globals.graphics_state.camera_transform;
    	this.webgl_manager.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0.1, 30, 0), Vec.of(0, 0, 0), Vec.of(0, 1, 0));
		
		/* Draw Scene 1 */

		this.draw_tank(graphics_state, true);

		for (let i = 0; i < this.fish.length; i++)
        {
            this.fish[i].move(graphics_state, this.food, this.fish);
            this.fish[i].draw(graphics_state);
        }

        for (let i = 0; i < this.food.length; i++) 
        {
            this.food[i].fall(dt);

			if (this.food[i].pos_y < 18 && this.food[i].impact === false)
			{
				playDropSound();
				this.food[i].impact = true;
			}

            let food_pos_x = this.food[i].pos_x;
            let food_pos_y = this.food[i].pos_y;
            let food_pos_z = this.food[i].pos_z;

            let fish_food_model = Mat4.identity();
            fish_food_model = fish_food_model.times(Mat4.translation([ food_pos_x, food_pos_y, food_pos_z]));
            fish_food_model = fish_food_model.times(Mat4.scale([0.3,0.3,0.3]));
            this.shapes.fish_food.draw( graphics_state, fish_food_model, this.materials.fish_food );
        }

        for (let i = 0; i < this.plants.length; i++)
            this.plants[i].draw(graphics_state, this.shapes, this.materials);

		this.scratchpad_context.drawImage(this.webgl_manager.canvas, 0, 0, 256, 256);
		this.texture.image.src = this.scratchpad.toDataURL("image/png");

		// Clear the canvas and start over, beginning scene 2:
		this.webgl_manager.gl.clear( this.webgl_manager.gl.COLOR_BUFFER_BIT | this.webgl_manager.gl.DEPTH_BUFFER_BIT);

		/* Draw Scene 2 */

    	this.webgl_manager.globals.graphics_state.camera_transform = saved_camera;

        //Update time left
        this.timerem = gameTime + (this.iterations * gameTime) - Math.floor(t);

        if (this.timerem <= 0)
        {
			if (sandBoxMode)
			{
				this.timerem = gameTime;		//Restart time
				this.iterations++;
			}

			else
			{
				this.fish = [];
				this.gameOver = true;
				gameOver(this.totalmon);	
			}
        }

        //Update HUD
        if (this.timerem >= 0)
        	updateHUDInfo(this.totalmon, this.foodamt, this.timerem);

        //Buy food or fish from the store
        for (let i = 0; i < cart.length; i++)
        {
            //Check if enough funds are available to make purchase
            hideErrorMsg();
            if (this.totalmon < this.prices.get(cart[i]))
            {
                showErrorMsg();
                break;
            }

            if (cart[i] === "food")
                this.foodamt += 5;
            else if (cart[i] === "plant")
                this.add_plant();
            else
                this.add_fish(cart[i]);

            //Decrement total amount of money by purchase cost
          	this.totalmon -= this.prices.get(cart[i]);
        }

        cart = [];

        //Update score every second 
        let multiplier = 1 + 0.05 * (this.plants.length - startingNumPlants);
        let amountEarned = 0;
        for (let i = 0; i < this.fish.length; i++)
            amountEarned += this.fish[i].earnRate;

        if (Math.floor(t) !== this.prev)
        {
            this.totalmon += multiplier * amountEarned;
            this.prev++;
        }

        //Update fish health levels
        for (let i = 0; i < this.fish.length; i++)
        {
            this.fish[i].health -= this.fish[i].hungerRate * dt;
            if(this.fish[i].health <= 0 && this.fish[i].pos[1] >= 10)
            {
                this.fish.splice(i, 1);
                i--;
            }
        }

        /* Draw scene objects */

        //Draw fish
        for (let i = 0; i < this.fish.length; i++)
        {
            this.fish[i].draw(graphics_state);
        }

        //Draw plants
        for (let i = 0; i < this.plants.length; i++)
            this.plants[i].draw(graphics_state, this.shapes, this.materials);
           
        for (let i = 0; i < this.food.length; i++) 
        {
            let food_pos_x = this.food[i].pos_x;
            let food_pos_y = this.food[i].pos_y;
            let food_pos_z = this.food[i].pos_z;

            let fish_food_model = Mat4.identity();
            fish_food_model = fish_food_model.times(Mat4.translation([food_pos_x, food_pos_y, food_pos_z]));
            fish_food_model = fish_food_model.times(Mat4.scale([0.3,0.3,0.3]));
            this.shapes.fish_food.draw(graphics_state, fish_food_model, this.materials.fish_food);
        }
        
        let control_food_model = Mat4.identity();
        control_food_model = control_food_model.times(Mat4.translation([ this.feed_area_x, -10, this.feed_area_z]));

        this.shapes.rectangle.draw(graphics_state, control_food_model.times(Mat4.scale([1, 0.2, 0.3])), this.materials.fish);
        this.shapes.rectangle.draw(graphics_state, control_food_model.times(Mat4.rotation(Math.PI / 2, Vec.of(0, 1, 0))).times(Mat4.scale([1, 0.2, 0.3])), this.materials.fish);

        //Draw some plants
        for (let i = 0; i < this.plants.length; i++)
            this.plants[i].draw(graphics_state, this.shapes, this.materials);

        this.draw_tank(graphics_state, false);
        this.draw_stand(graphics_state);

        this.cover_countdown -= dt;
        let id = Mat4.identity();
        
        if(this.rflag == 1)
        {
        	if (this.rotatecount > 0)
        	{
          		let model_Cam = this.initial_camera_location;
          		let x = this.rotatecount % 5;
          		for(let i = 0; i < x; i++)
          		{
            		model_Cam = model_Cam.times( Mat4.translation ([ 0, 0, -40 ]) );
            		model_Cam = model_Cam.times( Mat4.rotation( 1.575, Vec.of( 0,1,0 ) ));
            		model_Cam = model_Cam.times( Mat4.translation ([ 0, 0,  40]) ); 
          		}
          
          
          		model_Cam = Mat4.inverse(model_Cam);
          		graphics_state.camera_transform = model_Cam.map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) );
        	}	
        }
  
    } //End of display()

    add_food(x, y, z, v)
    {
       this.food.push(new Fish_Food(x, y, z, v));
    }

    add_fish(type)
    {
        this.fish.push(new Fish(type, this.shapes, this.materials));
    }

    add_plant()
    {
        if (Math.random() < 0.5)
            this.plants.push(new Plant());
        else
            this.plants.push(new Plant2());
    }

    draw_tank(graphics_state, obtain_shadow_map)
    {
		let wallMaterial = (obtain_shadow_map) ? this.plastic_shadow.override({color: blue}) : this.plastic.override({color: blue});
		let groundMaterial = (obtain_shadow_map) ? this.plastic_shadow.override({color: sand}) : this.plastic_regular.override({color: sand});

		let side = this.rotatecount % 4;
		let lastDrawIndex = 3 - side;

		let wallTransforms = [];
		wallTransforms.push(Mat4.translation([-15, 0, 0]).times(Mat4.scale([0.05, 10, 15])));			//Left wall
		wallTransforms.push(Mat4.translation([0, 0, -15]).times(Mat4.scale ([15, 10, 0.05])));			//Back wall
		wallTransforms.push(Mat4.translation([15, 0, 0]).times(Mat4.scale([0.05, 10, 15])));			//Right wall
		wallTransforms.push(Mat4.translation([0, 0, 15]).times(Mat4.scale([15, 10, 0.05])));			//Front wall 

        let model_transform = Mat4.identity();
		
		//Draw ground
		if (this.mapMode === "shadow")
			this.shapes.tank.draw(graphics_state, model_transform.times(Mat4.translation([0, -10, 0])).times(Mat4.scale([15, 0.05, 15])), groundMaterial);
		else
			this.shapes.bump_shape.draw(graphics_state, model_transform.times(Mat4.translation([0, -10, 0])).times(Mat4.scale([15, 0.05, 15])), this.materials.bump_material);

		//Draw side and back walls
		for (let i = 0; i < wallTransforms.length; i++)
			if (i !== lastDrawIndex)
				this.shapes.tank.draw(graphics_state, model_transform.times(wallTransforms[i]), wallMaterial);

		//Draw front wall
		this.shapes.tank.draw(graphics_state, model_transform.times(wallTransforms[lastDrawIndex]), wallMaterial);
    }

    draw_stand(graphics_state)
    {
        let model_transform_1 = Mat4.identity();
        let model_transform_2 = Mat4.identity();
        let model_transform_3 = Mat4.identity();
	
    	//let standMaterial = (this.mapMode === "shadow") ? this.materials.standWithTexture : this.materials.standWitoutTexture;
    	let standMaterial = this.materials.standWitoutTexture;

		//Draw main stand
        model_transform_1 = model_transform_1.times(Mat4.translation([0, -20, 0])).times(Mat4.scale([15.25, 10, 15.25]));
        this.shapes.rectangle.draw(graphics_state, model_transform_1, standMaterial);

        model_transform_1 = model_transform_1.times(Mat4.translation([0, 0, 1])).times(Mat4.scale([0.85, 0.8, 0.05]));
        this.shapes.rectangle.draw(graphics_state, model_transform_1, standMaterial);  

		//Draw cover of tank
        if (this.cover_countdown <= 0 || this.drop_x > 0 || this.gameOver || this.foodamt === 0)
        {
            model_transform_2 = model_transform_2.times(Mat4.translation([-7.625, 11, 0])).times(Mat4.scale([7.625, 1, 15.25]));
            this.shapes.rectangle.draw(graphics_state, model_transform_2, standMaterial); 
        }

        if (this.cover_countdown <= 0 || this.drop_x < 0 || this.gameOver || this.foodamt === 0)
        {
            model_transform_3 = model_transform_3.times(Mat4.translation([7.625, 11, 0])).times(Mat4.scale([7.625, 1, 15.25]));
            this.shapes.rectangle.draw(graphics_state, model_transform_3, standMaterial); 
        }
    }
}