'''
tested on python 3.6

This function generates the graph data needed for testing of book exploration. Including the weight information.

Usage: sys.argv[0] friends_output reader_basket book_basket books

Inputs:
    size: the total number of links for output 

Example: sys.argv[0] friends reader_basket book_basket books


Output Format:
        reader_basket_output: 
'''


import json
import sys
import random
import shutil, os



# get the user name and id correspondance
def user_id_cor(data):
    cor = {}

    for key, value in data.items():
        cor[key] = value["name"]
        for keys, values in value["friend"].items():
            if keys not in cor:
                cor[keys] = values
        
    print('the number of users in this dataset:')
    print(len(cor))
    with open('users' + '.json', 'w+') as output:
        json.dump(cor, output)    
    

def get_links(data, reader_bas_data):
    links = []

    # get the first layer friends of the root user
    sample_user = random.sample(data.keys(), 1)
    sample_user = sample_user[0]
    print('randomly generated sample_user')
    print(sample_user)
    sample_user = '37443397'
    print('specified sample_user')
    print(sample_user)
    sample_friend = data[sample_user]['friend']
    for keyf, valuef in sample_friend.items():
        links.append({"source": sample_user, "target": keyf})
        
    print("total number of links:")
    print(str(len(links)))
    # save the links to file
    with open('links' + '.json', 'w+') as output:
        json.dump(links, output)
    
    
    
    # get the number of books read by the particular friend
    # if the friend is not in the dataset, then the length is set to be 0
    friend_weight = {}
    for key, value in sample_friend.items():
        if key in reader_bas_data:
            friend_weight[key] = len(reader_bas_data[key])
        else:
            friend_weight[key] = 0
    # save the friend weight to file
    with open('friends_weight' + '.json', 'w+') as output:
        json.dump(friend_weight, output)
    
    
    return links


def get_links_books(links, reader_bas_data, book_bas_data, book_data):

    book_lim = 5
    
    # get the output links
    # readers is the list of user ids of all the people in links
    temp_links = links
    readers = []
    for link in temp_links:
        if link["source"] not in readers:
            readers.append(link["source"])
        if link["target"] not in readers:
            readers.append(link["target"])

    # the number of people that have read a particular book
    # the form is isbn: name, avg_rating, weight
    books_info = {}
    
    links_books = []
    for key, value in reader_bas_data.items():
        if key in readers:
            for book_isbn, book_value in value.items():
                    
                if len(book_bas_data[book_isbn]) > book_lim:
                    if book_isbn not in books_info:
                        temp = 0
                        for reader_id in readers:
                            if (reader_id in reader_bas_data) and (book_isbn in reader_bas_data[reader_id]):
                                temp += 1
                        books_info[book_isbn] = {"weight": temp, "name": book_value["name"], "avg_rating": book_value["avg_rating"], "description": book_data[book_isbn]["description"]}
                
                    links_books.append({"source": key, "target": book_isbn})
                    
    with open('links_books' + '.json', 'w+') as output:
        print("length of book links")
        print(len(links_books))
        json.dump(links_books, output)
        
    with open('books_info' + '.json', 'w+') as output:
        json.dump(books_info, output)
        
    with open('book_basket' + '.json', 'w+') as output:
        json.dump(book_bas_data, output)

        
def copy_files(copy_list):
    dir_path = os.path.dirname(os.path.realpath(__file__))
    
    # iterate through the list of files
    for name in copy_list:
        dir_file_path = os.path.join(dir_path, name)
        dst_path = os.path.join(dir_path, '..', 'page')
        dst_file_path = os.path.join(dst_path, name)
        shutil.copy(dir_file_path, dst_file_path)


def main():
    with open(sys.argv[1], 'r') as input:
        data = json.load(input)
        
    with open(sys.argv[2], 'r') as input:
        reader_bas_data = json.load(input)
        
    with open(sys.argv[3], 'r') as input:
        book_bas_data = json.load(input)
        
    with open(sys.argv[4], 'r') as input:
        book_data = json.load(input)
    
    user_id_cor(data)
    links = get_links(data, reader_bas_data)
    get_links_books(links, reader_bas_data, book_bas_data, book_data)
    
    
    copy_list = ['links', 'links_books', 'books_info', 'friends_weight', 'users', 'book_basket']
    copy_list = [name + '.json' for name in copy_list]
    copy_files(copy_list)
    
if __name__ == '__main__':
    main()
    