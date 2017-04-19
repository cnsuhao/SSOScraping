import sys

filename = sys.argv[1]
with open('../data/Runs - success/'+str(filename)) as tfile:
    fileStr = tfile.reader(tfile, delimiter='\n')
    print(fileStr)
