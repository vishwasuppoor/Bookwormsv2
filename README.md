# bookworms version 2

## Usage:

1. Inside `py` folder, there is `graph_ceruser_gen_books.py` which will generate all the necessary json files. After running the script, the corresponding json files are generated and copied into `page` folder for use.
2. Inside `page` folder, `graph.html` is the main webpage.

## Explanation of webpage

![screenshot of the webpage](https://github.com/vishwasuppoor/bookwormsv2/blob/master/misc/screenshot.png)

1. Left canvas list the friends of the root user, in the descending order of number of books read by each person. The number of books read in labeled in the center of the node, the name of the each friend is also labelled below the node.
2. Center canvas is a force-directed graph, with friends of the root user. Center canvas start with the root user, then any click in the left canvas will add the clicked node to the center canvas. Then the most common books will be labeled as a green node. When hovering over the green node, the name of the book is shown; when clicked, the details of the book is shown on the right canvas.
3. Right canvas is the details of the selected book: book title, isbn, rating and description.
