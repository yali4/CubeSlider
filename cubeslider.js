/*

    Copyright (c) 2014, Cube Slider Beta

    Yalçın Ceylan <http://www.yalcinceylan.net>

    Option Parameters : ( sizes | speed | sensitivity | childrens )

    Current Methods : ( next | prev )

 */

var CubeSlider, CubeMouseWheel,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Element.prototype.CubeSlider = function(options)
{
    return new CubeSlider(this, options);
};

Element.prototype.CubeMouseWheel = function(options)
{
    return new CubeMouseWheel(this, options);
}

CubeMouseWheel = (function(source, options){

    options = __extends({ preventDefault: false, stopPropagation: false, up : null, down : null }, options);

    var root = this,

    CubeFeedback = function(event)
    {
        root.MouseWheelEvent.call(root, this, event, options);
    };

    source.addEventListener('mousewheel', CubeFeedback, false);

    source.addEventListener('DOMMouseScroll', CubeFeedback, false);

});

CubeMouseWheel.prototype.MouseWheelEvent = function(source, event, options)
{
    if ( 'wheelDelta' in event ) wheelDelta = event.wheelDelta;

    else wheelDelta = -40 * event.detail;

    if ( typeof options.preventDefault === 'boolean' && options.preventDefault ) event.preventDefault();

    if ( typeof options.stopPropagation === 'boolean' && options.stopPropagation ) event.stopPropagation();

    if ( wheelDelta > 0 && typeof options.up === 'function' ) options.up.call(source, event);

    else if ( wheelDelta < 0 && typeof options.down === 'function' ) options.down.call(source, event);
};

CubeSlider = (function(container, options){

    this.container = container;

    this.options = __extends({

        sizes : { width: 140, height: 140 },

        speed : 2000,

        sensitivity : 25,

        childrens : {}

    }, options);

    this.figures = {

        front : { rotateY : 0 },

        back : { rotateX : -180 },

        right : { rotateY : -90 },

        left : { rotateY : 90 },

        top : { rotateX : 90 },

        bottom : { rotateX : -90 }

    };

    this.properties = ['webkitTransform', 'MozTransform', 'msTransform', 'OTransform', 'transform'];

    this.controller = {

        timer : null, duration : null, range : null, animation : false,

        position : { before : null, after : null }

    };

    this.coordinates = { current : 0, after : 0 };

    this.sections = { container : null, cube : null };

    this.prepare();

    return this;

});

CubeSlider.prototype.prepare = function()
{
    var root = this, sections = this.sections, options = this.options;

    sections.container = document.createElement('section');

    sections.container.classList.add('cubeContainer');

    sections.cube = document.createElement('div');

    sections.cube.classList.add('cube');

    sections.cube.CubeMouseWheel({

        preventDefault : true,

        up : function(event)
        {
            root.prev();
        },

        down: function(event)
        {
            root.next();
        }

    });

    for ( var alias in root.figures )
    {
        var effect, value, instance = root.figures[alias];

        var figure = document.createElement('figure');

        if ( __hasProp.call(instance, 'rotateY') ) effect = 'rotateY';

        else if ( __hasProp.call(instance, 'rotateX') ) effect = 'rotateX';

        value = instance[effect];

        figure.style.width = options.sizes.width + 'px';

        figure.style.height = options.sizes.height + 'px';

        root.properties.forEach(function(property){

            figure.style[property] = effect +'( '+ value +'deg ) translateZ( '+ (options.sizes.height / 2) +'px )';

        });

        figure.classList.add(alias);

        if ( __hasProp.call(options.childrens, alias) ) figure.innerHTML = options.childrens[alias];

        sections.cube.appendChild(figure);
    }

    sections.container.style.width = options.sizes.width + 'px';

    sections.container.style.height = options.sizes.height + 'px';

    sections.container.appendChild(sections.cube);

    root.container.appendChild(sections.container);

    root.setRotates();
};

CubeSlider.prototype.setRotates = function()
{
    var root = this;

    root.properties.forEach(function(property){

        root.sections.cube.style[property] = 'translateZ( -'+ (root.options.sizes.height / 2) +'px ) rotateX( '+root.coordinates.current+'deg )';

    });
};

CubeSlider.prototype.process = function()
{
    var root = this, controller = this.controller;

    if ( controller.animation === false || controller.position.after !== controller.position.before )
    {
        controller.position.before = controller.position.after;

        root.removeInterval();

        return controller.animation = true;
    }

    return false;
};

CubeSlider.prototype.complete = function()
{
    this.removeInterval();

    this.controller.animation = false;

    this.coordinates.current = this.coordinates.after;

    this.setRotates();
};

CubeSlider.prototype.createInterval = function()
{
    var root = this, controller = this.controller, coordinates = this.coordinates;

    controller.timer = setInterval(function(){

        if ( controller.position.after === 'next' )
        {
            coordinates.current += controller.range;

            root.setRotates();

            if ( coordinates.current >= coordinates.after ) root.complete();
        }

        else if ( controller.position.after === 'prev' )
        {
            coordinates.current -= controller.range;

            root.setRotates();

            if ( coordinates.current <= coordinates.after ) root.complete();
        }

    }, controller.duration);
};

CubeSlider.prototype.removeInterval = function()
{

    clearInterval(this.controller.timer);

};

CubeSlider.prototype.interval = function()
{
    var root = this, controller = this.controller, coordinates = this.coordinates, difference, milliseconds, ratio;

    if ( coordinates.after > coordinates.current )
    {
        difference = coordinates.after-coordinates.current;
    }
    else
    {
        difference = coordinates.current-coordinates.after;
    }

    difference = Math.abs(difference);

    milliseconds = root.options.speed / difference;

    ratio = Math.log(milliseconds);

    controller.duration = milliseconds / ratio;

    controller.range = (difference * 0.01) / ratio;

    root.createInterval();
};

CubeSlider.prototype.prev = function()
{
    this.controller.position.after = 'prev';

    this.change();
};

CubeSlider.prototype.next = function()
{
    this.controller.position.after = 'next';

    this.change();
};

CubeSlider.prototype.change = function(position)
{
    var root = this, options = this.options, controller = this.controller, coordinates = this.coordinates;

    if ( root.process() === false )
    {
        root.removeInterval();

        controller.duration -= controller.duration * ( options.sensitivity * 0.01 );

        controller.range += controller.range * 0.09;

        root.createInterval();

        return false;
    }

    var position = position || controller.position.after;

    if ( position === 'next' ) coordinates.after += 90;

    else if ( position === 'prev' ) coordinates.after -= 90;

    root.interval();
};