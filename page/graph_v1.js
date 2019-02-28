
// set variables

var nodes_svg1 = {};
var nodes_svg2 = {};
var nodes_all_svg2 = {};
var nodes_draw_svg2 = {};
var nodes_backup = {};
var book_nodes_backup = {};
var links_user = [];
var links_books = [];
var timedEvent;
var width_svg1_ratio = 0.7;
var height_svg1_ratio = 0.15;
var width_gap_ratio = 0.01;
var height_gap_ratio = 0.05;
var width_svg2_ratio = width_svg1_ratio;
var height_svg2_ratio = 1 - height_svg1_ratio - height_gap_ratio;
var root = 'baishizhiqing';


// load data from files
d3.queue()
.defer(d3.json, "links.json")
.defer(d3.json, "links_books.json")
.defer(d3.json, "users.json")
.defer(d3.json, "books_info.json")
.defer(d3.json, "friends_weight.json")
.defer(d3.json, "book_basket.json")
.await(function(error, data, data_books, users, books_info, friends_weight, book_basket){
    
    var promise1 = new Promise(function(resolve, reject){
        links_user = data;
        root = data[0].source;

        // Compute the distinct nodes from the links.
        links_user.forEach(function(link) {
            link.source = nodes_backup[link.source] ||
                (nodes_backup[link.source] = {name: link.source});
            link.target = nodes_backup[link.target] ||
                (nodes_backup[link.target] = {name: link.target});
            link.value = 10;
        });
        
        // links_books is the second data, including all links between a reader and a book
        links_books = data_books;
        // Compute the distince nodes from the books_links
        links_books.forEach(function(link) {
            link.source = book_nodes_backup[link.source] ||
                (book_nodes_backup[link.source] = {name: link.source});
            link.target = book_nodes_backup[link.target] ||
                (book_nodes_backup[link.target] = {name: link.target});
            link.value = 10;
        });
        console.log(links_user[0]);
        console.log(links_books[0]);
        links_all = links_user.concat(links_books);
      
        for (var property in nodes_backup) {
            // backup up nodes
            if (nodes_backup.hasOwnProperty(property)) {
                if (property != root) {
                    nodes_svg1[property] = nodes_backup[property];
                }
                else {
                    nodes_svg2[property] = nodes_backup[property];
                }
                
            }
        }
        resolve("done");
    });
    
    promise1.then(
        function(resolve) {
            resizeWindow();
        }
    );
    
    
    
    window.addEventListener("resize", function() {
        clearTimeout(timedEvent);
        
        timedEvent = setTimeout(resizeWindow, 1);
        
    });
    
    
    // the function to resize the svg everytime
    function resizeWindow() {
        console.log("\n\n\n\n\n\n");
        // Settings of the canvas
        var width = $(window).width();
            height = $(window).height();
            color = d3.scale.category20c();
        
        
        
        
        
        // Settings of svg 1
        
        // size of svg 1
        var width_svg1 = width * width_svg1_ratio;
        var height_svg1 = height * height_svg1_ratio;
        
        var svgdiv1 = d3.select("#svgdiv1");
        
        d3.select("#svg1").remove();
        
        var svg1 = svgdiv1.append("svg")
            .attr("width", width_svg1)
            .attr("height", height_svg1)
            .attr("id", "svg1");
        
        // calculate the positions of the nodes
        var pos_nodes_svg1 = [];
        // the number of nodes shown is 6
        var nodes_shown = 6;
        for (var i = 0; i < nodes_shown; i ++) {
            pos_nodes_svg1.push({ 
                x: width_svg1 / (nodes_shown + 1) * (i + 1),
                y: height_svg1 / 2});
        }
        
        var name_items = Object.keys(nodes_svg1).map(function(key) {
            //console.log(key + "  " + friends_weight[key]);
            return [key, friends_weight[key]]; 
        });
        //console.log(name_items);
        
        
        name_items.sort(function(cfirst, csecond) {
            return csecond[1] - cfirst[1];
        });
        var name_items_shown = name_items.slice(0, nodes_shown);
        
        // define the nodes
        var node1 = svg1.selectAll(".node1")
            .data(pos_nodes_svg1)
            .enter()
            .append("g")
            .attr("class", "node1")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; })
            .attr("id", function(d, i){
                return name_items_shown[i][0];
            });
        
        
        // add the nodes
        node1.append("circle")
            .attr("r", function(d) {
                return Math.min(width_svg1 / 2 / (nodes_shown + 1) * 0.75, height_svg1 / 2 * 0.75);
            });
        
        node1.append("text")
            .text(function(d, i) {
                return users[name_items_shown[i][0]] + ' ' + friends_weight[name_items_shown[i][0]];
            })
            .attr("text-anchor", "middle")
            .style("font-size", function(d) {
                return 10;
            })
            .attr("x", function(d){
                return 0;
            })
            .attr("y", function(d){
                return height_svg1 / 2 * 0.8;
            });
        
        node1.on('click', selectFriend);
        
        
        
        
        // Settings of svg 2
        
        // size of svg 2
        var width_svg2 = width * width_svg2_ratio;
        var height_svg2 = height * height_svg2_ratio;
        
        // set the root user to the center of the canvas
        
        nodes_svg2[root].x = width_svg2 / 2;
        nodes_svg2[root].y = height_svg2 / 2;
        nodes_svg2[root].px = width_svg2 / 2;
        nodes_svg2[root].py = height_svg2 / 2;
        nodes_svg2[root].fixed = true;
        
        console.log('showing nodes in svg2');
        console.log(nodes_svg2);
        
        // get all the links from friends
        console.log('links_svg2 initially');
        var links_svg2 = [];
        links_user.forEach(function(link) {
            if ((link.source.name in nodes_svg2) && (link.target.name in nodes_svg2)) {
                console.log(link);
                links_svg2.push(link);
            }
            
        });
        
        console.log(links_svg2);
        console.log(nodes_svg2);
        
        
        
        // get all nodes from reader_basket
        
        console.log("book_nodes_backup");
        console.log(book_nodes_backup);
        temp_nodes_books_svg2 = {};
        for (var property in book_nodes_backup) {
            
            if ((property in books_info ) && (books_info[property].weight >= 2)) {
                temp_nodes_books_svg2[property] = book_nodes_backup[property];
            }
        }
        console.log("temp books nodes calculation:");
        console.log(temp_nodes_books_svg2);
        
        
        // Get all the nodes of readers in the current canvas
        all_reader_nodes = [];
        for (var property in nodes_svg2) {
            all_reader_nodes.push(property);
        }
        console.log(all_reader_nodes);
        
        
        // then calculate the intersection of readers of each book to the all_reader_nodes
        nodes_books_svg2 = {};
        for (var property in temp_nodes_books_svg2) {
            var ints = book_basket[property].filter(value => -1 !== all_reader_nodes.indexOf(value));
            //console.log(ints.length);
            if (ints.length > 1) {
                nodes_books_svg2[property] = temp_nodes_books_svg2[property];
            }
        }
        console.log(nodes_books_svg2);
        nodes_all_svg2 = {...nodes_svg2, ...nodes_books_svg2};
        
        
        // get all links from reader_basket
        var links_books_svg2 = [];
        console.log('links_books');
        console.log(links_books);
        links_books.forEach(function(link) {
            if ((link.source.name in nodes_all_svg2) && (link.target.name in nodes_all_svg2)) {
                links_svg2.push(link);
                links_books_svg2.push(link);
            }
            
        });
        console.log("links_books_svg2");
        console.log(links_books_svg2);
        console.log("links_svg2");
        console.log(links_svg2);
        console.log(nodes_all_svg2);
        console.log(d3.values(nodes_all_svg2));
        
        nodes_draw_svg2 = {};
        // get the nodes references from the links
        links_svg2.forEach(function(link) {
            link.source = nodes_draw_svg2[link.source] ||
                (nodes_draw_svg2[link.source] = {name: link.source});
            link.target = nodes_draw_svg2[link.target] ||
                (nodes_draw_svg2[link.target] = {name: link.target});
            link.value = 10;
        });
        
        // set the center node
        nodes_draw_svg2[root] = {};
        nodes_draw_svg2[root].x = width_svg2 / 2;
        nodes_draw_svg2[root].y = height_svg2 / 2;
        nodes_draw_svg2[root].px = width_svg2 / 2;
        nodes_draw_svg2[root].py = height_svg2 / 2;
        nodes_draw_svg2[root].fixed = true;
        
        console.log(nodes_draw_svg2);
        
        // Force layout of the nodes is confined in the canvas
        
        
        var force_svg2 = d3.layout.force()
            .nodes(d3.values(nodes_draw_svg2))
            .links(links_svg2)
            .size([width_svg2, height_svg2])
            .linkDistance(60)
            .charge(-250)
            .on("tick", tick)
            .start();
        console.log('after force layout');
        
        
        // The size of each node is scaled on the node degree
        // Set the range to [5, 10], and the scale type is sqrt(), so the size difference is not that big
        var  v = d3.scale.linear().range([5, 10]);
        // Scale the range of the data, maximum is the maximum degreee of all the nodes
        v.domain([0, d3.max(links_user, function(d) { return d.value; })]);

        var svgdiv2 = d3.select("#svgdiv2");
        
        d3.select("#svg2").remove();
        
        var svg2 = svgdiv2.append("svg")
            .attr("width", width_svg2)
            .attr("height", height_svg2)
            .attr("id", "svg2");
        
        // add the links
        var path = svg2.append("svg:g").selectAll("path")
            .data(force_svg2.links())
            .enter().append("svg:path")
            .attr("class", function(d) { return "link " + d.type; })
            .style("stroke", "rgba(100, 100, 100, 0.5)");
        
        // define the nodes
        var node2 = svg2.selectAll(".node")
            .data(force_svg2.nodes())
            .enter()
            .append("g")
            .attr("class", "node")
            .call(force_svg2.drag);
        
        
        // add the nodes
        node2.append("circle")
            .attr("r", function(d) {
                return v(d.weight);
            });

        // add the labels
        node2.append("text")
            .text(function(d) {
                return d.name;
            })
            .attr("text-anchor", "left")
            .style("font-size", function(d) {
                // label font sizes are proportional to the node weight
                return v(d.weight) * 1.5 + "px";
            })
            .attr("x", function(d){
                // x position of the label can is proportional to the node degree, thus the node radius, so the labels won't be covered by the node
                return v(d.weight);
            })
            .attr("y", function(d){
                // y position guarantees that the label is at lease somewhat parallel to the center of the node
                return 4;
            });

        node2.on("dblclick", function(d, i) {
            // The pinning method is realized from setting the dbclick funtion. From setting the css selectors class = "fixed", the node will be changed to color red; from declass the node, the color will restore.
            // d3.classed("classname", true/false) will set the corresponding classname to be functioning or not
            console.log(d.fixed);
            if (d.fixed == false) {
                d.fixed = !d.fixed;
                d3.select(this).select("circle").classed("fixed", true);
            }
            else {
                d.fixed = !d.fixed;
                d3.select(this).select("circle").classed("fixed", false);
            }
            
        });
        
        // add the curvy lines, in tick function, because it needs to be calculated when changes are made
        function tick() {
            path.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" +
                    d.source.x + "," +
                    d.source.y + "A" +
                    dr + "," + dr + " 0 0,1 " +
                    d.target.x + "," +
                    d.target.y;
            });

            node2.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")"; });
        };
        
        function selectFriend() {
            
            nodes_svg2[this.id] = book_nodes_backup[this.id];
            
            delete nodes_svg1[this.id];
            
            clearTimeout(timedEvent);
        
            timedEvent = setTimeout(resizeWindow, 1);
            
        }
        
    };
        
    

});