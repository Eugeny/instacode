shaderCodeVertex = `
    precision mediump float;

    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying highp vec2 vTextureCoord;

    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform vec2 uSize;

    void main(void) {
        vec3 pos = aVertexPosition;
        pos.y /= uSize.x / uSize.y;
        gl_Position = uPMatrix * uMVMatrix * vec4(pos, 1.0);
        vTextureCoord = aTextureCoord;
    }
`

shaderCodeFragment = `
    precision mediump float;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform sampler2D uPixelSampler;

    uniform vec2 uSize;
    uniform vec2 uBufferSize;
    uniform bool u_pixels;
    uniform bool u_LCDpixels;

    void main(void) {
        float k = 1.0;
        vec2 uv = vTextureCoord;
        vec2 pixelUV = vTextureCoord;

        float SCALE = 1.5;

        pixelUV.x *= uSize.x / SCALE;
        pixelUV.y *= uSize.y / SCALE;

        if (u_pixels) {
            uv.x = floor(pixelUV.x) / uSize.x * SCALE;
            uv.y = floor(pixelUV.y) / uSize.y * SCALE;
        }

        vec4 color = texture2D(uSampler, uv.xy);

        k = texture2D(uPixelSampler, pixelUV).r;
        float kR = 1.0 - texture2D(uPixelSampler, vec2(pixelUV.x - 0.25, 0.5)).r;
        float kG = 1.0 - texture2D(uPixelSampler, vec2(pixelUV.x - 0.5, 0.5)).r;
        float kB = 1.0 - texture2D(uPixelSampler, vec2(pixelUV.x - 0.75, 0.5)).r;

        if (u_pixels) {
            color.r *= k;
            color.g *= k;
            color.b *= k;

            if (u_LCDpixels) {
                color.r *= kR * 3.0;
                color.g *= kG * 3.0;
                color.b *= kB * 3.0;
            }
        }

        gl_FragColor = vec4(color.rgb, 1);
    }
`

shaderPPCodeVertex = `
    precision mediump float;

    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;
    varying highp vec2 vTextureCoord;

    void main(void) {
        gl_Position = vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;
    }
`

shaderPPCodeFragment = `
    precision mediump float;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform sampler2D uNoiseSampler;

    uniform vec2 uScreenSize, uFBSize;

    uniform bool u_sepia, u_desaturate, u_tiltshift, u_vignette, u_noise;

    uniform int uPass;


    float rand(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453) - 0.5;
    }

    void main(void) {
        vec2 uv = vTextureCoord;
        vec2 framebufferUV = uv;
        framebufferUV.x *= uScreenSize.x / uFBSize.x;
        framebufferUV.y *= uScreenSize.y / uFBSize.y;

        vec4 color = texture2D(uSampler, framebufferUV);

        float dx = uv.x * 2.0 - 1.0;
        float dy = uv.y * 2.0 - 1.0;
        float d  = sqrt(dx*dx + dy*dy);


        // Noise
        vec4 seed = texture2D(uNoiseSampler, uv * 10.0);
        if (u_noise && uPass == 1) {
            float k = 0.1;
            color.r -= rand(seed.xy + uv) * k;
            color.g -= rand(seed.yz + uv) * k;
            color.b -= rand(seed.zx + uv) * k;
        }


        // TILT SHIFT
        vec4 sum = color;
        float k = d;
        float distance = k * 0.005;

        int kX = 0;
        int kY = 0;
        if (uPass == 1) kX = 1;
        if (uPass == 2) kY = 1;

        sum += texture2D(uSampler, framebufferUV + vec2(-4*kX, -4*kY) * distance) * 0.1;
        sum += texture2D(uSampler, framebufferUV + vec2(-3*kX, -3*kY) * distance) * 0.2;
        sum += texture2D(uSampler, framebufferUV + vec2(-2*kX, -2*kY) * distance) * 0.4;
        sum += texture2D(uSampler, framebufferUV + vec2(-1*kX, -1*kY) * distance) * 0.8;
        sum += texture2D(uSampler, framebufferUV + vec2(+1*kX, +1*kY) * distance) * 0.8;
        sum += texture2D(uSampler, framebufferUV + vec2(+2*kX, +2*kY) * distance) * 0.4;
        sum += texture2D(uSampler, framebufferUV + vec2(+3*kX, +3*kY) * distance) * 0.2;
        sum += texture2D(uSampler, framebufferUV + vec2(+4*kX, +4*kY) * distance) * 0.1;

        if (u_tiltshift) {
            sum /= 4.0;
            color = sum;
        }

        // VIGNETTE
        if (u_vignette && uPass == 1) {
            float k = 1.0 - clamp(d - 0.3, 0.0, 1.0);
            color.rgb *= k;
        }

        // B&W
        if (u_desaturate && uPass == 1) {
            color.r = color.g = color.b = (color.r + color.g + color.b) / 3.0;
        }

        // SEPIA
        if (u_sepia && uPass == 1) {
            color.r += 0.2;
            color.g += 0.1;
            color.b -= 0.1;
        }

        gl_FragColor = color;
    }
`


requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

window.Renderer = class Renderer {
    constructor(display, assets) {
        this.assets = assets;
        this.display = display;
        this.objectPosition = [0,0,0];
        this.objectRotation = [0,0];
        this.objectShaders = {};
        this.initGL();
        this.tick();
    }

    initGL() {
        this.gl = this.display.getContext('experimental-webgl', {preserveDrawingBuffer: true});

        if (!this.gl) {
            return;
        }

        this.gl.clearColor(0.5,0.5,0.5,1);
        this.gl.disable(this.gl.DEPTH_TEST);

        console.log('Preparing main shader');
        this.shader = this.compileShader(shaderCodeVertex, shaderCodeFragment);
        console.log('Preparing PP shader');
        this.shaderPP = this.compileShader(shaderPPCodeVertex, shaderPPCodeFragment);

        this.rtFB = this.gl.createFramebuffer();
        this.rtFB2 = this.gl.createFramebuffer();

        this.glVertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glVertexBuffer);
        vertices = [
             1,  1, 0,
            -1,  1, 0,
             1, -1, 0,
            -1, -1, 0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);


        this.glVertex2Buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glVertex2Buffer);
        s = 3;
        vertices2 = [
             s,  s, 0,
            -s,  s, 0,
             s, -s, 0,
            -s, -s, 0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices2), this.gl.STATIC_DRAW);

        this.glUVBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glUVBuffer);
        uv = [
            1, 1,
            0, 1,
            1, 0,
            0, 0,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv), this.gl.STATIC_DRAW);

        this.glUV2Buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glUV2Buffer);
        uv2 = [
             2, -1,
            -1, -1,
             2,  2,
            -1,  2,
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(uv2), this.gl.STATIC_DRAW);


        this.mvMatrix = mat4.create();
        return this.pMatrix = mat4.create();
    }


    compileShader(v, f) {
        console.log('Compiling FS');
        fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragmentShader, f);
        this.gl.compileShader(fragmentShader);
        console.log(this.gl.getShaderInfoLog(fragmentShader));

        console.log('Compiling VS');
        vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertexShader, v);
        this.gl.compileShader(vertexShader);
        console.log(this.gl.getShaderInfoLog(vertexShader));

        console.log('Linking');
        shader = this.gl.createProgram();
        this.gl.attachShader(shader, vertexShader);
        this.gl.attachShader(shader, fragmentShader);
        this.gl.linkProgram(shader);
        console.log(this.gl.getProgramInfoLog(shader));

        shader.vertexPositionAttribute = this.gl.getAttribLocation(shader, "aVertexPosition");
        this.gl.enableVertexAttribArray(shader.vertexPositionAttribute);
        shader.uvAttribute = this.gl.getAttribLocation(shader, "aTextureCoord");
        this.gl.enableVertexAttribArray(shader.uvAttribute);

        return shader;
    }

    tick() {
        requestAnimationFrame(() => {
            return this.tick();
        }
        );
        return this.render();
    }

    render() {
        if (!this.gl || !this.texture) {
            return;
        }

        this.gl.viewport(0, 0, this.display.width, this.display.height);

        // ------------------------
        // Render tilt
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rtFB);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        mat4.identity(this.mvMatrix);
        mat4.translate(this.mvMatrix, this.objectPosition);
        mat4.rotateY(this.mvMatrix, this.objectRotation[0]);
        mat4.rotateX(this.mvMatrix, this.objectRotation[1]);
        mat4.identity(this.pMatrix);
        mat4.perspective(45, this.display.width / this.display.height, 0.01, 100.0, this.pMatrix);

        this.gl.useProgram(this.shader);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glVertex2Buffer);
        this.gl.vertexAttribPointer(this.shader.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glUV2Buffer);
        this.gl.vertexAttribPointer(this.shader.uvAttribute, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.pixelTexture);

        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, "uSampler"), 0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, "uPixelSampler"), 1);

        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "uPMatrix"), false, this.pMatrix);
        this.gl.uniformMatrix4fv(this.gl.getUniformLocation(this.shader, "uMVMatrix"), false, this.mvMatrix);
        this.gl.uniform2f(this.gl.getUniformLocation(this.shader, "uSize"), this.original.width, this.original.height);
        this.gl.uniform2f(this.gl.getUniformLocation(this.shader, "uBufferSize"), this.source.width, this.source.height);

        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, 'u_pixels'), Number(this.objectShaders.pixels));
        this.gl.uniform1i(this.gl.getUniformLocation(this.shader, 'u_LCDpixels'), Number(this.objectShaders.LCDpixels));

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        //-------------------------

        // ------------------------
        // Render FX
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.useProgram(this.shaderPP);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glVertexBuffer);
        this.gl.vertexAttribPointer(this.shaderPP.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glUVBuffer);
        this.gl.vertexAttribPointer(this.shaderPP.uvAttribute, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rtTexture);
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.noiseTexture);

        this.gl.uniform1i(this.gl.getUniformLocation(this.shaderPP, "uSampler"), 0);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shaderPP, "uNoiseSampler"), 1);

        this.gl.uniform2f(this.gl.getUniformLocation(this.shaderPP, "uScreenSize"), this.display.width, this.display.height);
        this.gl.uniform2f(this.gl.getUniformLocation(this.shaderPP, "uFBSize"), this.rtFB.width, this.rtFB.height);

        for (k in this.objectShaders) {
            this.gl.uniform1i(this.gl.getUniformLocation(this.shaderPP, 'u_' + k), Number(this.objectShaders[k]));
        };

        // Pass 1
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rtFB2);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shaderPP, "uPass"), 1);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        // Pass 2
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rtTexture2);
        this.gl.uniform1i(this.gl.getUniformLocation(this.shaderPP, "uPass"), 2);
        return this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

        // ------------------------

    createTexture(cb) {
        if (!this.gl) {
            return;
        }

        tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);

        ext = this.gl.getExtension("EXT_texture_filter_anisotropic");
        ext |= this.gl.getExtension("MOZ_EXT_texture_filter_anisotropic");
        ext |= this.gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic");

        if (ext) {
            this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
        }

        cb();
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        return tex;
    }


    nextHighestPowerOfTwo(x) {
        x -= 1;
        i = 1;
        while (i < 32) {
            (() => {
                x = x | (x >> i);
                return i <<= 1;
            })();
        };
        return x + 1;
    }

    prepareImage(img, scale) {
        if (!this.gl) {
            return;
        }

        isPowerOfTwo = function(x) {
            return (x & (x - 1)) === 0;
        };

        if (typeof scale === 'undefined' || scale === null) { scale = 1; };

        if (!(isPowerOfTwo(img.width) && isPowerOfTwo(img.height))) {
            canvas = document.createElement("canvas");
            canvas.width = this.nextHighestPowerOfTwo(img.width) * scale;
            canvas.height = this.nextHighestPowerOfTwo(img.height) * scale;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            img = canvas;
        }
        return img;
    }


    setTexture(img) {
        if (!this.gl) {
            return;
        }

        this.original = img;
        this.source = this.prepareImage(img);

        this.texture = this.createTexture(() => {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.source);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            return this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        }
        );

        this.pixelTexture = this.createTexture(() => {
            //@gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MAG_FILTER, @gl.NEAREST)
            //@gl.texParameteri(@gl.TEXTURE_2D, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR)
            return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.assets.pixels);
        }
        );

        this.noiseTexture = this.createTexture(() => {
            return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.assets.noise);
        }
        );

        this.rtTexture = this.createTexture(() => {
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.rtFB.width, this.rtFB.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        });

        this.rtTexture2 = this.createTexture(() => {
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            return this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.rtFB.width, this.rtFB.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        });


        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rtFB);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rtTexture);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.rtTexture, 0);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rtFB2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rtTexture2);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.rtTexture2, 0);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    resize(w, h) {
        if (!this.gl) {
            return;
        }

        this.display.width = w;
        this.display.height = h;

        this.rtFB.width = this.nextHighestPowerOfTwo(this.display.width);
        this.rtFB.height = this.nextHighestPowerOfTwo(this.display.height);
        this.rtFB2.width = this.nextHighestPowerOfTwo(this.display.width);
        this.rtFB2.height = this.nextHighestPowerOfTwo(this.display.height);

        console.log('Resized renderer,', w, 'x', h, '| framebuffer', this.rtFB.width, 'x', this.rtFB.height);

        $(this.display).css({
            width: `${this.display.width}px`,
            height: `${this.display.height}px`
        });

        if (this.original) {
            return this.setTexture(this.original);
        }
    }
};
