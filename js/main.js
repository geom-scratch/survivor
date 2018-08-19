h = 700; 

app = function(err, seasonsCSV, episodesCSV, playersCSV) {

	episodes = episodesCSV;

	seasons = seasonsCSV;

	seasons.forEach(function(d){ return d.Season = +d.Season; });

	seasonMap = d3.map(seasons, function(d) { return d.Season; });

	epNest = d3.nest()
			.key(function(d){ return +d['Season']; })
			.entries(episodes);

	canvas = d3.select('body')
		.append('svg')
		.attr('width', 1100)
		.attr('height', h + 50);

	x = d3.scaleLinear()
		.domain([1,17])
		.range([200,1000]);

	y = d3.scaleLinear()
		.domain([4.5, d3.max(episodes, function(d){ return +d['US viewers']})])
		.range([h,50]);

	opacity = d3.scaleLinear()
		.domain([1,36])
		.range([.1,.5])

	color = d3.scaleOrdinal()
		.domain([1,2,3])
		.range(['blue','red','orange','black']);

	line = d3.line()
		.defined(function(d) { return +d['US viewers'] > 0; })
		.x(function(d){ return x(+d['Episode in Season']); })
		.y(function(d){ return y(+d['US viewers']); });

	lines = canvas.selectAll('path')
		.data(epNest)
		.enter()
		.append('path')
		.attr('fill', 'none')
		// .attr('stroke', function(d){ return 'black'; })
		.attr('stroke', function(d){ return +d.key == 1 ? 'red' : 'black'; })
		.attr('stroke-opacity', function(d) { return +d.key == 1 ? 1 : 0; })
		// .attr('stroke-opacity', function(d){ return opacity(+d.key); })
		.attr('stroke-width', 2)
		.attr('stroke-linejoin', 'round')
		.attr('stroke-linecap', 'round')
		.attr('d', function(d){ 
			x.domain([1, d.values.length]);
			return line(d.values) 
		})
		.on('mouseover', function(d) {
			d3.select(this)
				.attr('stroke', 'red')
				.attr('stroke-opacity', '1');

			seasonName
				.attr('y', y(+d.values[0]['US viewers']))
				.text('season ' + d.key);
		})
		.on('mouseout', function(d) {
			d3.select(this)
				.attr('stroke', 'black')
				.attr('stroke-opacity', function(d){ return opacity(+d.key); })
		});	

	canvas.append('text.title')	
		.text('How many people watched each episode of Survivor?')
		.attr('x',200)
		.attr('y',25);

	xAxis = canvas.append('g.xAxis')
		.translate([200,h + 30])

	xAxis.append('text.axisLabel')
		.text('episodes')
		.attr('x',400)
		.attr('text-anchor','middle');

	xAxis.append('text.mini')
		.attr('dy', -3)
		.text('premiere');

	xAxis.append('text.mini')
		.text('finale')
		.attr('x',800)
		.attr('dy', -3)
		.attr('text-anchor','end');

	xAxis.append('line')
		.attr('x1',0)
		.attr('x2',800)
		.attr('y1',-20)
		.attr('y2',-20)
		.attr('stroke', 'black')
		.attr('stroke-width', 1)

	seasonName = canvas.append('text.seasonName')
		.text('season 1 Borneo')
		.attr('fill', 'red')
		.attr('x', 195)
		.attr('text-anchor', 'end')
		.attr('alignment-baseline', 'middle')
		.attr('font-size', '12px')
		.attr('y', y(+epNest[0].values[0]['US viewers']))

	yAxis = d3.axisRight(y)
		.tickValues([10,20,30,40,50])
		.tickFormat(function(d){ return d == 50 ? d + ' million' : d; })

	canvas.append('g.yAxis')
		.translate([1010, 0])
		.call(yAxis);

	d3.select(".domain").remove(); // remove axis line

	currSeason = 0;

	reveal = setInterval(function(){
		currSeason++;

		if (currSeason == 37) { clearInterval(reveal) } 
			else {
		
				lines
					.attr('stroke-width', function(d){ return +d.key == currSeason ? 2 : 1; })
					.attr('stroke', function(d){ return +d.key == currSeason ? 'red' : 'black'; })
					.attr('stroke-opacity', function(d) { 
						if (+d.key == currSeason) return 1;
						if (+d.key < currSeason) return opacity(+d.key);
						return 0;
					});

				seasonName
					.attr('y', y(+epNest[currSeason - 1].values[0]['US viewers']))
					.text('season ' + currSeason + ' ' + seasonMap.get(currSeason).Title);
				
			}

	}, 1500);

}

d3.queue()
	.defer(d3.csv,'data/seasons.csv')
	.defer(d3.csv,'data/episodes.csv')
	.defer(d3.csv,'data/players.csv')
	.await(app);