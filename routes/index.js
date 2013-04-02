
/*
 * GET home page.
 */

exports.index = function(req, res){
  // if(req.originalUrl.substr(1) === ""){
  //   res.redirect("/" + (new Date()).getTime());
  // }else {
  //   res.render('index', { title: 'Tile Engine', map: 'map0.json'});
  // }

  res.render('index', { title: 'Tile Engine', map: 'map0.json'});
};