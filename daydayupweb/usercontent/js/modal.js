!function (f) {
    var n = function (e, g) { this.options = g; this.$element = f(e).delegate('[data-dismiss="modal"]', "click.dismiss.modal", f.proxy(this.hide, this)); this.options.remote && this.$element.find(".modal-body").load(this.options.remote) }; n.prototype = {
        constructor: n, toggle: function () { return this[this.isShown ? "hide" : "show"]() }, show: function () {
            var e = this, g = f.Event("show"); this.$element.trigger(g); !this.isShown && !g.isDefaultPrevented() && (f("body").addClass("modal-open"), this.isShown = !0, this.escape(), this.backdrop(function () {
                var g =
                    f.support.transition && e.$element.hasClass("fade"); e.$element.parent().length || e.$element.appendTo(document.body); e.$element.show(); g && e.$element[0].offsetWidth; e.$element.addClass("in").attr("aria-hidden", !1).focus(); e.enforceFocus(); g ? e.$element.one(f.support.transition.end, function () { e.$element.trigger("shown") }) : e.$element.trigger("shown")
            }))
        }, hide: function (e) {
            e && e.preventDefault(); e = f.Event("hide"); this.$element.trigger(e); this.isShown && !e.isDefaultPrevented() && (this.isShown = !1, f("body").removeClass("modal-open"),
                this.escape(), f(document).off("focusin.modal"), this.$element.removeClass("in").attr("aria-hidden", !0), f.support.transition && this.$element.hasClass("fade") ? this.hideWithTransition() : this.hideModal())
        }, enforceFocus: function () { var e = this; f(document).on("focusin.modal", function (f) { e.$element[0] !== f.target && !e.$element.has(f.target).length && e.$element.focus() }) }, escape: function () {
            var e = this; this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.modal", function (f) { 27 == f.which && e.hide() }) : this.isShown ||
                this.$element.off("keyup.dismiss.modal")
        }, hideWithTransition: function () { var e = this, g = setTimeout(function () { e.$element.off(f.support.transition.end); e.hideModal() }, 500); this.$element.one(f.support.transition.end, function () { clearTimeout(g); e.hideModal() }) }, hideModal: function (e) { this.$element.hide().trigger("hidden"); this.backdrop() }, removeBackdrop: function () { this.$backdrop.remove(); this.$backdrop = null }, backdrop: function (e) {
            var g = this.$element.hasClass("fade") ? "fade" : ""; if (this.isShown && this.options.backdrop) {
                var h =
                    f.support.transition && g; this.$backdrop = f('<div class="modal-backdrop ' + g + '" />').appendTo(document.body); "static" != this.options.backdrop && this.$backdrop.click(f.proxy(this.hide, this)); h && this.$backdrop[0].offsetWidth; this.$backdrop.addClass("in"); h ? this.$backdrop.one(f.support.transition.end, e) : e()
            } else !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), f.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(f.support.transition.end, f.proxy(this.removeBackdrop, this)) : this.removeBackdrop()) :
                e && e()
        }
    }; f.fn.modal = function (e) { return this.each(function () { var g = f(this), h = g.data("modal"), p = f.extend({}, f.fn.modal.defaults, g.data(), "object" == typeof e && e); h || g.data("modal", h = new n(this, p)); "string" == typeof e ? h[e]() : p.show && h.show() }) }; f.fn.modal.defaults = { backdrop: !0, keyboard: !0, show: !0 }; f.fn.modal.Constructor = n; f(function () {
        f("body").on("click.modal.data-api", '[data-toggle="modal"]', function (e) {
            var g = f(this), h = g.attr("href"), p = f(g.attr("data-target") || h && h.replace(/.*(?=#[^\s]+$)/, "")), h = p.data("modal") ?
                "toggle" : f.extend({ remote: !/#/.test(h) && h }, p.data(), g.data()); e.preventDefault(); p.modal(h).one("hide", function () { g.focus() })
        })
    })
}(window.jQuery);