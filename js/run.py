import csv
import os
import json
import subprocess


os.environ["DISPLAY"]=":3"
websites = []

# Read websites data from CSV file
with open('../data/top-2k.csv') as csvFile:
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

for chunk in listchunks:
	print("Chunk")
	cmd = "DEBUG=nightmare:actions* node index.js '"+json.dumps(chunk)+"'"
	subprocess.call(cmd, shell=True)