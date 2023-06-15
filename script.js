function final_project() {
  let filePath = 'plot_1_data.csv'
  plot0(filePath)
}

let plot0 = function (filePath) {
  //preprocess data
  d3.csv(filePath).then(function (data) {
    plot1(data)
    plot2(data)
    plot3(data)
  })
}

let plot1 = function (data) {
  data = data.filter(function (d) {
    // remove incomplete season
    return d.SEASON != '2022'
  })

  // console.log(plot1_data)

  d3.json('us-states.json').then(function (map) {
    let stateSym = {
      AZ: 'Arizona',
      AL: 'Alabama',
      AK: 'Alaska',
      AR: 'Arkansas',
      CA: 'California',
      CO: 'Colorado',
      CT: 'Connecticut',
      DC: 'District of Columbia',
      DE: 'Delaware',
      FL: 'Florida',
      GA: 'Georgia',
      HI: 'Hawaii',
      ID: 'Idaho',
      IL: 'Illinois',
      IN: 'Indiana',
      IA: 'Iowa',
      KS: 'Kansas',
      KY: 'Kentucky',
      LA: 'Louisiana',
      ME: 'Maine',
      MD: 'Maryland',
      MA: 'Massachusetts',
      MI: 'Michigan',
      MN: 'Minnesota',
      MS: 'Mississippi',
      MO: 'Missouri',
      MT: 'Montana',
      NE: 'Nebraska',
      NV: 'Nevada',
      NH: 'New Hampshire',
      NJ: 'New Jersey',
      NM: 'New Mexico',
      NY: 'New York',
      NC: 'North Carolina',
      ND: 'North Dakota',
      OH: 'Ohio',
      OK: 'Oklahoma',
      OR: 'Oregon',
      PA: 'Pennsylvania',
      RI: 'Rhode Island',
      SC: 'South Carolina',
      SD: 'South Dakota',
      TN: 'Tennessee',
      TX: 'Texas',
      UT: 'Utah',
      VT: 'Vermont',
      VA: 'Virginia',
      WA: 'Washington',
      WV: 'West Virginia',
      WI: 'Wisconsin',
      WY: 'Wyoming',
    }
    nba_teams_nicknames_states = {
      Hawks: 'Georgia',
      Celtics: 'Massachusetts',
      Nets: 'New York',
      Hornets: 'North Carolina',
      Bulls: 'Illinois',
      Cavaliers: 'Ohio',
      Mavericks: 'Texas',
      Nuggets: 'Colorado',
      Pistons: 'Michigan',
      Warriors: 'California',
      Rockets: 'Texas',
      Pacers: 'Indiana',
      Clippers: 'California',
      Lakers: 'California',
      Grizzlies: 'Tennessee',
      Heat: 'Florida',
      Bucks: 'Wisconsin',
      Timberwolves: 'Minnesota',
      Pelicans: 'Louisiana',
      Knicks: 'New York',
      Thunder: 'Oklahoma',
      Magic: 'Florida',
      '76ers': 'Pennsylvania',
      Suns: 'Arizona',
      'Trail Blazers': 'Oregon',
      Kings: 'California',
      Spurs: 'Texas',
      Raptors: 'Ontario',
      Jazz: 'Utah',
      Wizards: 'District of Columbia',
    }

    let plot1_data = {}
    for (let state in stateSym) {
      plot1_data[stateSym[state]] = 0
    }
    let group_data = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.HOME_TEAM_WINS),
      (v) => v.HOME_STATE
    )
    let team_data = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.HOME_TEAM_WINS),
      (v) => v.HOME_NICKNAME
    )

    let team_data_array = Array.from(team_data, ([key, value]) => ({
      team: key,
      total_wins: value,
    }))

    team_data_array.sort((a, b) => b.total_wins - a.total_wins)

    team_data_array.forEach((item, index) => {
      item.rank = index + 1
    })

    let team_data_ranked = new Map(
      team_data_array.map((item) => [item.team, item])
    )
    console.log(1)
    console.log(team_data)
    console.log(1)
    group_data = Array.from(group_data, ([key, value]) => ({
      State: key,
      Total_wins: value,
    }))

    group_data.forEach((item) => {
      plot1_data[item.State] = item.Total_wins
    })

    let stateTeams = {}
    for (let team in nba_teams_nicknames_states) {
      let state = nba_teams_nicknames_states[team]
      let teamInfo = team_data_ranked.get(team) || { total_wins: 0, rank: '-' }
      if (!stateTeams[state]) {
        stateTeams[state] = []
      }
      stateTeams[state].push({
        team,
        wins: teamInfo.total_wins,
        rank: teamInfo.rank,
      })
    }
    // console.log(plot1_data)
    const padding = 50
    const width = 1200 - 2 * padding
    const height = 800 - 2 * padding

    const colorScale = d3
      .scaleSequential()
      .domain([0, d3.max(Object.values(plot1_data))])
      .interpolator(d3.interpolateBlues)

    let plot_1 = d3
      .select('#plot_1')
      .append('svg')
      .attr('width', width + 2 * padding)
      .attr('height', height + 2 * padding)
      .attr('class', 'svg')
      .append('g')
      .attr('transform', 'translate(' + 2 * padding + ',' + padding + ')')

    const projection1 = d3
      .geoAlbersUsa()
      .scale(900)
      .translate([width / 2, height / 2])

    const pathgeo1 = d3.geoPath().projection(projection1)
    console.log(plot1_data)
    console.log(colorScale(500))
    // Select the tooltip using d3
    const tooltip = d3
      .select('#tooltip')
      .style('background', 'white') // Setting the background to white
      .style('padding', '5px') // Adding some padding
      .style('border', '1px solid black')

    // Inside your plot1 function, where you're creating the paths for your states:
    plot_1
      .selectAll('path')
      .data(map.features)
      .enter()
      .append('path')
      .attr('d', pathgeo1)
      .attr('fill', (d) => {
        return colorScale(plot1_data[stateSym[d.properties.name]])
      })
      .attr('stroke', 'black')
      .on('mouseover', function (event, d) {
        let teams = stateTeams[stateSym[d.properties.name]]
        let teamsString = teams
          ? teams
              .map((t) => `${t.team}: ${t.wins}, Rank: ${t.rank}`)
              .join('<br>')
          : 'No teams'

        tooltip
          .style('visibility', 'visible')
          .html(
            `${stateSym[d.properties.name]}: ${
              plot1_data[stateSym[d.properties.name]]
            } <br> ${teamsString}`
          )
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px')
      })
      .on('mouseout', function () {
        // Add a mouseout event
        // Hide the tooltip
        tooltip.style('visibility', 'hidden')
      })

    plot_1
      .append('text')
      .attr('class', 'plot-title')
      .attr('x', width / 2)
      .attr('y', padding / 2 - padding)
      .attr('text-anchor', 'middle')
      .text('Geo graph for the total NBA games wins in each state')
      .attr('font-size', '25')

    const legendData = [
      0,
      d3.max(Object.values(plot1_data)) / 4,
      d3.max(Object.values(plot1_data)) / 2,
      (3 * d3.max(Object.values(plot1_data))) / 4,
      d3.max(Object.values(plot1_data)),
    ]

    // Append a new group for the legend
    const legend = plot_1
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - padding}, 0)`)
    legend
      .append('text')
      .attr('x', -70) // Change these values according to your requirements
      .attr('y', -10) // Change these values according to your requirements
      .text('Total Wins')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
    // Add one 'rect' element for each data point in the legendData array
    legend
      .selectAll('rect')
      .data(legendData)
      .enter()
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('x', -70)
      .attr('y', (d, i) => i * 25) // Space the rectangles out
      .attr('fill', (d) => colorScale(d))

    legendData.sort((a, b) => a - b)

    const labels = legendData.map((value, i, array) => {
      if (i < array.length - 1) {
        return `${Math.round(value)} - ${Math.round(array[i + 1])}`
      } else {
        return `${Math.round(value)}+`
      }
    })

    // Add one 'text' element for each data point to serve as labels
    legend
      .selectAll('text.label')
      .data(labels) // Use the labels array here
      .enter()
      .append('text')
      .attr('class', 'label') // Add class to differentiate from title
      .attr('x', -30) // Offset the text to the right of the rectangles
      .attr('y', (d, i) => i * 25)
      .attr('dy', '1em') // Center text vertically
      .text((d) => d) // Use the label text
  })
}

let plot2 = function (data) {
  let data_two
  d3.json('data.json').then(function (data) {
    data_two = data
    // console.log(data_two)
    const padding = 50
    const width = 1200 - 2 * padding
    const height = 900 - 2 * padding

    let svg_2 = d3
      .select('#plot_2')
      .append('svg')
      .attr('width', width + 2 * padding)
      .attr('height', height + 2 * padding)
      .attr('class', 'svg')
      .append('g')
      .attr('transform', 'translate(' + 2 * padding + ',' + padding + ')')

    const nodes = data.nodes
    const links = data.links

    let node = svg_2
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 15)
      .attr('fill', 'blue')

    let link = svg_2
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'links')
      .style('stroke', (d) => (d.status === 'winning' ? 'orange' : 'gray'))
      .style('stroke-width', 6)
      .attr('marker-end', 'url(#end)')
    let labelBackground = svg_2
      .append('g')
      .attr('class', 'label-backgrounds')
      .selectAll('rect')
      .data(nodes)
      .enter()
      .append('rect')
      .attr('fill', 'lightblue')
      .attr('opacity', 0.4)

    let label = svg_2
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.name)

    d3.select('#winning-button').on('click', function () {
      // Hide losing links and show winning links
      link.style('visibility', (d) =>
        d.status === 'winning' ? 'visible' : 'hidden'
      )
    })

    d3.select('#losing-button').on('click', function () {
      // Hide winning links and show losing links
      link.style('visibility', (d) =>
        d.status === 'losing' ? 'visible' : 'hidden'
      )
    })
    d3.select('#reset-button').on('click', function () {
      // Show all links
      link.style('visibility', 'visible')
    })

    svg_2
      .append('defs')
      .selectAll('marker')
      .data(['end']) // Different link/path types can be defined here
      .enter()
      .append('marker') // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20) // This will dictate how far the arrow is from the node
      .attr('refY', 0)
      .attr('markerWidth', 2.5)
      .attr('markerHeight', 2.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .style('fill', 'green')

    //create force graph
    const force = d3
      .forceSimulation(data.nodes)
      .force('charge', d3.forceManyBody().strength(-725))
      .force(
        'link',
        d3.forceLink(data.links).id((d) => d.id)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))

    force.on('tick', function () {
      link
        .attr('x1', function (d) {
          return d.source.x
        })
        .attr('y1', function (d) {
          return d.source.y
        })
        .attr('x2', function (d) {
          return d.target.x
        })
        .attr('y2', function (d) {
          return d.target.y
        })

      node
        .attr('cx', function (d) {
          return d.x
        })
        .attr('cy', function (d) {
          return d.y
        })

      label
        .attr('x', function (d) {
          return d.x + 20
        })
        .attr('y', function (d) {
          return d.y + 20
        })
        .style('font-size', '18px')
      labelBackground
        .attr('x', (d) => d.x + 20)
        .attr('y', (d) => d.y + 6) // adjust based on text size
        .attr('width', (d) => d.name.length * 9) // assuming approx 6 pixels per character
        .attr('height', 20) // adjust based on text size
    })
    let legend = svg_2
      .append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 20)
      .attr('text-anchor', 'end')
      .selectAll('g')
      .data(['Winning', 'Losing'])
      .enter()
      .append('g')
      .attr('transform', (d, i) => 'translate(0,' + i * 40 + ')')

    legend
      .append('rect')
      .attr('x', width - 24)
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', (d) => (d === 'Winning' ? 'Orange' : 'Gray'))
      .attr('transform', 'translate(0, 8)')

    legend
      .append('text')
      .attr('x', width - 30)
      .attr('y', 6.5)
      .attr('dy', '1em')
      .text((d) => d)
  })
}

let plot3 = function (data) {
  let data_three = data.filter(function (d) {
    // remove incomplete season
    return d.SEASON != '2022'
  })
  // Filter data for the selected teams only
  let extremeTeams = ['Knicks', 'Spurs']
  let data_home = data_three.filter((d) =>
    extremeTeams.includes(d.HOME_NICKNAME)
  )
  let data_away = data_three.filter((d) =>
    extremeTeams.includes(d.VISITOR_NICKNAME)
  )

  // Compute number of wins per year for each team
  let homeWinsPerYear = d3.rollup(
    data_home,
    (v) => d3.sum(v, (d) => d.HOME_TEAM_WINS),
    (d) => d.SEASON,
    (d) => d.HOME_NICKNAME
  )

  let awayWinsPerYear = d3.rollup(
    data_away,
    (v) => d3.sum(v, (d) => 1 - d.HOME_TEAM_WINS),
    (d) => d.SEASON,
    (d) => d.VISITOR_NICKNAME
  )
  // Convert Maps to Objects for easier manipulation
  let homeWinsObj = Array.from(homeWinsPerYear, ([year, teamsMap]) => ({
    year,
    ...Object.fromEntries(teamsMap),
  }))
  let awayWinsObj = Array.from(awayWinsPerYear, ([year, teamsMap]) => ({
    year,
    ...Object.fromEntries(teamsMap),
  }))

  // console.log(homeWinsObj) // check the intermediate result
  // console.log(awayWinsObj) // check the intermediate result

  // Initialize combinedWins as a deep copy of homeWinsObj
  let combinedWins = JSON.parse(JSON.stringify(homeWinsObj))

  // Iterate over each season in awayWinsObj
  for (let seasonObj of awayWinsObj) {
    let season = seasonObj.year
    let matchingSeasonObj = combinedWins.find((obj) => obj.year === season)

    if (!matchingSeasonObj) {
      // If the season is not in combinedWins, simply assign the whole object
      combinedWins.push(seasonObj)
    } else {
      // If the season is already in combinedWins, add each team's wins separately
      for (let team in seasonObj) {
        if (team === 'year') continue // skip the 'year' property
        if (!(team in matchingSeasonObj)) {
          matchingSeasonObj[team] = seasonObj[team]
        } else {
          matchingSeasonObj[team] += seasonObj[team]
        }
      }
    }
  }

  console.log(combinedWins) // check the final result

  let dataArray = combinedWins

  console.log(dataArray)
  // Define margins, width and height
  let margin = { top: 50, right: 50, bottom: 50, left: 50 }
  const width = 1200 - 2 * margin.left
  const height = 800 - 2 * margin.top

  // Define scales
  let x = d3.scaleBand().rangeRound([0, width]).padding(0.5)
  let y = d3.scaleLinear().range([height, 0])

  // Define axes
  let xAxis = d3.axisBottom(x)
  let yAxis = d3.axisLeft(y)

  // Create SVG
  let svg = d3
    .select('#plot_3')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  dataArray.sort((a, b) => d3.ascending(a.year, b.year))
  const tooltip3 = d3
    .select('#tooltip3')
    .style('background', 'white') // Setting the background to white
    .style('padding', '5px') // Adding some padding
    .style('border', '1px solid black')
  // Set the domain of the scales
  x.domain(dataArray.map((d) => d.year))
  y.domain([0, d3.max(dataArray, (d) => Math.max(d.Spurs, d.Knicks))])

  // Add the bars
  // Add the bars and their labels
  dataArray.forEach((d) => {
    svg
      .append('rect')
      .attr('x', x(d.year))
      .attr('y', y(d.Spurs))
      .attr('width', x.bandwidth() / 2)
      .attr('height', height - y(d.Spurs))
      .attr('fill', 'steelblue')
      .on('mouseover', function (event) {
        let difference = d.Spurs - d.Knicks
        tooltip3
          .style('visibility', 'visible')
          .html(`Difference between Spurs and Knicks: ${difference}`)
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px')
      })
      .on('mouseout', function () {
        tooltip3.style('visibility', 'hidden')
      })

    svg
      .append('text')
      .attr('x', x(d.year) + x.bandwidth() / 4) // Positioned at the middle of the bar
      .attr('y', y(d.Spurs) - 10) // Positioned slightly above the bar
      .attr('text-anchor', 'middle') // Centered horizontally
      .text(d.Spurs)

    svg
      .append('rect')
      .attr('x', x(d.year) + x.bandwidth() / 2)
      .attr('y', y(d.Knicks))
      .attr('width', x.bandwidth() / 2)
      .attr('height', height - y(d.Knicks))
      .attr('fill', 'orange')
      .on('mouseover', function (event) {
        let difference = d.Knicks - d.Spurs
        tooltip3
          .style('visibility', 'visible')
          .html(`Difference between Knicks and Spurs: ${difference}`)
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px')
      })
      .on('mouseout', function () {
        tooltip3.style('visibility', 'hidden')
      })

    svg
      .append('text')
      .attr('x', x(d.year) + (3 * x.bandwidth()) / 4) // Positioned at the middle of the bar
      .attr('y', y(d.Knicks) - 10) // Positioned slightly above the bar
      .attr('text-anchor', 'middle') // Centered horizontally
      .text(d.Knicks)
  })

  // Add the axes
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  svg.append('g').call(yAxis)

  svg
    .append('text')
    .attr('class', 'plot-title')
    .attr('x', width / 2)
    .attr('y', margin.top / 2 - margin.top)
    .attr('text-anchor', 'middle')
    .text('Bar chart for the best and worst teams in NBA (2003-2021)')
    .attr('font-size', '25')

  // Add the legend
  let legend = svg
    .append('g')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 20)
    .attr('text-anchor', 'end')
    .selectAll('g')
    .data(['Spurs', 'Knicks'])
    .enter()
    .append('g')
    .attr('transform', (d, i) => 'translate(0,' + i * 40 + ')')

  legend
    .append('rect')
    .attr('x', width)
    .attr('width', 24)
    .attr('height', 24)
    .attr('fill', (d) => (d === 'Spurs' ? 'steelblue' : 'orange'))
    .attr('transform', 'translate(0, 8)')

  legend
    .append('text')
    .attr('x', width - 10)
    .attr('y', 6.5)
    .attr('dy', '1em')
    .text((d) => d)
  // Add x-axis label
  svg
    .append('text')
    .attr('transform', 'translate(' + width / 2 + ' ,' + (height + 35) + ')') // Adjust the position according to your need
    .style('text-anchor', 'middle')
    .text('Years')

  // Add y-axis label
  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left)
    .attr('x', 0 - height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Total Wins')
}
