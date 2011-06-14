// ------------------------------------------------------------------------------------------------------------------------
//
//  ██              ██         ██ ██ 
//  ██              ██         ██ ██ 
//  ██ █████ █████ █████ █████ ██ ██ 
//  ██ ██ ██ ██     ██      ██ ██ ██ 
//  ██ ██ ██ █████  ██   █████ ██ ██ 
//  ██ ██ ██    ██  ██   ██ ██ ██ ██ 
//  ██ ██ ██ █████  ████ █████ ██ ██ 
//
// ------------------------------------------------------------------------------------------------------------------------
// xJSFL Installation file

	// ----------------------------------------------------------------------------------------
	// variables
	
		// folders
			var src, trg, file;
			var win		= fl.version.indexOf('WIN') != -1;
			var xjsfl	= fl.scriptURI.replace(/core\/.+$/, '');
			var uris =
			{
				install		:fl.scriptURI.replace(/[^\/]+$/, ''),
				xjsfl		:xjsfl,
				config		:fl.configURI,
				tools		:fl.configURI + 'Tools/',
				commands	:fl.configURI + 'Commands/',
				swf			:fl.configURI + 'WindowSWF/'
			};
			
	// ----------------------------------------------------------------------------------------
	// functions
	
		function populate(obj, srcURI, trgURI)
		{
			// read file
				var text = FLfile.read(srcURI);
				
			// populate
				var rx;
				for(var i in obj)
				{
					rx		= new RegExp('{' +i+ '}', 'g')
					text	= text.replace(rx, obj[i]);
				}
				
			// save
				if(trgURI)
				{
					FLfile.write(trgURI, text);
				}
		}
		
	// ----------------------------------------------------------------------------------------
	// copy files
	
		// dll
			file			= win ? 'xjsfl.dll' : 'xjsfl.bundle';
			src				= uris.install + 'External Libraries/' + file;
			trg				= uris.config + 'External Libraries/' + file;
			FLfile.copy(src, trg);
			
		// loader
			src				= uris.install + 'Tools/xJSFL Loader.jsfl';
			trg				= uris.tools + 'xJSFL Loader.jsfl';
			populate(uris, src, trg);
			
		// Splash
			src				= uris.install + 'Tools/xJSFL Splash.txt';
			trg				= uris.tools + 'xJSFL Splash.txt';
			populate(uris, src, trg);
			
		// ini
			populate(uris, uris.install + 'Tools/xJSFL.ini', uris.tools + 'xJSFL.ini');
			
		// Snippets
			src				= uris.xjsfl + 'modules/Snippets/ui/xJSFL Snippets.swf';
			trg				= uris.swf + 'xJSFL Snippets.swf';
			FLfile.copy(src, trg);
			
		// Commands
			src				= uris.install + 'Commands/Open xJSFL user folder.jsfl';
			trg				= uris.commands + 'xJSFL/Open xJSFL user folder.jsfl';
			FLfile.copy(src, trg);
			
	// ----------------------------------------------------------------------------------------
	// splash
	
		var dom = fl.getDocumentDOM();
		if( ! dom )
		{
			dom = fl.createDocument();
		}
		dom.xmlPanel(xjsfl + 'core/ui/install.xml')