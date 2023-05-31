Detector = {

    canvas: !!window.CanvasRenderingContext2D,
    webgl: (function() {
        try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    })(),
    workers: !!window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,

    getWebGLErrorMessage: function() {

        var domElement = document.createElement('div');

        domElement.style.fontFamily = 'monospace';
        domElement.style.fontSize = '13px';
        domElement.style.textAlign = 'center';
        domElement.style.background = '#eee';
        domElement.style.color = '#000';
        domElement.style.padding = '1em';
        domElement.style.width = '475px';
        domElement.style.margin = '5em auto 0';

        if (!this.webgl) {

            domElement.innerHTML = window.WebGLRenderingContext ? [
                'Sorry, your graphics card doesn\'t support'
            ].join('\n') : [
                'Sorry, your browser doesn\'t support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a><br/>',
                'Please try with'
            ].join('\n');

        }

        return domElement;

    },

    addGetWebGLMessage: function(parameters) {

        var parent, id, domElement;

        parameters = parameters || {};

        parent = parameters.parent !== undefined ? parameters.parent : document.body;
        id = parameters.id !== undefined ? parameters.id : 'oldie';

        domElement = Detector.getWebGLErrorMessage();
        domElement.id = id;

        parent.appendChild(domElement);

    }

};