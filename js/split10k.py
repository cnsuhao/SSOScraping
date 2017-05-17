import csv
import os
import sys

websites = []
# filename = sys.argv[1]
# start = sys.argv[2]
# end = sys.argv[3]

# Read websites data from CSV file
with open('error4.csv') as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data)
    csvFile.close()

print len(websites)

# Split into chunks of array
def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in xrange(0, len(l), n):
        yield l[i:i + n]


listchunks = list(chunks(websites, 400));
for idx,chunk in enumerate(listchunks):
	fname = "400-"+str(idx+1)+"k.csv"
	with open(fname, "wb") as file:
		writer = csv.writer(file,  delimiter=',')
		for data in chunk:
			writer.writerow(data)
		file.close()