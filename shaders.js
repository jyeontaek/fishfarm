class Shadow_Shader extends Phong_Shader
{
	vertex_glsl_code()
	{
		return `
			attribute vec3 object_space_pos;
			attribute vec2 tex_coord;

        	uniform mat4 projection_camera_model_transform;

			void main() {
				f_tex_coord = tex_coord;
				gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);
			}
		`
	}

	fragment_glsl_code()
	{
		return `
			#ifdef GL_ES
			precision mediump float;
			#endif
			void main() {
				gl_FragColor = vec4(gl_FragCoord.z, 0.0, 0.0, 1.0);
			}
		`
	}
}

class Regular_Shader extends Phong_Shader
{
	vertex_glsl_code()
	{
		return `
			attribute vec3 object_space_pos;
			attribute vec2 tex_coord;

        	uniform mat4 projection_camera_model_transform, camera_model_transform, camera_transform, model_transform;

			uniform mat4 u_MvpMatrixFromLight;
			varying vec4 v_PositionFromLight;
			varying vec4 v_Color;
			void main() {
				f_tex_coord = tex_coord;
				gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);

				vec4 v1 = vec4(0.0, -0.9999944567680359, 0.003333314787596464, 0.0);
				vec4 v2 = vec4(0.0, 0.003333314787596464, 0.9999944567680359, 0.0);
				vec4 v3 = vec4(-1.0, 0.0, 0.0, 0.0);
				vec4 v4 = vec4(0.0, -0.000000003539017523479515, -30.000167034524804, 1.0);
				mat4 look_at = mat4(v1, v2, v3, v4);

				vec4 p1 = vec4(1.3412297568739415, 0.0, 0.0, 0.0);
				vec4 p2 = vec4(0.0, 2.414213562373095, 0.0, 0.0);
				vec4 p3 = vec4(0.0, 0.0, -1.0002000200020003, -1.0);
				vec4 p4 = vec4(0.0, 0.0, -0.20002000200020004, 0.0);
				mat4 perspective = mat4(p1, p2, p3, p4);
				mat4 viewProjMatrixFromLight = perspective * look_at;

				vec4 t1 = vec4(-1.0, 0.0, 0.0, 0.0);
				vec4 t2 = vec4(0.0, 1.0, 0.0, 0.0);
				vec4 t3 = vec4(0.0, 0.0, 1.0, 0.0);
				vec4 t4 = vec4(0.0, 0.0, 0.0, 1.0);
				mat4 mirror = mat4(t1, t2, t3, t4);

				v_PositionFromLight = viewProjMatrixFromLight * mirror * model_transform * vec4(object_space_pos, 1.0);
				VERTEX_COLOR = vec4( shapeColor.xyz * ambient, shapeColor.w);
				v_Color = VERTEX_COLOR;
			}
		`
	}

	fragment_glsl_code()
	{
		return `
			#ifdef GL_ES
			precision mediump float;
			#endif
			uniform sampler2D texture;
			varying vec4 v_PositionFromLight;
			varying vec4 v_Color;
			void main() {
				vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
				vec4 rgbaDepth = texture2D(texture, shadowCoord.xy);
				float depth = rgbaDepth.r;
				float visibility = (shadowCoord.z > depth + 0.005) ? 0.7 : 1.0;
				gl_FragColor = vec4(v_Color.rgb * visibility, v_Color.a);
				//gl_FragColor = vec4(0.5, 0.2, 0.1, visibility);
			}
		`
	}
}

class Bump_Shader extends Phong_Shader
{
  map_attribute_name_to_buffer_name( name )                  // We'll pull single entries out per vertex by field name.  Map
    {                                                        // those names onto the vertex array names we'll pull them from.
      return { object_space_pos: "positions", normal: "normals", tex_coord: "texture_coords", tangent: "tangents", bitangent: "bitangents" }[ name ]; }   // Use a simple lookup table.
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos, normal, tangent, bitangent;
        attribute vec2 tex_coord;

        uniform mat4 camera_transform, camera_model_transform, projection_camera_model_transform;
        uniform mat3 inverse_transpose_modelview;

