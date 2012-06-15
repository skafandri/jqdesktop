(function($){
    $.jqIcon = {version:'1.0'};
    var jqIconMethods = {
        init: function(options){//options must contain width, height and jqWindow instance
            var settings = $.extend({}, $.jqIcon.defaults, options);
            var Window = settings.window;                 
            var icon = $('<div class="jqdesktop-icon-container" id="jqicon-'+Window.attr('id')+'" style="outline:none;width:'+settings.width+'px; height:'+settings.height+'px;" tabindex="'+(++$.jqIcon.tabIndex)+'"></div>').data('jqDesktopIcon', settings);
            var divShadow = $('<div class="jqdesktop-icon-shadow"></div>');   
            var divIcon = $('<div class="jqdesktop-icon"></div>');
            var divImage = $('<div class="jqdesktop-icon-image"><img src="'+settings.icon+'" width="100%" /></div>');
            var divLabel = $('<div class="jqdesktop-icon-label ui-widget-header">'+settings.label+'</div>');
            icon.append(divShadow).append(divIcon.append(divImage).append(divLabel));
            icon.draggable({
                containment:'parent',
                snap:true,
                opacity:0.8,
                grid: [settings.width+20,settings.height+20],
                stack: '.jqdesktop-icon-container'
            });
            icon.bind('mousedown', function(){
                $(this).focus();
            });
            icon.bind('dblclick', function(){
                var Window = $(this).data('jqDesktopIcon').window;
                if (Window.data('jqDesktopWindow').status.minimized){
                    Window.jqWindow('unminimize');
                } else {
                    Window.jqWindow('show');
                }
                
            });
            icon.bind('focus', function(){
                $(this).parent().find('.jqdesktop-icon-shadow').css('opacity',0.2).css('border','none');
                $(this).find('.jqdesktop-icon-shadow').css('opacity',0.4).css('border','solid white thin');
            });
            icon.bind('keyup', function(event){
                switch(event.keyCode){
                    case 13:
                        $(this).trigger('dblclick');
                        break;
                    case 37:
                    case 38:
                        $('.jqdesktop-icon-container[tabindex="'+($(this).prop('tabindex')-1)+'"]').focus();                                              
                        break;
                    case 39:
                    case 40:
                        $('.jqdesktop-icon-container[tabindex="'+($(this).prop('tabindex')+1)+'"]').focus();                                              
                        break;
                }
            });
            return icon;
        }
    };
    $.jqIcon = function(method){
        if (jqIconMethods[method]){//call a method
            return jqIconMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
             return jqIconMethods.init.apply( this, arguments );
        }
    }
    $.jqIcon.defaults = {
        label:'New Icon',
        icon: '',
        width: 100,
        height:100,
        jqWindow:null
    }
    $.jqIcon.tabIndex = 0;
})(jQuery);