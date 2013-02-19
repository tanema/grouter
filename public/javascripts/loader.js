var Loader = {
  overlay: "",
  loadBar: "",
  preloader: "",
  items: new Array(),
  doneStatus: 0,
  doneNow: 0,
  selectorPreload: "body",
  init: function () {
    if (Loader.selectorPreload == "body") {
      Loader.spawnLoader();
      Loader.getImages(Loader.selectorPreload);
      Loader.createPreloading();
      Loader.imgCallback();
    } else {
      $(document).ready(function () {
        Loader.spawnLoader();
        Loader.getImages(Loader.selectorPreload);
        Loader.createPreloading();
      });
    }
  },
  imgCallback: function () {
    Loader.doneNow++;
    Loader.animateLoader();
  },
  getImages: function (selector) {
    var everything = $(selector).find("*:not(script)").each(function () {
      var url = "";
      if ($(this).css("background-image") != "none") {
        var url = $(this).css("background-image");
      } else if (typeof($(this).attr("src")) != "undefined" && $(this).attr("tagName").toLowerCase() == "img") {
        var url = $(this).attr("src");
      }
      url = url.replace("url(\"", "");
      url = url.replace("url(", "");
      url = url.replace("\")", "");
      url = url.replace(")", "");
      if (url.length > 0) {
        Loader.items.push(url);
      }
    });
  },
  createPreloading: function () {
    Loader.preloader = $("<div></div>").appendTo(Loader.selectorPreload);
    $(Loader.preloader).css({
      height: "0px",
      width: "0px",
      overflow: "hidden"
    });
    var length = Loader.items.length;
    Loader.doneStatus = length;
    for (var i = 0; i < length; i++) {
      var imgLoad = $("<img></img>");
      $(imgLoad).attr("src", Loader.items[i]);
      $(imgLoad).unbind("load");
      $(imgLoad).bind("load", function () {
        Loader.imgCallback();
      });
      $(imgLoad).appendTo($(Loader.preloader));
    }
  },
  spawnLoader: function () {
    if (Loader.selectorPreload == "body") {
      var height = $(window).height();
      var width = $(window).width();
      var position = "fixed";
    } else {
      var height = $(Loader.selectorPreload).outerHeight();
      var width = $(Loader.selectorPreload).outerWidth();
      var position = "absolute";
    }
    var left = $(Loader.selectorPreload).offset()['left'];
    var top = $(Loader.selectorPreload).offset()['top'];
    Loader.overlay = $("<div></div>").appendTo($(Loader.selectorPreload));
    $(Loader.overlay).addClass("loaderOverlay");
    $(Loader.overlay).css({
      position: position,
      top: top,
      left: left,
      width: width + "px",
      height: height + "px"
    });
    Loader.loadBar = $("<div></div>").appendTo($(Loader.overlay));
    $(Loader.loadBar).addClass("loaderBar");
    $(Loader.loadBar).css({
      position: "relative",
      top: "50%",
      width: "0%"
    });
    Loader.loadAmt = $("<div>0%</div>").appendTo($(Loader.overlay));
    $(Loader.loadAmt).addClass("loaderAmount");
    $(Loader.loadAmt).css({
      position: "relative",
      top: "50%",
      left: "50%"
    });
  },
  animateLoader: function () {
    var perc = (100 / Loader.doneStatus) * Loader.doneNow;
    if (perc > 99) {
      $(Loader.loadAmt).html("100%");
      $(Loader.loadBar).stop().animate({
        width: perc + "%"
      }, 500, "linear", function () {
        Loader.doneLoad();
      });
    } else {
      $(Loader.loadBar).stop().animate({
        width: perc + "%"
      }, 500, "linear", function () {});
      $(Loader.loadAmt).html(Math.floor(perc) + "%");
    }
  },
  doneLoad: function () {
    clearTimeout(Loader.ieTimeout);
    if (Loader.selectorPreload == "body") {
      var height = $(window).height();
    } else {
      var height = $(Loader.selectorPreload).outerHeight();
    }
    $(Loader.loadAmt).hide();
    $(Loader.loadBar).animate({
      height: "0px"
    }, 0, "linear", function () {
      $(Loader.overlay).fadeOut(500);
      $(Loader.preloader).remove();
    });
  }
}