        void main()
        { gl_Position = projection_camera_model_transform * vec4(object_space_pos, 1.0);     // The vertex's final resting place (in NDCS).
          N = normalize( inverse_transpose_modelview * normal );                             // The final normal vector in screen space.
          f_tex_coord = tex_coord; 
          
          mat3 camera_model_transform_3x3 = mat3(camera_model_transform);
		  mat3 TBN = mat3(camera_model_transform_3x3 * normalize(normal),
		  				  camera_model_transform_3x3 * normalize(bitangent),
		  				  camera_model_transform_3x3 * normalize(tangent));

		  mat3 tTBN = mat3(TBN[0][0], TBN[1][0], TBN[2][0],
		  				   TBN[0][1], TBN[1][1], TBN[2][1],
		  				   TBN[0][2], TBN[1][2], TBN[2][2]);

          vec3 screen_space_pos = ( camera_model_transform * vec4(object_space_pos, 1.0) ).xyz;
          E = normalize( tTBN * (-screen_space_pos ));

          for( int i = 0; i < N_LIGHTS; i++ )
          {            // Light positions use homogeneous coords.  Use w = 0 for a directional light source -- a vector instead of a point.
            L[i] = normalize(tTBN * normalize( ( camera_transform * lightPosition[i] ).xyz - lightPosition[i].w * screen_space_pos ));
            H[i] = normalize( L[i] + E );
            
            // Is it a point light source?  Calculate the distance to it from the object.  Otherwise use some arbitrary distance.
            dist[i]  = lightPosition[i].w > 0.0 ? distance((camera_transform * lightPosition[i]).xyz, screen_space_pos)
                                                : distance( attenuation_factor[i] * -lightPosition[i].xyz, object_space_pos.xyz );
          }
        }`;
    }
  fragment_glsl_code() 
    {                  
                       
      return `
        uniform sampler2D texture0;
        uniform sampler2D texture1;
        void main()
        { 
          vec4 tex_color0 = texture2D( texture0, f_tex_coord ); 
          vec4 tex_color1 = texture2D( texture1, f_tex_coord ); 
          vec3 useNormal = normalize(tex_color1.rgb * 2.0 - 1.0 );  
          gl_FragColor = tex_color0;    
          gl_FragColor.xyz += phong_model_lights( useNormal );  
        }`;
    }
   update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
    {                              // First, send the matrices to the GPU, additionally cache-ing some products of them we know we'll need:
      this.update_matrices( g_state, model_transform, gpu, gl );
      gl.uniform1f ( gpu.animation_time_loc, g_state.animation_time / 1000 );

      if( g_state.gouraud === undefined ) { g_state.gouraud = g_state.color_normals = false; }    // Keep the flags seen by the shader 
      gl.uniform1i( gpu.GOURAUD_loc,        g_state.gouraud || material.gouraud );                // program up-to-date and make sure 
      gl.uniform1i( gpu.COLOR_NORMALS_loc,  g_state.color_normals );                              // they are declared.

      gl.uniform4fv( gpu.shapeColor_loc,     material.color       );    // Send the desired shape-wide material qualities 
      gl.uniform1f ( gpu.ambient_loc,        material.ambient     );    // to the graphics card, where they will tweak the
      gl.uniform1f ( gpu.diffusivity_loc,    material.diffusivity );    // Phong lighting formula.
      gl.uniform1f ( gpu.specularity_loc,    material.specularity );
      gl.uniform1f ( gpu.smoothness_loc,     material.smoothness  );

      if( material.texture )                           // NOTE: To signal not to draw a texture, omit the texture parameter from Materials.
      { gpu.shader_attributes["tex_coord"].enabled = true;
        gl.uniform1f ( gpu.USE_TEXTURE_loc, 1 );

        var img0 = gl.getUniformLocation(this.program, "texture0");
        var img1 = gl.getUniformLocation(this.program, "texture1");

        gl.uniform1i(img0, 4);
        gl.uniform1i(img1, 5);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture( gl.TEXTURE_2D, material.texture.diffuse.id );
        gl.activeTexture(gl.TEXTURE5);
        gl.bindTexture( gl.TEXTURE_2D, material.texture.normal.id );
      }
      else  { gl.uniform1f ( gpu.USE_TEXTURE_loc, 0 );   gpu.shader_attributes["tex_coord"].enabled = false; }

      if( !g_state.lights.length )  return;
      var lightPositions_flattened = [], lightColors_flattened = [], lightAttenuations_flattened = [];
      for( var i = 0; i < 4 * g_state.lights.length; i++ )
        { lightPositions_flattened                  .push( g_state.lights[ Math.floor(i/4) ].position[i%4] );
          lightColors_flattened                     .push( g_state.lights[ Math.floor(i/4) ].color[i%4] );
          lightAttenuations_flattened[ Math.floor(i/4) ] = g_state.lights[ Math.floor(i/4) ].attenuation;
        }
      gl.uniform4fv( gpu.lightPosition_loc,       lightPositions_flattened );
      gl.uniform4fv( gpu.lightColor_loc,          lightColors_flattened );
      gl.uniform1fv( gpu.attenuation_factor_loc,  lightAttenuations_flattened );
    }
}