"use strict";

var config          = require('./config');
var fs              = require('fs');
var URL             = require('url');
var request         = require('request');
var cheerio         = require('cheerio');
var FileCookieStore = require('tough-cookie-filestore');


var cookieJar = request.jar(new FileCookieStore(config.filename.cookies));
request = request.defaults({jar: cookieJar});


(function(targetUrl){
	request(targetUrl.href, function(error, response, html){
		if(error){
			console.log("There was an error in the request.");
			throw error;
		} else {
			var $ = cheerio.load(html);
			console.log($("form").attr("action"));
			console.log($("form").serializeArray());

			console.log(JSON.stringify(cookieJar));
		}
	});
}(URL.parse(config.url.login)));