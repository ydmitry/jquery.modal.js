/**
* jquery.modal.js
* 
* Copyright (C) 2012, Yaremenko Dmitry.
* All rights reserved.
*
**/

(function($) {

    var ModalBoxManager = function()
    {
	    this.boxCollection = {};
        this.lastId = 0;
	    $(document).keyup($.proxy(this.keyPressCallback, this));
    };

    ModalBoxManager.prototype = {
	    count: function() {
		    var count = 0;
		
		    for (var i in this.boxCollection) {
			    count++;
		    }
		
		    return count;
	    },

	    create: function(options) {
		    return new ModalBox(options);
	    },

	    load: function(params) {
		    $.ajax(params.url, {
			    type: !!params.data ? 'post' : 'get',
			    data: params.data,
			    success: function(data) {
				    new ModalBox($.extend(params, {
                        content: data
                    }));
			    }
		    });
	    },

	    add: function(box) {
            box.id = this.lastId + 1;
		    this.boxCollection[box.id] = box;
		    this.lastId = box.id;
	     	$('body').addClass('body-modal-box-opened');
	    },

	    remove: function(box) {
		    delete this.boxCollection[box.id];
		    if (!this.count()) {
		     	$('body').removeClass('body-modal-box-opened');
		    }
	    },
	
	    last: function() {
		    var id = 0;
		    var lastBox;
		    $.each(this.boxCollection, function(i, box) {
			    if (box.id > id) {
				    id = box.id;
				    lastBox = box;
			    }
		    });
		    return lastBox;
	    },
	
	    closeLast: function(time) {
		    var lastBox = this.last();
		
		    if (lastBox) {
			    lastBox.close(time);
		    }
	    },
        
	    onKeyPress: function(e) {
		    var lastBox = this.last();

		    if (lastBox) {
			    var code = e.keyCode || e.which;
			    if (lastBox.keyPressCallback(e) !== false) {
				    if (code == 27) {
					    lastBox.close();
				    }
			    }
		    }
	    }
    }

    var ModalBox = function(options) {
	
	    var defaults = {
		    closeCallback : function() {},
		    boxClass: '',
		    keyPressCallback : function() {},
		    callback : function() {}
	    };

	    if (!!options) {
		    var options = $.extend(defaults, options);
	    } else {
		    var options = defaults;
	    }
	    
        var header = options.header;
	    
        this.options = options;
	
	    this.getHeader = function() {
		    return header;
	    };

        this.closeCallback = options.closeCallback;
	    this.keyPressCallback = options.keyPressCallback;
	    
        this.$overlay = $('<div class="modal-overlay"></div>').appendTo('body');
	    this.$wrapper = $('<div class="modal-box-wrapper"></div>').appendTo('body');
        this.$container = $('<div class="modal-box-container"></div>');
        this.$el = $('<div class="modal-box ' + options.boxClass + '"></div>');

        this.$container.append(this.$el);
        this.$wrapper.append(this.$container);
        

	    this.$el.append('<a href="#" class="x">&times;</a>');
	    this.$el.append('<h2>'+header+'</h2>');
	
	    this.$el.append('<div class="content"></div>');

	    this.$el.find(".content").html( this.options.content );
	
	    this.$overlay.show();
	    var box = this;
	
	    box.$el.find('.x').click( function(){box.close(300);return false;});
	    box.$overlay.unbind('click').click(function(){box.close(300);return false;});
	
	    var clickBgEvent = function(event){
		    e = event || window.event;
		    if (e.target == this) {
			    box.overlay.click();
		    }
	    };
	
	    box.$wrapper.click(clickBgEvent);
	    box.$el.parent().click(clickBgEvent);
	
	    $.modal.add(box);
	
	    $.proxy(box.options.callback, box)();
    };

    ModalBox.prototype = {
	    close: function(val) {
		    if(!val) {
			    val = 0;
		    }
		
		    var box = this;
		    this.$el.fadeOut(val, function(){$(box.$overlay).detach();});
		    this.$wrapper.detach();

		    this.closeCallback();
		
		    $.modal.remove(this);
	    }
    };
    

    $.extend($, {
        modal: new ModalBoxManager()
    });

    $.extend($.fn, {
        modal: function(options) {
            return $.modal.create($.extend(options, {
                content: $(this).html()
            }));
        }
    });
})(jQuery);
