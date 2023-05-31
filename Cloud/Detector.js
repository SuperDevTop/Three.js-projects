Detector = {
    canvas: !!window.CanvasRenderingContext2D,
    webgl: (function() {
        try{
            return !!window.WebGL2RenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
        } catch (e) {
            return false;
        }
    })(),
    workers: !!window.Worker,
    fileapi: window.File && window.FileReader && window.FileList && window.Blob,

    getWebGLErrormessage: function() {
        var domElement = document.createElement('div');

        domElement.style.fontFamily = 'monospace';
        domElement.style.fontSize = '13px';
        domElement.style.textAlign = 'center';
        domElement.style.background = '#eee';
        domElement.style.color = '#000';
        domElement.style.padding = '1em';
        domElement.style.margin = '5em auto 0';

        if(!this.webgl) {

            domElement.innerHTML = window.WebGLRenderingContext ? [
                'sorry , your graphic card doesnt support '].join('\n') :
            [
                'sorry your brower dosnt support',
                'plz try with other'
            ].join('\n');

        }
        
        return domElement;
    },
    addGetWebGLMessage: function(parameters) {

        var parent, id, domElement;
        parameters = parameters || {};

        parent = parameters.parent !== undefined ? parameters.parent : document.body;
        id = parameters.id !== undefined ? parameters.id : 'oldie';

        domElement = Detector.getWebGLErrormessage();
        domElement.id = id;

        parent.appendChild(domElement);
    }
};