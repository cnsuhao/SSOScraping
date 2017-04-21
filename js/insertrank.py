import sys
import json
import csv
import collections
import ast

errors = []
runs = []
success = []
websites = []
newDict = {}

filename = sys.argv[1]
fname = str(filename)+'/'+str(filename)+'.csv_log.txt'
csvname = str(filename)+'.csv'


with open('../data/csv/5k groups/'+str(csvname)) as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data)
    print(len(websites))
    csvFile.close()

with open('../data/Runs - success/'+fname) as tfile:
    for line in tfile:
        split = ast.literal_eval(line)
        print type(split)
 



