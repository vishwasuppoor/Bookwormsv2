
// set variables

var nodes_svg1 = {};
var nodes_svg2 = {};
var nodes_all_svg2 = {};
var nodes_draw_svg2 = {};
var links_draw_svg2 = [];
var nodes_backup = {};
var book_nodes_backup = {};
var links_user = [];
var links_books = [];
var timedEvent;
var width_svg1_ratio = 0.15;
var height_svg1_ratio = 1.0;
var width_gap_ratio = 0.02;
var height_gap_ratio = 0.05;
var width_svg2_ratio = 0.55;
var height_svg2_ratio = height_svg1_ratio;
var root;
var node_size_range_svg2 = [5, 10];
var book_id_list = [
    'book_de',
    'book_title',
    'book_isbn',
    'book_rating',
    'book_descrip'
    ];
var book_content_list = [
    'DETAILS:',
    'No title',
    'No isbn',
    0,
    'No description: please select one book'
    ];
var book_element_list = [
    "h2",
    "h1",
    "p",
    "p",
    "p"
    ];
var book_align_list = [
    "center",
    "center",
    "center",
    "center",
    "left",
    ];


// load data from files
d3.queue()
.defer(d3.json, "links.json")
.defer(d3.json, "links_books.json")
.defer(d3.json, "users.json")
.defer(d3.json, "books_info.json")
.defer(d3.json, "friends_weight.json")
.defer(d3.json, "book_basket.json")
.await(function(error, data, data_books, users, books_info, friends_weight, 
    book_basket){
    
    // create new promise, so that only after all databases are load, 
    // the alg will continue
    var promise_calc = new Promise(function(resolve, reject){
        root = data[0].source;
        
        // Links_user is the first data, including all links between friends
        // and root user
        links_user = data;
        // Compute the distinct nodes from the links. Set the weight of user
        // link to be 20
        links_user.forEach(function(link) {
            if (!(link.source in nodes_backup)) {
                nodes_backup[link.source] = {name: link.source};
            }
            if (!(link.target in nodes_backup)) {
                nodes_backup[link.target] = {name: link.target};
            }
            link.value = 20;
        });
        
        // Links_books is the second data, including all links between 
        // a reader and a book
        links_books = data_books;
        // Compute the distince nodes from the books_links. Set the weight
        // of user-book link to be 10
        links_books.forEach(function(link) {
            if (!(link.target in book_nodes_backup)) {
                book_nodes_backup[link.target] = {name: link.target};
            }
            link.value = 10;
        });
        
        
        // Iterate through all nodes, then separate them into different svgs
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
        
        for (var i = 0; i < book_id_list.length; i ++) {
            d3.select("#bookinfo")
                .append("div")
                .attr("class", "row")
                .attr("id", book_id_list[i])
                .append(book_element_list[i])
                .text(book_content_list[i])
                .style("text-align", book_align_list[i]);
                
        }
        d3.select("#bookinfo")
            .select("#" + book_id_list[3])
            .append("div")
            .attr("id", "book_rating_star")
            .style("text-align", "center");
        for (var i = 0; i < 5; i ++) {
            d3.select("#book_rating_star")
                .append("span")
                .attr("id", "star" + i)
                .attr("class", "star fas fa-star");
        }
        
        
        resolve("done");
    });
    
    // When calculation is done, the call the resize function once
    promise_calc.then(
        function(resolve) {
            resizeWindow();
        }
    );
    
    
    // When windows is resized, call resizeWindow function, with 
    // timeout of 0.001s
    window.addEventListener("resize", function() {
        
        clearTimeout(timedEvent);
        timedEvent = setTimeout(resizeWindow, 1);
        
    });
    
    
    // Recalculate the svgs when window is resized
    function resizeWindow() {
        
        console.log("\n\n\n\n\n\n");
        // Settings of the canvas
        var width = $(window).width();
            height = $(window).height();
            
        
        
        
        
        
        // Settings of svg 1
        
        // size of svg 1
        var width_svg1 = width * width_svg1_ratio;
        var height_svg1 = height * height_svg1_ratio;
        
        var svgdiv1 = d3.select("#svgdiv1");
        
        // remove the svg1 first when redrawing happens
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
                y: height_svg1 / (nodes_shown + 1) * (i + 1),
                x: width_svg1 / 2});
        }
        
        
        // get the weight of all the friends of the the root user
        var name_items = Object.keys(nodes_svg1).map(function(key) {
            return [key, friends_weight[key]]; 
        });
        // sort the name using the weights
        name_items.sort(function(cfirst, csecond) {
            return csecond[1] - cfirst[1];
        });
        // get the first nodes_shown number of names
        var nodes_shown_real = d3.min([nodes_shown, name_items.length]);
        var name_items_shown = name_items.slice(0, nodes_shown_real);
        
        
        // define the nodes
        var node1 = svg1.selectAll(".node1")
            .data(pos_nodes_svg1.slice(0, nodes_shown_real))
            .enter()
            .append("g")
            .attr("class", "node1")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")"; })
            .attr("id", function(d, i){
                return name_items_shown[i][0];
            });
        
        
        // add the nodes
        var circle_radius = Math.min(height_svg1 / 2 / (nodes_shown + 
            1) * 0.45, width_svg1 / 2 * 0.45);
        node1.append("circle")
            .attr("r", function(d) {
                return circle_radius;
            });
        node1.append("text")
            .text(function(d, i) {
                return friends_weight[name_items_shown[i][0]];
            })
            .attr("text-anchor", "middle")
            .style("font-size", function(d) {
                return circle_radius * 0.75 + "px";
            })
            .attr("x", function(d){
                return 0;
            })
            .attr("y", function(d){
                return "0.35em";
            });
        
        node1.append("text")
            .text(function(d, i) {
                return users[name_items_shown[i][0]];
            })
            .attr("text-anchor", "middle")
            .style("font-size", function(d) {
                return "15px";
            })
            .attr("x", function(d){
                return 0;
            })
            .attr("y", function(d){
                return Math.min(width_svg1 / 2 * 0.75, 60);
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
        
        // get all the links from friends
        var links_svg2 = [];
        links_user.forEach(function(link) {
            if ((link.source in nodes_svg2) && (link.target in nodes_svg2)) {
                console.log(link);
                links_svg2.push(link);
            }
            
        });
        
        
        // get all nodes from reader_basket
        temp_nodes_books_svg2 = {};
        for (var property in book_nodes_backup) {
            
            if ((property in books_info ) && (books_info[property].weight >= 2)) {
                temp_nodes_books_svg2[property] = book_nodes_backup[property];
            }
        }
        // Get all the nodes of readers in the current canvas
        all_reader_nodes = [];
        for (var property in nodes_svg2) {
            all_reader_nodes.push(property);
        }
        // then calculate the intersection of readers of each book to the all_reader_nodes
        nodes_books_svg2 = {};
        for (var property in temp_nodes_books_svg2) {
            var ints = book_basket[property].filter(value => -1 !== all_reader_nodes.indexOf(value));
            if (ints.length > 2) {
                nodes_books_svg2[property] = temp_nodes_books_svg2[property];
            }
        }
        nodes_all_svg2 = {...nodes_svg2, ...nodes_books_svg2};
        
        
        // get all links from reader_basket
        var links_books_svg2 = [];
        links_books.forEach(function(link) {
            if ((link.source in nodes_all_svg2) && (link.target in nodes_all_svg2)) {
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
        
        // set up the nodes and links used to be drawn
        nodes_draw_svg2 = {};
        links_draw_svg2 = [];
        links_draw_svg2 = JSON.parse(JSON.stringify(links_svg2));
        
        // get the nodes references from the links
        links_draw_svg2.forEach(function(link) {
            link.source = nodes_draw_svg2[link.source] ||
                (nodes_draw_svg2[link.source] = {name: link.source});
            link.target = nodes_draw_svg2[link.target] ||
                (nodes_draw_svg2[link.target] = {name: link.target});
            link.value = 10;
        });
        
        
        // set the center node
        if (root in nodes_draw_svg2) {
            nodes_draw_svg2[root].x = width_svg2 / 2;
            nodes_draw_svg2[root].y = height_svg2 / 2;
            nodes_draw_svg2[root].px = width_svg2 / 2;
            nodes_draw_svg2[root].py = height_svg2 / 2;
            nodes_draw_svg2[root].fixed = true;
        }
        else {
            nodes_draw_svg2[root] = {};
            nodes_draw_svg2[root].x = width_svg2 / 2;
            nodes_draw_svg2[root].y = height_svg2 / 2;
            nodes_draw_svg2[root].px = width_svg2 / 2;
            nodes_draw_svg2[root].py = height_svg2 / 2;
            nodes_draw_svg2[root].fixed = true;
            nodes_draw_svg2[root].name = root;
        }
        
        
        console.log(root);
        console.log(nodes_draw_svg2);
        console.log(links_draw_svg2);
        
        // Force layout of the nodes is confined in the canvas
        
        
        var force_svg2 = d3.layout.force()
            .nodes(d3.values(nodes_draw_svg2))
            .links(links_draw_svg2)
            .size([width_svg2, height_svg2])
            .linkDistance(250)
            .charge(-1750)
            .on("tick", tick)
            .start();
        console.log('after force layout');
        
        
        // The size of each node is scaled on the node degree
        // Set the range to [5, 10], and the scale type is sqrt(), so the size difference is not that big
        var  v = d3.scale.linear().range(node_size_range_svg2);
        // Scale the range of the data, maximum is the maximum degreee of all the nodes
        v.domain([0, d3.max(d3.values(nodes_draw_svg2), function(d) {
            return d.weight;
        })]);

        var svgdiv2 = d3.select("#svgdiv2")
            .style("left", width_svg1 + width * width_gap_ratio + "px");
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
        var circles2 = node2.append("circle")
            .attr("r", function(d) {
                if (d.name.length < 9) {
                    return v(d.weight);
                }
                else {
                    return node_size_range_svg2[1] * 2;
                }
                
            })
            .attr("class", function(d) {
                if (d.name.length < 9) {
                    return "user";
                }
                else {
                    return "book";
                }
            });
        

        // add the labels
        node2.append("text")
            .text(function(d) {
                //return d.name;
                if (d.name.length < 9) {
                    return users[d.name];
                }
                else {
                    return "";
                }
            })
            .attr("text-anchor", "left")
            .style("font-size", function(d) {
                // label font sizes are proportional to the node weight
                if (d.name.length > 9) {
                    return 18 + "px";
                }
                else {
                    return 10 + "px";
                }
                
            })
            .attr("x", function(d){
                // x position of the label can is proportional to the node degree, thus the node radius, so the labels won't be covered by the node
                return v(d.weight) * 2;
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
        
        circles2.on("mouseover", function(d) {
            if (d.name.length > 9) {
                console.log(d.name);
                //console.log(books_info[d.name]);
                d3.select(this.parentNode)
                .select("text")
                .text(function(d) {
                    if (books_info[d.name].name.length > 30) {
                        return books_info[d.name].name.slice(0, 30) + "...";
                    }
                    else {
                        return books_info[d.name].name;
                    }
                    
                })
                .attr("id", function() {
                    return "book" + books_info[d.name].name.replace(/\W/g, '');
                })
                .style("font-size", "20px")
                .style("z-index", 1);
                
            }
            
        })
        circles2.on("mouseout", function(d) {
            if (d.name.length > 9) {
                console.log("run to here");
                var remid = "#book" + books_info[d.name].name.replace(/\W/g, '');
                console.log(remid);
                d3.select(remid)
                .text("");
            }
        });
        d3.selectAll("circle.book")
            .on("click", selectBook);
        
        
        
        
        
        // Book details
        d3.select("#bookinfo")
            .style("width", (1 - width_svg1_ratio - width_gap_ratio * 2 - width_svg2_ratio) * width - 20 + "px");
        
        
        for (var i = 0; i < book_id_list.length; i ++) {
            d3.select("#bookinfo")
                .select("div#" + book_id_list[i])
                .select(book_element_list[i])
                .text(book_content_list[i]);                
        }
        var class_list = [1, 1, 1, 1, 1];
        for (var i = 0; i < 5; i ++) {
            if (Math.abs(i + 0.5 - book_content_list[3]) < 0.25) {
                class_list[i] = 0;
            }
        }
        for (var i = 0; i < 5; i ++) {
            d3.select("#star" + i)
                .classed("fa-star", function() {
                    if (class_list[i] == 1) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .classed("fa-star-half-alt", function() {
                    if (class_list[i] == 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                })
                .classed("checked", function() {
                    console.log(book_content_list[3]);
                    if ((i + 0.5) < book_content_list[3]) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
        }
        
        
        
        
        
        
        
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
            
            nodes_svg2[this.id] = nodes_backup[this.id];
            delete nodes_svg1[this.id];
            clearTimeout(timedEvent);
            timedEvent = setTimeout(resizeWindow, 1);
            
        }
        
        function selectBook() {
            console.log(this.__data__.name);
            var book_small = books_info[this.__data__.name];
            console.log(book_small);
            book_content_list[1] = book_small.name;
            book_content_list[2] = "ISBN: " + this.__data__.name;
            book_content_list[3] = book_small["avg_rating"];
            if (book_small.description.length > 700) {
                book_content_list[4] = book_small.description.slice(0, 700) + "... ...";
            }
            else {
                book_content_list[4] = book_small.description;
            }
            
            
            clearTimeout(timedEvent);
            timedEvent = setTimeout(resizeWindow, 1);
            
        }
        
    };
        
    

});