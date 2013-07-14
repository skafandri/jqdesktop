/*
    JQDesktop
    =========

    JQDesktop jQuery plugin

    Copyright (C) 2013  ilyes kooli

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 3.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/gpl.html>
 */

(function($){
    $.jqTaskBar = {version:'1.0'};
    var jqTaskBarMethods = {
        init: function(options){
            return this.each(function(){
                var $this = $(this);
                if ($this.data('jqDesktopTaskbar')) return; //If plugin is alread initiated abort
                $this.html('');
                $this.data('jqDesktopTaskBar', $.extend({},options, {settings:{_windows:[]}}));                
            });
        },
        addWindow: function(jqWindow){
            return this.each(function(){
                var $this = $(this);
                jqWindow.each(function(){
                    var Window = $(this);
                    if ($.inArray(Window, $this.data('jqDesktopTaskBar').settings._windows)>-1) return;
                    $this.data('jqDesktopTaskBar').settings._windows.push(Window);
                    var windowSettings = Window.data('jqDesktopWindow').settings;
                    var id = 'jqtaskbar-'+windowSettings.id;
                    var taskBar = $('<div class="jqdesktop-taskbar-container ui-widget-header" id="'+id+'" style="display:none"></div>').data('jqWindow', Window).jqTaskBar();
                    var icon = $('<div class="jqdesktop-taskbar-icon" style="width:'+($.jqTaskBar.settings.iconWidth)+'px;height:'+($.jqTaskBar.settings.iconHeight)+'px"><img src="'+(windowSettings.icon)+'" width="100%" height="100%"/></div>');
                    var label = $('<div class="jqdesktop-taskbar-label">'+windowSettings.title+'</div>');
                    $this.append(taskBar.append(icon,label));
                    taskBar.jqTaskBar('_events');
                    $this.jqTaskBar('_repaint');
                    
                });
            });
        },
        
        _repaint: function(){
            
        },
        _events: function(){
            this.each(function(){
                var $this = $(this);
                //Hover effect
                $this.hover(
                    function(){
                        $(this).addClass('ui-state-hover');
                    },
                    function(){
                        $(this).removeClass('ui-state-hover');
                    }
                );
                //Click event
                $this.click(function(){
                    var Window = $(this).data('jqWindow');
                    var status = Window.data('jqDesktopWindow').status; 3
                    //If window is active minimize it, otherwize activate it
                    if (status.active){
                        if (status.minimized){
                            $this.parent().jqTaskBar('unminimizeWindow', Window);
                        } else {
                            $this.parent().jqTaskBar('minimizeWindow', Window);
                        }
                    } else {
                        if (status.minimized){
                            $this.parent().jqTaskBar('unminimizeWindow', Window);
                        } else {
                            $this.parent().jqTaskBar('activateWindow', Window);
                        }                        
                    }
                });
            });
        },
        getForegroundWindow: function(){
            //console.log($(this).data('jqDesktopTaskBar').desktop);
            var desktop = $(this).data('jqDesktopTaskBar').desktop;
            var max=0;
            var Window = null;
            $.map(desktop.find('.jqdesktop-window-container:visible'), function(e,n){
                //console.log($(e).attr('id')+' : '+parseInt($(e).css('z-index'))||0);
                var zindex =  parseInt($(e).css('z-index'))||0 ;
                if (zindex>max){
                    max = zindex;
                    Window = $(e);
                }
            });                                   
            return Window;
        },
        activateWindow: function(jqWindow){
            this.each(function(){
                $(this).find('.jqdesktop-taskbar-container').removeClass('ui-state-active');
                if (!jqWindow) return;
                jqWindow.each(function(){
                    var Window = $(this);
                    var data = Window.data('jqDesktopWindow');
                    
                    var windowSettings = data.settings;
                    $('#jqtaskbar-'+windowSettings.id).addClass('ui-state-active');
                    if (data.status.active) return;
                    Window.css('z-index', ++$.jqWindow.status.zIndex);
                    var windows = data.desktop.data('jqDesktopDesktop')._windows;
                    for (var i in windows){
                        $.extend(true,windows[i].data('jqDesktopWindow'), {status:{active:false}});  
                        windows[i].find('.jqdesktop-window-titlebar').removeClass('ui-state-focus');
                    }
                    
                    $.extend(true,Window.data('jqDesktopWindow'), {status:{active:true}});
                    Window.find('.jqdesktop-window-titlebar').addClass('ui-state-focus');
                    Window.trigger('windowActivated');
                });
            });
        },
        minimizeWindow: function(jqWindow){
            this.each(function(){
                var $this = $(this);
                jqWindow.each(function(){
                    var Window = $(this);
                    var data = Window.data('jqDesktopWindow');
                    var windowSettings = data.settings;
                    var taskBar = $('#jqtaskbar-'+windowSettings.id);
                    $.extend(true,Window.data('jqDesktopWindow'), {status:{positionMinimize:{
                                top:Window.position().top,
                                left:Window.position().left,
                                width:Window.width(),
                                height:Window.height()
                            }, minimized:true}});
                    if (windowSettings.animated){
                        Window.jqLayout('disable');
                        Window.animate(
                            {
                                top:taskBar.position().top,
                                left:taskBar.position().left,
                                width:taskBar.width(),
                                height:taskBar.height()
                            },
                            {
                                duration:windowSettings.animationSpeed,
                                step:function(){
                                    Window.jqLayout('borderLayout');
                                },
                                complete:function(){
                                    Window.hide();
                                    Window.jqLayout('enable');
                                    $this.jqTaskBar('activateWindow', $this.jqTaskBar('getForegroundWindow'));
                                }
                            }
                            
                            
                        )
                    } else {
                        Window.hide();
                        $this.jqTaskBar('activateWindow', $this.jqTaskBar('getForegroundWindow'));                        
                    }                    
                });
            });
        },
        unminimizeWindow: function (jqWindow){
            this.each(function(){
                var $this = $(this);
                jqWindow.each(function(){
                    var Window = $(this);
                    var data = Window.data('jqDesktopWindow');
                    var windowSettings = data.settings;
                    $.extend(true,Window.data('jqDesktopWindow'), {status:{minimized:false}});
                    var position = data.status.positionMinimize;
                    if (windowSettings.animated){
                        Window.jqLayout('disable');
                        Window.show();
                        Window.animate(position,{
                                duration:windowSettings.animationSpeed,
                                step:function(){
                                    Window.jqLayout('borderLayout');
                                },
                                complete:function(){
                                    Window.show();
                                    Window.jqLayout('enable');
                                }
                            });                        
                    } else {
                        Window.css(position);
                        Window.show();
                    }
                    $this.jqTaskBar('activateWindow', Window);
                });
            });
        },
        maximizeWindow: function(jqWindow){
            this.each(function(){                        
                jqWindow.each(function(){
                    var Window = $(this);
                    var data = Window.data('jqDesktopWindow');
                    var desktop = data.desktop;
                    var container = desktop.data('jqDesktopDesktop').content;
                    $.extend(true,Window.data('jqDesktopWindow'), {status:{positionMaximize:{
                        top:Window.position().top,
                        left:Window.position().left,
                        width:Window.width(),
                        height:Window.height()
                    }, maximized:true}});
                    var position = {
                        top:0,
                        left:0,
                        width:container.innerWidth()-1,
                        height:container.innerHeight()-1
                    };
                    if (data.settings.animated){
                        Window.jqLayout('disable');
                        Window.animate(position,{
                                duration:data.settings.animationSpeed,
                                step:function(){
                                    Window.jqLayout('borderLayout');
                                },
                                complete:function(){                            
                                    Window.jqLayout('enable');
                                    Window.draggable('destroy');
                                    Window.resizable('destroy');
                                }
                            }
                        );
                    } else {
                        Window.css(position).trigger('resize');
                    }                    
                });
            });            
        },
        restoreWindow: function(jqWindow){
            this.each(function(){
                var $this = $(this);                
                jqWindow.each(function(){
                    var Window = $(this);
                    var data = Window.data('jqDesktopWindow');
                    var windowSettings = data.settings;
                    $.extend(true,Window.data('jqDesktopWindow'), {status:{maximized:false}});
                    var position = data.status.positionMaximize;
                    if (windowSettings.animated){
                        Window.jqLayout('disable');
                        Window.show();
                        Window.animate(position,{
                                duration:windowSettings.animationSpeed,
                                step:function(){
                                    Window.jqLayout('borderLayout');
                                },
                                complete:function(){
                                    Window.show();
                                    Window.jqLayout('enable');
                                    Window.jqWindow('_repaint');
                                }
                            });                        
                    } else {
                        Window.css(position).trigger('resize');                        
                    }
                    $this.jqTaskBar('activateWindow', Window);
                });
            });
        },
        closeWindow: function(jqWindow){
            this.each(function(){
                var $this = $(this);                
                jqWindow.each(function(){
                    var Window = $(this);
                    var data = Window.data('jqDesktopWindow');
                    var settings = data.settings;
                    var closeOperation = $.jqWindow[settings.defaultCloseOperation] || 2;
                    Window.trigger('windowclosing');
                    if (closeOperation==$.jqWindow.DO_NOTHING_ON_CLOSE) return;                    
                    if (closeOperation==$.jqWindow.HIDE_ON_CLOSE) Window.jqWindow('hide');
                    if (closeOperation==$.jqWindow.DISPOSE_ON_CLOSE) Window.jqWindow('dispose');
                });
            });
        },
        hideWindow: function(jqWindow){            
            this.each(function(){
                var $this = $(this);                
                jqWindow.each(function(){
                    $('#jqtaskbar-'+$(this).attr('id')).hide();
                });
            });
        },
        disposeWindow: function(jqWindow){            
            this.each(function(){             
                jqWindow.each(function(){
                    $('#jqtaskbar-'+$(this).attr('id')).remove();
                });
            });
        },
        showWindow: function(jqWindow){            
            this.each(function(){
                var $this = $(this);                
                jqWindow.each(function(){
                    $('#jqtaskbar-'+$(this).attr('id')).show();
                });
            });
        }
    };
    
    /**
     * jqTaskBar plugin entry point
     */
    $.fn.jqTaskBar = function(method){
        if (jqTaskBarMethods[method]){//call a method
            return jqTaskBarMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
             return jqTaskBarMethods.init.apply( this, arguments );
        }
    }
    
    $.jqTaskBar.settings = {
        //Dimensions:  
        iconWidth:24,
        iconHeight:24
    }
})(jQuery);