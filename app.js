"use strict";

var config   = require('./config');
var fs       = require('fs');
var URL      = require('url');
var request  = require('request');
var cheerio  = require('cheerio');

var Cookie           = require('cookiejar'),
	CookieAccessInfo = Cookie.CookieAccessInfo,
	CookieJar        = Cookie.CookieJar,
	Cookie           = Cookie.Cookie;


function readCookiesFromFile (cookieFile, cookieJar) {
	try {
		var cookies = JSON.parse( fs.readFileSync( cookieFile ).toString() );
		if ( !(cookieJar instanceof CookieJar) ) {
			cookieJar = CookieJar();
		}
		cookieJar.setCookies( cookies );
	} catch ( err ) {
		console.log("Error reading file: "+cookieFile);
		if ( err instanceof SyntaxError ) {
			fs.writeFile( cookieFile, "{}" );
		} else {
			console.log(err);
		}
	}

	return cookieJar;
}


function writeCookiesToFile (cookieFile, cookieJar, accessInfo) {
	try {
		var cookies = [];
		(cookieJar.getCookies( accessInfo )).forEach(function(item){
			cookies.push( item.toString() );
		});
		fs.writeFile( cookieFile, JSON.stringify( cookies ) );
	} catch ( err ) {
		console.log(err);
	}
}


function setCookieHeader (cookies, headers, url) {
	var accessInfo = CookieAccessInfo( url.hostname, url.pathname );

	if ( cookies.getCookies( accessInfo ).length > 0 ) {
		headers["Cookie"] = cookies.getCookies( accessInfo ).toValueString();
	}
}


function makeRequest (cookies, options, callback) {
	setCookieHeader(cookies, options.headers, options.url);

	request(options, function(error, response, html){
		if(!error){
			if ( typeof response.headers['set-cookie'] != "undefined" ) {
				var respCookies = response.headers['set-cookie'];
				try {
					cookies.setCookies( respCookies, options.url.hostname, options.url.pathname);
				} catch (err) {
					console.log("Error parsing cookie header");
					console.log(err);
				}
			}
		} else {
			console.log("There was an error in the request.");
			throw error;
		}
		callback(error, response, html);
	});
};


(function(cookieFile, targetUrl){
	var options = {
		url: targetUrl,
		headers: {}
	},
		cookies = readCookiesFromFile(cookieFile, {});

	makeRequest(cookies, {url:targetUrl, headers:{}}, function(err, resp, html){
		console.log("Returned from makeRequest");
		var $ = cheerio.load(html);
		console.log($("form"));
	});

	writeCookiesToFile(
		cookieFile,
		cookies,
		CookieAccessInfo( targetUrl.hostname, targetUrl.pathname )
	);
}(config.filename.cookies, URL.parse(config.url.login)));