﻿// ------------------------------------------------------------------------------------------------------------------------
//
//  ██████       ██    ██
//    ██         ██    ██
//    ██   █████ █████ ██ █████
//    ██      ██ ██ ██ ██ ██ ██
//    ██   █████ ██ ██ ██ █████
//    ██   ██ ██ ██ ██ ██ ██
//    ██   █████ █████ ██ █████
//
// ------------------------------------------------------------------------------------------------------------------------
// Table - Outputs 2D Array/Object arrays to easily-readable ASCII tables

	// ---------------------------------------------------------------------------------------------------------------
	// Constructor

		/**
		 * Table constructor
		 * @param	{Array}		rows			An input Array of objects
		 * @param	{Array}		keys			An optional array of columns to extract from the data
		 * @param	{String}	keys			An optional anything-delimted string to extract from the data
		 * @param	{Number}	keys			An optional Table ORDER Constant to order the columns
		 * @param	{Number}	maxColWidth		Max Column Height (returns)
		 * @param	{Number}	maxRowHeight	Max Row Width (chars)
		 */
		function Table(rows, keys, maxColWidth, maxRowHeight)
		{
			//TODO Add option to automatically skip functions, including constructors
			//TODO Add a setHeading() method to add a tabel eading row
			//TODO Update constructor to allow setting of heading

			if(rows instanceof Array)
			{
				// variables
					this.rows			= rows;
					this.cols			= [];
					this.colWidths		= [];
					this.rowHeights		= [];

				// widths and heights
					this.mW				= maxColWidth || this.mW;
					this.mH				= maxRowHeight || this.mH;

				// filter column data
					this.setKeys(keys);

				// set max widths
					for(var y = 0; y < this.rows.length; y++)
					{
						for(var x = 0; x < this.keys.length; x++)
						{
							// filter cell data for newlines
								var value = String(this.rows[y][this.keys[x]]);
								if(/[\r\n]/.test(value))
								{
									this.rows[y][this.keys[x]] = value.split(/[\r\n]/).shift() + '...';
								}

							// set widths
								this.setMax(y, x, this.rows[y][this.keys[x]]);
						}
					}

				// add headings
					this.setHeading();
			}
			else
			{
				throw new Error('Table constructor requires that the first argument be an Array, with at least one element');
			}
		}

	// ---------------------------------------------------------------------------------------------------------------
	// static properties

		/**
		 * Static table method to print a table
		 * @param	{Array}		rows			An input Array of objects
		 * @param	{Array}		keys			An optional array of columns to extract from the data
		 * @param	{String}	keys			An optional anything-delimted string to extract from the data
		 * @param	{Number}	keys			An optional Table ORDER Constant to order the columns
		 * @param	{Number}	maxColWidth		Max Column Height (returns)
		 */
		Table.print = function(rows, keys, maxColWidth)
		{
			new Table(rows, keys, maxColWidth).render(true);
		}

		/// Sort table columns in the order they are first found
		Table.ORDER_FOUND	= 0;

		/// Sort table columns in alphabetical order
		Table.ORDER_ALPHA	= 1;

		/// Sort table columns by the most popular keys first
		Table.ORDER_COLUMN	= 2;

		/// Sort table columns by the most popular rows first
		Table.ORDER_ROW	= 3;

		/// Sort table columns by the first row's keys only (this will hide data for some objects!)
		Table.ORDER_FIRST	= 4;


	// ---------------------------------------------------------------------------------------------------------------
	// prototype

		Table.toString = function()
		{
			return '[class Table]';
		}

		Table.prototype =
		{
			// ---------------------------------------------------------------------------------------------------------------
			// variables

				/**
				 * reset constructor
				 */
				constructor:Table,

				/**
				 * @var array The array for processing
				 */
				rows:		null,

				/**
				 * @type	{Array}	An array of column {key, width, align} objects
				 */
				cols:		[
								{key:'', width:0, align:0}
							],

				/**
				 * @var int The Column index of keys
				 */
				keys:		[],

				/**
				 * @var int The column width settings
				 */
				colWidths:	[],

				/**
				 * @var int the column width settings
				 */
				colAligns:	[],

				/**
				 * @var int the row lines settings
				 */
				rowHeights:		[],

				/**
				 * @var int max row height (returns)
				 */
				mH:		2,

				/**
				 * @var int max column width (chars)
				 */
				mW:		100,

				head:	null,

				output:	'',

				chars:
				{
					cen:	"+",
					row:	"-",
					col:	"|"
				},


			// ---------------------------------------------------------------------------------------------------------------
			// public methods

				/**
				 * Renders the data in the class as an ASCII table
				 * @param	{Boolean}	output		An optional flag to print the table table to the Output panel, defaults to true
				 * @return 	{String}				The String output of the table
				 */
				render:function(output)
				{
					// header
						this.addLine();
						this.addHeading();

					// rows
						for(var y = 0; y < this.rows.length; y++)
						{
							this.addRow(y);
						}

					// footer
						this.addLine(false);

					// print
						if(output !== false)
						{
							trace(this.output);
						}

					// return
						return this.output;
				},

				toString:function()
				{
					return '[object Table rows="' +(this.rows ? this.rows.length : 0)+ '"]';
				},

			// ---------------------------------------------------------------------------------------------------------------
			// set methods

				/**
				 * Filter the displayed row data by key (column)
				 * @param	{Array}		keys	An array of column names
				 * @param	{Number}	keys	A Table ORDER constant
				 */
				setKeys:function(keys)
				{
					// default
						keys = keys || Table.ORDER_ROW;

					// string - split into keys
						if(typeof keys == 'string')
						{
							keys = xjsfl.utils.trim(keys.replace(/\s*[^\w ]+\s*/g, ',')).split(/,/g);
						}

					// Sort keys according to a Table.ORDER Constant
						else if(typeof keys == 'number')
						{
							// variables
								var temp	= [];
								var hash	= {};

							// found-order or alphapetical-order
								if(keys === Table.ORDER_FOUND || keys === Table.ORDER_ALPHA)
								{
									// found-order
										for(var y = 0; y < this.rows.length; y++)
										{
											temp = temp.concat(xjsfl.utils.getKeys(this.rows[y]));
										}
										temp = xjsfl.utils.toUniqueArray(temp);

									// alphapetical-order
										if(keys === Table.ORDER_ALPHA)
										{
											temp = temp.sort();
										}

									// assign
										keys = temp;
								}

							// count-order
								else if(keys === Table.ORDER_COLUMN)
								{
									// grab all keys individually
										for(var y = 0; y < this.rows.length; y++)
										{
											var props = xjsfl.utils.getKeys(this.rows[y]);
											for each(var prop in props)
											{
												if( ! hash[prop])
												{
													hash[prop] = 0;
												}
												hash[prop] ++;
											}
										}

									// add key values to an array
										keys = this.getSortedKeys(hash);
								}

							// group-order
								else if(keys === Table.ORDER_ROW)
								{
									// grab keys per entire row
										for(var y = 0; y < this.rows.length; y++)
										{
											var props = xjsfl.utils.getKeys(this.rows[y]).join(',');
											if( ! hash[props])
											{
												hash[props] = 0;
											}
											hash[props] ++;
										}

									// add key values to an array
										keys = this.getSortedKeys(hash);
								}
							// otherwise, just grab the keys from the first row
								else
								{
									this.keys = xjsfl.utils.getKeys(this.rows[0]);
								}
						}

					// if keys are an array, set the keys property
						if(xjsfl.utils.isArray(keys))
						{
							this.keys = keys;
						}

				},

				/**
				 * Set the maximum width (number of characters) per column before truncating
				 * @param int maxWidth
				 */
				setMaxWidth:function(maxWidth)
				{
					this.mW = Math.floor(maxWidth);
				},

				/**
				 * Set the maximum height (number of lines) per row before truncating
				 * @param {Number}	maxHeight	The maximum number of lines a row show be
				 */
				setMaxHeight:function(maxHeight)
				{
					this.mH = Math.floor(maxHeight);
				},

				setMax:function(y, x, value)
				{
					// variables
						var w	= String(value).length;
						var h	= 1;

					// constrain width and height to limits
						if(w > this.mW)
						{
							w	= this.mW;
							h	= Math.ceil(w % this.mW);
							if(h > this.mH)
							{
								h = this.mH;
							}
						}

					// update col widths
						if(this.colWidths[x] == undefined || this.colWidths[x] < w)
						{
							this.colWidths[x] = w;
						}

					// update row heights
						if(y > -1 && (this.rowHeights[y] == undefined || this.rowHeights[y] < h))
						{
							this.rowHeights[y] = h;
						}
				},

				setHeading:function()
				{
					// data
						var data = [];

					// loop through columns
						for(var x = 0; x < this.keys.length; x++)
						{
							var value	= this.keys[x];
							data[x]		= value;
							this.setMax(-1, x, value);
						}

					// check data was provided
						if(xjsfl.utils.isArray(data))
						{
							this.head = data;
						}
				},

			// ---------------------------------------------------------------------------------------------------------------
			// output methods

				/**
				 * Adds a data row to the table output
				 */
				addRow:function(y)
				{
					// loop through each line of the row
						for(var line = 1; line <= this.rowHeights[y]; line++)
						{
							// output
								var output = this.chars.col;

							// loop through each column
								for(var x = 0; x < this.keys.length; x++)
								{
									var value	= this.rows[y][this.keys[x]];
									value		= value === undefined ? '' : value;
									var pad		= typeof value == 'number' ? true : false;
									output		+= " ";
									output		+= this.pad(String(value).substr(this.mW * (line-1), this.mW), this.colWidths[x], ' ', pad);
									output		+= " " + this.chars.col;
								}

							// add output
								this.output += output + '\n';;
						}
				},

				/**
				 * Adds the heading row to the table output
				 */
				addHeading:function()
				{
					if(xjsfl.utils.isArray(this.head))
					{
						// output
							var output = this.chars.col;

						// loop through columns
							for(var x = 0; x < this.colWidths.length; x++)
							{
								var key		= x;
								var val		= this.colWidths[x];
								var align	= typeof value == 'number';

								output += ' ' +
									this.pad(this.head[key], val, ' ', align) +
									' ' +
									this.chars.col;
							}

						// add output
							this.output += output + '\n';;

						// border
							this.addLine();
					}
				},

				/**
				 * Adds a line to the table output
				 */
				addLine:function()
				{
					// variables
						var output	= this.chars.cen;

					// loop through columns
						for(var x = 0; x < this.colWidths.length; x++)
						{
							output += this.chars.row +
								this.pad('', this.colWidths[x], this.chars.row) +
								this.chars.row +
								this.chars.cen;
						}

					// add output
						this.output += output + '\n';;
				},

			// ---------------------------------------------------------------------------------------------------------------
			// utilities

				/**
				 * Pad a string with characters to a certain length
				 * @param	{String}	str			A string to be padded
				 * @param	{Number}	length		The length the string should be padded to
				 * @param	{String}	chr			An optional pad character (defaults to ' ')
				 * @param	{Boolean}	left		An optional switch to pad to the left, rather than right
				 * @returns	{String}				The padded string
				 */
				pad:function(str, length, chr, left)
				{
					chr = chr || ' ';
					while(str.length < length)
					{
						str = left ? chr + str : str + chr;
					}
					return str;
				},

				/**
				 *
				 * @param	{Object}	hash
				 * @returns
				 */
				getSortedKeys:function(hash)
				{
					// sort function
						function byCount(a, b, c)
						{
							var v1 = a.count;
							var v2 = b.count;
							return v1 < v2 ? 1 : (v1 > v2 ? -1 : 0);
						}

					// loop through hash, and create sortable array
						var arr = [];
						for(var key in hash)
						{
							arr.push({key:key, count:hash[key]})
						}

					// sort the array
						arr.sort(byCount)

					// add hash-keys in order to a keys array
						var keys = [];
						for(var i = 0; i < arr.length; i++)
						{
							keys.push(arr[i].key);
						}

					// convert the the array to a string, then to an array, then make unique
						keys	= keys.join(',').split(',');
						keys	= xjsfl.utils.toUniqueArray(keys);

					// return
						return keys;
				}
		}

	// ---------------------------------------------------------------------------------------------------------------
	// register

		xjsfl.classes.register('Table', Table);
