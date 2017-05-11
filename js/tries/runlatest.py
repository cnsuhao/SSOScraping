import csv
import os
import json
import subprocess
import sys
import time



os.environ["DISPLAY"]=":3"
websites = []

t0 = time.time()
filename = sys.argv[1]
start = sys.argv[2]

print int(start)
# Read websites data from CSV file
with open('../../data/csv/'+str(filename)) as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        if(int(data[0]) > int(start)):
            websites.append(data)
    print(websites)
    csvFile.close()

# Split into chunks of array
def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in xrange(0, len(l), n):
        yield l[i:i + n]


listchunks = list(chunks(websites, 1));
print(len(listchunks))

for chunk in listchunks:
    print("chunk"+str(len(chunk)))
    cmd = "DEBUG=nightmare:actions* node indexlatest.js '"+json.dumps(filename)+"'"
    cmd += " '"+json.dumps(chunk)+"'"
    subprocess.call(cmd, shell=True)
t1 = time.time()

total = t1-t0
print total