import JanuszModule from "../core/JanuszModule";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import compression from 'compression';
import express from "express";
import http from 'http';
import ExpressWS from 'express-ws';
import morgan from 'morgan';
import {janusz} from "../index";
import {reactMiddleware} from "./server/helpers/reactHelper";
import HTTPError from "./server/helpers/HTTPError";
import {router} from "./server/routes";
import configs from './server/helpers/configs'

export default class WebModule extends JanuszModule {
	static ModuleName = "Web".cyan.bold;
	
	async init() {
		const app = this.app = express();
		this.server = http.createServer(app);
		ExpressWS(app, this.server);
		
		app.use(bodyParser.urlencoded({extended: false}));
		app.use(bodyParser.json());
		app.use(cookieParser());
		app.use(compression());
		app.use('/static', express.static('web/static'));
		if(process.env.NODE_ENV === 'development') {
			app.use(morgan('dev'));
			app.use(require('./server/helpers/webpackHelper').mount());
			WebModule.log(`Webpack Hot Middleware has been ${"enabled".cyan.bold}!`);
		} else {
			app.use('/client.js', express.static('client.js'));
			app.use('/style.css', express.static('style.css'));
		}
		
		app.use(reactMiddleware);
		
		for(let mod of janusz.modules) {
			if(mod.getRouter) {
				app.use("/" + mod.constructor.ModuleName.strip.toLowerCase(), mod.getRouter());
			}
		}
		
		app.use('/', router);
		
		app.use((req, res, next) => {
			next(new HTTPError(404));
		});

		// noinspection JSUnusedLocalSymbols
		app.use((err, req, res, next) => {
			console.error(err);
			
			const code = err.HTTPcode || 500;
			const result = {};
			result.error = {
				code: code,
				message: err.publicMessage || http.STATUS_CODES[code],
				stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
			};
			res.status(code).react(result);
		});
	}
	
	async start() {
		let port = configs.port || 3000;
		if(process.env.DOCKERIZED) port = 80;
		
		this.server.listen(port);
		WebModule.log(`Listening on port ${port.toString().cyan.bold}`);
	}
}
