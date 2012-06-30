
(function($){
    $.jqWindow = {version:'1.0'};
    var jqWindowMethods = {
        _init: function(options){
            return this.map(function(){
                var $this = $(this);
                var settings = $.extend({}, $.jqWindow.defaults, options);                
                if ($this.data('jqDesktopWindow')) return $this; //If plugin is already initiated abort
                var css = {
                    container:{
                        position:'absolute'
                    },
                    title:{
                        cursor:'move'
                    }
                }
                var id = 'jqwindow-'+$.now();
                settings.id = id;               
                if (settings.title=='' && $this.prop('title')!=''){
                    settings.title = $this.attr('title');
                } 
                
                var windowContainer = $('<div class="jqdesktop-window-container ui-widget-content" id="'+id+'" style="display:none"></div>').css(css.container);
                var windowContent = $('<div class="jqdesktop-window-content center" style="overflow:hidden"></div>');
                var windowTitleBar = $('<div class="jqdesktop-window-titlebar ui-widget-header north" style="height:24px"></div>').css(css.title);
                var titleBarIcon = $('<div class="jqdesktop-window-titlebar-icon" style="width:24px; float:left"><img  width="100%" height="100%" src="'+settings.icon+'"/></div>');
                var titleBarLabel = $('<div class="jqdesktop-window-titlebar-label" style="float:left; padding-top:6px; padding-left:6px"></div>'); 
                var titleBarButtonsContainer = $('<div class="jqdesktop-window-titlebar-buttons" style="float:right"></div>');
                
                var buttonClose = $('<button class="jqdesktop-window-titlebar-button-close"></button>').button({icons: {primary: "ui-icon-closethick"}, text:false});
                var buttonMaximize = $('<button class="jqdesktop-window-titlebar-button-maximize"></button>').button({icons: {primary: "ui-icon-extlink"}, text:false});
                var buttonRestore = $('<button class="jqdesktop-window-titlebar-button-restore"></button>').button({icons: {primary: "ui-icon-newwin"}, text:false});
                var buttonMinimize = $('<button class="jqdesktop-window-titlebar-button-minimize"></button>').button({icons: {primary: "ui-icon-minusthick"}, text:false});

                windowContainer.append(windowTitleBar.append(titleBarIcon, titleBarLabel, titleBarButtonsContainer.append(buttonMinimize,buttonMaximize,buttonRestore,buttonClose))).append(windowContent);
                windowContainer.css({width:settings.width+'px',height:settings.height+'px'});
                var data ={
                    components:{
                        windowContainer: windowContainer,
                        windowContent: windowContent,
                        windowTitleBar:windowTitleBar,
                        titleBarIcon:titleBarIcon,
                        titleBarLabel:titleBarLabel,
                        titleBarButtonsContainer:titleBarButtonsContainer,
                        buttonClose:buttonClose,
                        buttonMaximize:buttonMaximize,
                        buttonRestore:buttonRestore,
                        buttonMinimize:buttonMinimize
                    },                    
                    settings: settings,
                    status:{opened:false}
                };   
                windowContainer.data('jqDesktopWindow', data);                
                $(this).replaceWith(windowContainer);
                windowContent.append($this);                 
                windowContainer.jqLayout();                
                windowContainer.jqWindow('_repaint');
                windowContainer.jqWindow('_events');                                  
                return windowContainer;
            });                        
        },
        
        _repaint: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                var status = data.status;
                var components = data.components;
                var container = components.windowContainer;
                var titleBar = components.windowTitleBar;
                var settings = data.settings;                
                components.titleBarLabel.text(settings.title);
                //Action buttons
                components.titleBarButtonsContainer.find('button').hide();
                if (settings.closable) components.buttonClose.show();
                if (settings.maximizable) components.buttonMaximize.show();
                if (settings.minimizable) components.buttonMinimize.show();
                if (status.maximized){
                    components.buttonRestore.show();
                    components.buttonMaximize.hide();
                }
                //Movable
                if (settings.movable){
                    container.draggable({
                        handle:titleBar,
                        stack: '.jqdesktop-window-container',
                        opacity: 0.9,
                        containment:'parent'
                    });
                }
                //Resizable
                var minWidth = components.titleBarIcon.outerWidth()+components.titleBarLabel.outerWidth()+components.titleBarButtonsContainer.outerWidth()+3;
                if (settings.resizable){
                    container.resizable({
                        containment:'parent',
                        minHeight:100,
                        minWidth:minWidth
                    });
                }         
            });            
        },
        
        _events: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                var components = data.components;
                var container = components.windowContainer;
                container.bind('dragstop',function(){
                   $.jqWindow.status.zIndex = $(this).css('z-index'); 
                });
                container.bind('mousedown', function(){
                    data.desktop.jqDesktop('activateWindow', $(this));                    
                });
                //Close button
                components.buttonClose.click(function(){
                    $this.jqWindow('close');
                });
                //Minimize button
                components.buttonMinimize.click(function(){                    
                    $this.jqWindow('minimize');
                });
                //Maximize button
                components.buttonMaximize.click(function(){
                    $this.jqWindow('maximize');
                    components.buttonMaximize.hide();
                    components.buttonRestore.show();                    
                });
                //Title bar double click
                components.windowTitleBar.bind('dblclick', function(){
                    if (components.buttonMaximize.is(':visible')){
                        components.buttonMaximize.click();
                        return;
                    }
                    if (components.buttonRestore.is(':visible')){
                        components.buttonRestore.click();
                        return;
                    }
                });
                //Restore button
                components.buttonRestore.click(function(){
                    $this.jqWindow('restore');
                    components.buttonRestore.hide(); 
                    components.buttonMaximize.show();                                       
                });
                //Window activated
                container.bind('windowActivated', function(){
                    $this.jqWindow('_repaint');                              
                });
                container.bind('windowAdded', function(){
                    if(data.settings.maximized) components.buttonMaximize.click();
                    //First time open
                    if (!data.status.opened){
                        if (data.settings.visible){
                            $this.jqWindow('show');
                        }
                    }
                });
            });
        },
        minimize: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){
                    data.desktop.jqDesktop('minimizeWindow', $this);
                }
            });
        },
        unminimize: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){
                    data.desktop.jqDesktop('unminimizeWindow', $this);
                }
            });
        },
        maximize: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){
                    data.desktop.jqDesktop('maximizeWindow', $this);
                }
            });
        },
        restore: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){
                    data.desktop.jqDesktop('restoreWindow', $this);
                }
            });
        },
        close: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){
                    data.desktop.jqDesktop('closeWindow', $this);
                }
            });
        },
        

        hide: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){                    
                    data.desktop.jqDesktop('hideWindow', $this);
                }
                $this.hide();
            });
        },
        show: function(){
            this.each(function(){
                var $this = $(this);                
                var data = $this.data('jqDesktopWindow');
                if (!data){//If window is disposed, then data is undefined
                    return;
                }
                if(data.desktop){                    
                    data.desktop.jqDesktop('showWindow', $this);
                    data.desktop.jqDesktop('activateWindow', $this); 
                }                
                $this.show().jqWindow('activateWindow');
                if (!data.status.opened){
                    $.extend(true,$this.data('jqDesktopWindow'),{status:{opened:true}});
                    $this.trigger('windowFirstOpen');
                }
            });
        },
        dispose: function(){
            this.each(function(){
                var $this = $(this);
                var data = $this.data('jqDesktopWindow');
                if(data.desktop){
                    data.desktop.jqDesktop('disposeWindow', $this);                    
                }
                $this.remove();
            });
        },
        setContent: function(newContent){
            this.each(function(){
                var $this = $(this);
                $this.data('jqDesktopWindow').components.windowContent.html('').append(newContent);                
            });
        }
    };
    
    /**
     * jqWindow plugin entry point
     */
    $.fn.jqWindow = function(method){
        if (jqWindowMethods[method]){//call a method
            return jqWindowMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
             return jqWindowMethods._init.apply( this, arguments );
        }
    }
    $.jqWindow = function(method){
        return $('<div></div>').jqWindow(method)[0];
    }
    $.jqWindow.defaults = {
        /*** Dimensions ***/
        width:600,
        height:300,
        /*** Layout ***/
        //If title property is available, it will be used as title
        title: '',
        //Window Icon
        icon:'',
        /*
            Start up position, default='center'
            Possible values: 'top', 'bottom', 'left', 'right', 'center'
            Support coupled positions. exemple: 'top right', 'left bottom'            
            For coupled positions, default is center, means 'top' is equivalent to 'top center'
        */        
        position:'center', 
        visible:false,
        showInTaskBar:true,
        showDesktopIcon:true,
        /*** Behaviour ***/
        movable:true,
        resizable:true,
        maximizable:true,
        minimizable:true,
        closable:true,
        /**
         * Operation when clicking close button
         * Possible values:
         *  - 'DO_NOTHING_ON_CLOSE': Do nothing, just trigger [windowclosing] event, usefull for pragmatically handling closing behaviour
         *  - 'HIDE_ON_CLOSE': [Default value] Hide the window (also remove from taskBar) window can be shown again using $('selector').jqWindow('show')
         *  - 'DISPOSE_ON_CLOSE': Remove the window from the DOM
         */
        defaultCloseOperation:'HIDE_ON_CLOSE',
        /**
         * Enable/Disable window animation
         * Animation occures on: maximize, restore, minimize, unminimize
         */
        
        animated: true,
        animationSpeed:150,
        maximized:false
    }
    
    //Global jqWindow status
    $.jqWindow.status ={zIndex:1}
    //Default close operation constants
    $.jqWindow.DO_NOTHING_ON_CLOSE = 1;
    $.jqWindow.HIDE_ON_CLOSE  = 2;
    $.jqWindow.DISPOSE_ON_CLOSE  = 3;
})(jQuery);