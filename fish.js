class Fish
{
    constructor(type, shapes, materials)
    {
        //Generate random starting position for fish
        let randx = Math.floor(10 * Math.random()) - 10;
        let randy = Math.floor(5 * Math.random()) - 5;
        let randz = Math.floor(10 * Math.random()) - 10;

        this.pos = [randx, randy, randz];
        this.dir = [0, 0, 0];
        this.moveTime = 0;
        this.health = 60;

        if (type === "minnow")
        {
            this.earnRate = 0.05;
            this.hungerRate = 1;

            //Body
            this.scene_graph = new Scene_Graph(Mat4.scale([0.5, 0.25, 0.25]), shapes.rectangle, materials.fish);
            this.scene_graph.root.children.push(new Node(Mat4.translation([1, 0, 0]), 
                                                         Mat4.identity(), 
                                                         Mat4.scale([0.2, 0.8, 0.8]), shapes.rectangle, materials.fish));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-1.25, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.3, 0.75, 0.75]), shapes.rectangle, materials.fish));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-1.75, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.5, 0.5, 0.5]), shapes.rectangle, materials.fish));

            //Dorsal fin
            this.scene_graph.root.children.push(new Node(Mat4.translation([-0.3, 1, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.5, 0.5, 0.05]), shapes.rectangle, materials.fin));

            //Tail fin
            this.scene_graph.root.children.push(new Node(Mat4.translation([-2.5, 0, 0]),
                                                         Mat4.identity(), 
                                                         Mat4.scale([0.35, 0.7, 0.05]), shapes.rectangle, materials.fin));

            let rotationMatrix = (this.health <= 0) ? null : Mat4.identity();

            //Pectoral fins
            this.scene_graph.root.children.push(new Node(Mat4.translation([-0.3, 0, 1]),
                                                         rotationMatrix,
                                                         Mat4.scale([0.05, 0.5, 1]), shapes.rectangle, materials.fin, -1));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-0.3, 0, -1]),
                                                         rotationMatrix,
                                                         Mat4.scale([0.05, 0.5, 1]), shapes.rectangle, materials.fin, 1));
        }

        if (type === "tiger")
        {
            this.earnRate = 0.20;
            this.hungerRate = 2;

            //Body (main)
            this.scene_graph = new Scene_Graph(Mat4.scale([0.1, 0.5, 0.25]), shapes.rectangle, materials.fish.override({color: orange}));
            this.scene_graph.root.children.push(new Node(Mat4.translation([-2, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.identity(), shapes.rectangle, materials.fish.override({color: black})));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-4, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.identity(), shapes.rectangle, materials.fish.override({color: orange})));
            //Body (head)
            this.scene_graph.root.children.push(new Node(Mat4.translation([2, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.7, 0.95, 0.95]), shapes.rectangle, materials.fish.override({color: black})));

            this.scene_graph.root.children.push(new Node(Mat4.translation([3.2, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.7, 0.85, 0.85]), shapes.rectangle, materials.fish.override({color: orange})));

            //Body (tail)
            this.scene_graph.root.children.push(new Node(Mat4.translation([-6, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.9, 0.8, 0.9]), shapes.rectangle, materials.fish.override({color: black})));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-8, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.8, 0.5, 0.8]), shapes.rectangle, materials.fish.override({color: orange})));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-10, 0, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([1, 0.3, 0.6]), shapes.rectangle, materials.fish.override({color: black})));
                     
            //Tail fins
            this.scene_graph.root.children.push(new Node(Mat4.translation([-12, 0.3, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([1, 0.2, 0.1]), shapes.rectangle, materials.fin));   

            this.scene_graph.root.children.push(new Node(Mat4.translation([-12, -0.3, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([1, 0.2, 0.1]), shapes.rectangle, materials.fin));

            let rotationMatrix = (this.health <= 0) ? null : Mat4.identity();

            //Pectoral fins
            this.scene_graph.root.children.push(new Node(Mat4.translation([-1.5, 0, 1]),
                                                         rotationMatrix,
                                                         Mat4.scale([0.1, 0.3, 1.2]), shapes.rectangle, materials.fin, -1));

            this.scene_graph.root.children.push(new Node(Mat4.translation([-1.5, 0, -1]),
                                                         rotationMatrix,
                                                         Mat4.scale([0.1, 0.3, 1.2]), shapes.rectangle, materials.fin, 1));

            //Dorsal fin
            this.scene_graph.root.children.push(new Node(Mat4.translation([-2, 1, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([1.5, 0.3, 0.1]), shapes.rectangle, materials.fin));
        }

        else if (type === "puffer")
        {
            this.earnRate = 0.15;
            this.hungerRate = 0.75;

            //Body
            this.scene_graph = new Scene_Graph(Mat4.scale([1, 1, 1]), shapes.sphere, materials.puffer);
            this.scene_graph.root.children.push(new Node(Mat4.translation([-0.75, 0.35, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.4, 0.3, 0.3]), shapes.sphere, materials.puffer));

            //Tail fin
            this.scene_graph.root.children.push(new Node(Mat4.translation([-1.15, 0.4, 0]),
                                                         Mat4.identity(),
                                                         Mat4.scale([0.2, 0.15, 0.05]), shapes.rectangle, materials.fin));

            let rotationMatrix = (this.health <= 0) ? null : Mat4.identity();

            //Pectoral fins
            this.scene_graph.root.children.push(new Node(Mat4.translation([0, 0, 1]),
                                                         rotationMatrix,
                                                         Mat4.scale([0.05, 0.2, 0.35]), shapes.rectangle, materials.fin, -1));
            
            this.scene_graph.root.children.push(new Node(Mat4.translation([0, 0, -1]),
                                                         rotationMatrix,
                                                         Mat4.scale([0.05, 0.2, 0.35]), shapes.rectangle, materials.fin, 1));
        }
    }

    move(graphics_state, food, fish)
    {   
        const dt = graphics_state.animation_delta_time / 1000;

        //The fish is dead so don't update its position
        if (this.health <= 0)
            return;

        //Control random motion
        if (this.moveTime <= 0)
        {
            //Generate new direction
            this.dir[0] = 2 * Math.random() - 1;
            this.dir[1] = 2 * Math.random() - 1;
            this.dir[2] = 2 * Math.random() - 1;

            //Generate the amount of time the fish will spend swimming in this direction
            this.moveTime = 10 * Math.random();
        }

        //Control motion near food
        for (let i = 0; i < food.length; i++)
        {
            //Calculate distance between food and fish
            let dist = Math.sqrt(Math.pow((food[i].pos_x - this.pos[0]), 2.0) + 
                                 Math.pow((food[i].pos_y - this.pos[1]), 2.0) + 
                                 Math.pow((food[i].pos_z - this.pos[2]), 2.0));

            //Remove food if fish is in range                          
            if (dist < 0.5)
            {
                food.splice(i, 1);
                this.health += 15;
            }
                
            //Have fish swim towards food if in range
            else if (this.health < 40 && dist < 7.5 && food[i].pos_y < 9 && food[i].pos_y > -9)
            {
                this.dir[0] = (food[i].pos_x - this.pos[0]) / Math.sqrt(dist);
                this.dir[1] = (food[i].pos_y - this.pos[1]) / Math.sqrt(dist);
                this.dir[2] = (food[i].pos_z - this.pos[2]) / Math.sqrt(dist);
                break;
            }
        }

        //Control motion near other fish
        for (let i = 0; i < fish.length; i++)
        {
            if (fish[i] !== this)
            {
                //Calculate distance between this fish and other fish
                let dist = Math.sqrt(Math.pow((fish[i].pos[0] - this.pos[0]), 2.0) + 
                                     Math.pow((fish[i].pos[1] - this.pos[1]), 2.0) + 
                                     Math.pow((fish[i].pos[2] - this.pos[2]), 2.0));

                //If two fish get too close to one another, turn them around!
                if (dist < 1)
                {
                    if (this.dir[0] * fish[i].dir[0] < 0)
                        this.dir[0] *= -1;

                    if (this.dir[1] * fish[i].dir[1] < 0)
                        this.dir[1] *= -1;

                    if (this.dir[2] * fish[i].dir[2] < 0)
                        this.dir[2] *= -1;

                    break;
                }
            }
        }

        let speed = 3;

        //Update fish coordinates
        this.pos[0] += speed * dt * this.dir[0];
        this.pos[1] += speed * dt * this.dir[1];
        this.pos[2] += speed * dt * this.dir[2];

        //If fish moves too close to a wall, turn it around!

        if (this.pos[0] < -14 && this.dir[0] < 0)
            this.dir[0] *= -1;

        else if (this.pos[0] > 14 && this.dir[0] > 0)
            this.dir[0] *= -1;
        
        if (this.pos[1] < -9 && this.dir[1] < 0)
            this.dir[1] *= -1;

        else if (this.pos[1] > 9 && this.dir[1] > 0)
            this.dir[1] *= -1;
        
        if (this.pos[2] < -14 && this.dir[2] < 0)
            this.dir[2] *= -1;

        if (this.pos[2] > 14 && this.dir[2] > 0)
            this.dir[2] *= -1;

        //Count down move time
        this.moveTime -= dt;
    }

    draw(graphics_state)
    {
        const t = graphics_state.animation_time / 1000;
        const dt = graphics_state.animation_delta_time / 1000;

        let model_rotation = Math.atan(-1 * this.dir[2] / this.dir[0]);
        if (this.dir[0] < 0)
            model_rotation -= Math.PI;

        this.scene_graph.root.translation = Mat4.translation([this.pos[0], this.pos[1], this.pos[2]]);
        this.scene_graph.root.rotation = Mat4.rotation(model_rotation, Vec.of(0, 1, 0));

        if (this.health <= 0)
        {
            //Flip fish upside-down
            this.scene_graph.root.rotation = this.scene_graph.root.rotation.times(Mat4.rotation(Math.PI, Vec.of(1, 0, 0)));

            //Translate fish upwards
            this.pos[1] = this.pos[1] + dt;            
            this.scene_graph.root.translation = Mat4.translation([this.pos[0], this.pos[1], this.pos[2]]);
        }

        this.scene_graph.draw(graphics_state);
    }
}