class Scene_Graph
{
    constructor(scale, shape, material)
    {
        this.root = new Node(Mat4.identity(), Mat4.identity(), scale, shape, material);
    }

    draw(graphics_state)
    {
        this.root.draw(graphics_state);
    }
}

class Node
{
    constructor(translation, rotation, scale, shape, material, flip)
    {   
        this.parent = Mat4.identity();

        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
        this.shape = shape;
        this.material = material;
        this.flip = flip;

        this.children = [];
    }

    draw(graphics_state)
    {
        //Controls fin movement
        const t = graphics_state.animation_time / 1000;
        const angle = Math.PI/12 + (Math.PI/12) * Math.sin(10*t);
        let rotation_matrix = (this.rotation === null) ? Mat4.rotation(this.flip * angle, Vec.of(0, 1, 0)) : this.rotation;

        //Compute transform
        let transform = this.parent.times(this.translation).times(rotation_matrix).times(this.scale);

        //Draw the current node
        this.shape.draw(graphics_state, transform, this.material);

        //Draw each of the child nodes
        for (let i = 0; i < this.children.length; i++)
        {
            this.children[i].parent = transform;
            
            //Draw each of the child nodes' children
            this.children[i].draw(graphics_state);
        }
    }
}