import sys
import json
import csv
import collections

errors = []
runs = []
success = []
websites = []

filename = sys.argv[1]
fname = str(filename)+'/'+str(filename)+'.csv_log.txt'
csvname = str(filename)+'.csv'

def convert(data):
    if isinstance(data, basestring):
        return data.encode('utf-8').strip()
    elif isinstance(data, collections.Mapping):
        return dict(map(convert, data.iteritems()))
    elif isinstance(data, collections.Iterable):
        return type(data)(map(convert, data))
    else:
        return data

with open('../data/csv/5k groups/'+str(csvname)) as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data)
    print(len(websites))
    csvFile.close()

with open('../data/Runs - success/'+fname) as tfile:
    fileStr = tfile.readlines()
    for i in fileStr:
        jsn = convert(json.loads(i))
        print jsn.keys()
 



