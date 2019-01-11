class Plant
{
    constructor(x, z)
    {
        //If arguments are provided, instantiate plant at given (x, 0, z) coordinate
        if (x !== undefined && z !== undefined)
        {
            this.x = x;
            this.z = z;            
        }

        //Otherwise, instatiate plant with random (x, 0, z) coordinates
        else
        {
            this.x = Math.floor(26 * Math.random()) - 13;
            this.z = Math.floor(26 * Math.random()) - 13;
        }

        this.heights = [];

        //Each blade of plant will have a height from 4 - 8
        for (let i = 0; i < 4; i++)
            this.heights.push(Math.floor(4 * Math.random()) + 4);
    }

    draw(graphics_state, shapes, materials)
    {
        this.draw_blade(graphics_state, shapes, materials, this.heights[0], this.x, this.z);
        this.draw_blade(graphics_state, shapes, materials, this.heights[1], this.x + 0.3, this.z + 0.3);
        this.draw_blade(graphics_state, shapes, materials, this.heights[2], this.x - 0.3, this.z - 0.3);
        this.draw_blade(graphics_state, shapes, materials, this.heights[3], this.x - 0.6, this.z + 0.3);
    }

    draw_blade(graphics_state, shapes, materials, height, x, z)
    {
        const verticalShift = 0.01;
        const amplitude = 0.01;
        const frequency = 2;
        let t = graphics_state.animation_time/1000;

        const angle = verticalShift + amplitude*Math.sin(frequency*t);

        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation([x, -10, z]));

        model_transform = model_transform.times(Mat4.scale([(1/16), 0.5, (1/8)]));
        
        

        for (let i = 0; i < height; i++)
        {

            shapes.rectangle.draw(graphics_state, model_transform, materials.plant);

            model_transform = model_transform.times(Mat4.scale([16, 2, 8]))
                                             .times(Mat4.translation([(1/16), 0.5, 0]))
                                             .times(Mat4.rotation(-angle, Vec.of(0, 0, 1)))
                                             .times(Mat4.translation([-(1/16), 0.5, 0]))
                                             .times(Mat4.scale([(1/16), 0.5, (1/8)]));
        }
    }
}

class Plant2
{
    constructor(x, z)
    {
        //If arguments are provided, instantiate plant at given (x, 0, z) coordinate
        if (x !== undefined && z !== undefined)
        {
            this.x = x;
            this.z = z;            
        }

        //Otherwise, instatiate plant with random (x, 0, z) coordinates
        else
        {
            this.x = Math.floor(26 * Math.random()) - 13;
            this.z = Math.floor(26 * Math.random()) - 13;
        }
    }

    draw(graphics_state, shapes, materials)
    {
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation([this.x, -9, this.z]));

        shapes.sphere.draw(graphics_state, model_transform.times(Mat4.scale([0.7, 0.1, 0.7])), materials.plant);

        shapes.rectangle.draw(graphics_state, model_transform.times(Mat4.translation([0.3, -0.5, 0]))
                                                             .times(Mat4.rotation(0.25, Vec.of(0, 0, 1)))
                                                             .times(Mat4.scale([0.1, 0.5, 0.1])), materials.plant);

        shapes.sphere.draw(graphics_state, model_transform.times(Mat4.translation([1.5, 0.5, -1]))
                                                          .times(Mat4.scale([1, 0.1, 1])), materials.plant);

        shapes.rectangle.draw(graphics_state, model_transform.times(Mat4.translation([1, -0.5, -1]))
                                                             .times(Mat4.rotation(-0.25, Vec.of(0, 0, 1)))
                                                             .times(Mat4.scale([0.1, 1, 0.1])), materials.plant);

        shapes.sphere.draw(graphics_state, model_transform.times(Mat4.translation([1.2, 0.2, 0.5]))
                                                          .times(Mat4.scale([0.85, 0.1, 0.85])), materials.plant);

        shapes.rectangle.draw(graphics_state, model_transform.times(Mat4.translation([1.2, -0.6, 0.3]))
                                                             .times(Mat4.rotation(0.25, Vec.of(1, 0, 0)))
                                                             .times(Mat4.scale([0.1, 0.75, 0.1])), materials.plant);   
    }
}