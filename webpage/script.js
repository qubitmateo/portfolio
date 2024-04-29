
// Codigo del shadder

const canvasEl = document.querySelector("#fire-overlay");
const scrollMsgEl = document.querySelector(".scroll-msg");

const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
// const devicePixelRatio = 1;

const params = {
    fireTime: .35,
    fireTimeAddition: 0
}

let st, uniforms;
const gl = initShader();

st = gsap.timeline({
    scrollTrigger: {
        trigger: ".page",
        start: "0% 0%",
        end: "100% 100%",
        // markers: true,
        scrub: true,
        onLeaveBack: () => {
            params.fireTimeAddition = Math.min(params.fireTimeAddition, .3);
            gsap.to(params, {
                duration: 0.75,
                fireTimeAddition: 0
            })
        },
    },
})
	 .to(scrollMsgEl, {
	   duration: .1,
   	opacity: 0
    }, 0)
    .to(params, {
        fireTime: .63
    }, 0)


window.addEventListener("resize", resizeCanvas);
resizeCanvas();

gsap.set(".page", {
    opacity: 1
})


function initShader() {
    const vsSource = document.getElementById("vertShader").innerHTML;
    const fsSource = document.getElementById("fragShader").innerHTML;

    const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

    if (!gl) {
        alert("WebGL is not supported by your browser.");
    }

    function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
    uniforms = getUniforms(shaderProgram);

    function getUniforms(program) {
        let uniforms = [];
        let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);

    const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    return gl;
}

function render() {
    const currentTime = performance.now();
    gl.uniform1f(uniforms.u_time, currentTime);

    if (st.scrollTrigger.isActive && st.scrollTrigger.direction === 1) {
        params.fireTimeAddition += .001;
    }

    gl.uniform1f(uniforms.u_progress, params.fireTime + params.fireTimeAddition);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}

function resizeCanvas() {
    canvasEl.width = window.innerWidth * devicePixelRatio;
    canvasEl.height = window.innerHeight * devicePixelRatio;
    gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    gl.uniform2f(uniforms.u_resolution, canvasEl.width, canvasEl.height);
    render();
}



// Cerrar menu al hacer scroll se supone
document.addEventListener('scroll', function() {
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle.checked) {
        menuToggle.checked = false;
    }
});

// Scroll vertical sin barra de scroll


// document.addEventListener('DOMContentLoaded', function() {
//     // Configurar el comportamiento de desplazamiento suave
//     document.body.style.scrollBehavior = 'smooth';

//     // Factor de velocidad para el desplazamiento suave
//     const scrollFactor = 0.1; // Puedes ajustar este valor según tus preferencias

//     // Agregar evento de escucha para la rueda del mouse
//     document.body.addEventListener('wheel', function(e) {
//         // Verificar si la rueda del mouse se está moviendo verticalmente
//         if (e.deltaY !== 10) {
//             // Prevenir el comportamiento predeterminado de la rueda del mouse
//             e.preventDefault();

//             // Calcular el desplazamiento suave basado en el valor de deltaY y el factor de velocidad
//             const smoothScroll = e.deltaY * scrollFactor;

//             // Obtener la cantidad de desplazamiento vertical actual
//             const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            
//             // Calcular la nueva posición de desplazamiento sumando el desplazamiento suave
//             const newScrollPosition = currentScrollPosition + smoothScroll;
            
//             // Establecer la nueva posición de desplazamiento
//             window.scrollTo(0, newScrollPosition);
//         }
//     }, { passive: false }); // Desactivar el marcado pasivo para este evento
// });
