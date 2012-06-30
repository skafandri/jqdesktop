(function($){
    $.jqLayout = {version:'1.0'};
    var jqLayoutMethods = {
        init: function(options){
            return this.each(function(){     
                var $this = $(this);
                if ($this.data('jqLayout')) return;
                var settings = $.extend({}, $.jqLayout.defaults, options);
                var data = {
                    settings:settings
                }
                $this.data('jqLayout', data);                
                if (settings.layout.toUpperCase()=='BORDERLAYOUT'){
                    $this.jqLayout('borderLayout');
                    $this.bind('resize', function(){
                        $this.jqLayout('borderLayout');
                    });                                        
                }
            });
        },
        
        borderLayout: function(){
            return this.each(function(){
                var $this = $(this);
                var settings = $this.data('jqLayout').settings;
                $this.children().css('position','absolute');
                var north = $this.children('.north');
                var center = $this.children('.center');
                var east = $this.children('.east');
                var west = $this.children('.west');
                var south = $this.children('.south');
                if(center.length==0) throw 'At least a center panel should be available to use border Layout';
                north.data('layoutHeight', $.jqLayout.OriginalHeight(north));
                south.data('layoutHeight', $.jqLayout.OriginalHeight(south));
                east.data('layoutWidth', $.jqLayout.OriginalWidth(east));
                west.data('layoutWidth', $.jqLayout.OriginalWidth(west));
                
                var height = $this.height(); 
                var width = $this.width();
                var northHeight = 0;
                var southHeight = 0;
                var centerHeight = 0;
                var eastWidth = 0;
                var westWidth = 0;
                if(north.length){
                    if(north.data('layoutHeight')>0){
                        northHeight = north.data('layoutHeight');
                    } else {
                        northHeight = parseInt(settings.northHeight)*0.01*height;                      
                    }
                }                   
                if (south.length){                    
                    if(south.data('layoutHeight')>0){
                        southHeight = south.data('layoutHeight');;
                    } else {
                        southHeight = parseInt(settings.southHeight)*0.01*height;                         
                    }
                }        
                
                if (east.length){    
                    if(east.data('layoutWidth')>0){
                        eastWidth = east.data('layoutWidth');
                    } else {
                        eastWidth = parseInt(settings.eastWidth)*0.01*width;
                    }
                }
                if (west.length){
                    if(west.data('layoutWidth')>0){
                        westWidth = west.data('layoutWidth');
                    } else {
                        westWidth = parseInt(settings.westWidth)*0.01*width;
                    }
                }

                centerHeight = height-southHeight-northHeight;
                north.css({
                    top: 0,
                    left: 0,
                    width: width,
                    height: northHeight
                });
                center.css({
                    top: northHeight+settings.vgap,
                    left: westWidth+settings.hgap,
                    width: width-westWidth-eastWidth-2*settings.hgap,
                    height: centerHeight-2*settings.vgap
                });
                south.css({
                    top: northHeight+centerHeight,
                    left: 0,
                    width: width,
                    height: southHeight
                });
                west.css({
                    top : northHeight+settings.vgap,
                    left: 0,
                    width: westWidth,
                    height: centerHeight-2*settings.vgap
                });
                east.css({
                    top : northHeight+settings.vgap,
                    left: width-eastWidth,
                    width: eastWidth,
                    height: centerHeight-2*settings.vgap
                });               
            });
        },
        /**
         * Disable the layout manager
         */
        disable: function(){
            return this.each(function(){
                $(this).unbind('resize');
            });
        },
        enable: function(){
            return this.each(function(){
                $(this).jqLayout('borderLayout');
                $(this).bind('resize', function(){
                     $(this).jqLayout('borderLayout');
                });  
            });
        }
        
        
    };
    $.fn.jqLayout = function(method){
        if (jqLayoutMethods[method]){//call a method
            return jqLayoutMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return jqLayoutMethods.init.apply( this, arguments );
        }
    };
    
    $.jqLayout.defaults = {
        /**
         * Layout algorithm
         * Possible values:
         *  - BorderLayout
         *  - BoxLayout  (under construction)
         *  - CardLayout (under construction)
         *  - FlowLayout (under construction)
         *  - GridBagLayout (under construction)
         *  - GridLayout (under construction)
         */
        layout: 'BorderLayout',
        northHeight: '10%',
        southHeight: '10%',
        eastWidth: '20%',
        westWidth: '20%',
        hgap: 1,
        vgap: 1
    }
    $.jqLayout.OriginalHeight =function(element){
        var height=0;
        if (element.children().length>0){
            var temp = $('<div></div>');
            temp.append(element.children());
            height = element.height();
            element.append(temp.children());
        } else {
            var html=element.html();
            element.html('');
            height = element.height();
            element.html(html);
        }
        return height;
    }
    
    $.jqLayout.OriginalWidth =function(element){
        var width=0;
        if (element.children().length>0){
            var temp = $('<div></div>');
            temp.append(element.children());
            width = element.width();
            element.append(temp.children());
        } else {
            var html=element.html();
            element.html('');
            width = element.width();
            element.html(html);
        }
        return width;
    }
})(jQuery);