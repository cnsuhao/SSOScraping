import csv
import os
import json
import subprocess
import sys



os.environ["DISPLAY"]=":3"
websites = []


filename = sys.argv[1]

# Read websites data from CSV file
with open('../data/csv/'+str(filename)) as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data[1])
    csvFile.close()

# Split into chunks of array
def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in xrange(0, len(l), n):
        yield l[i:i + n]


listchunks = list(chunks(websites, 100));
print(len(listchunks))

for chunk in listchunks:
    print("chunk")
    cmd = "DEBUG=nightmare:actions* node index.js '"+json.dumps(filename)+"'"
    cmd += " '"+json.dumps(chunk)+"'"
    subprocess.call(cmd, shell=True)
