import csv
import os
import sys

websites = []
filename = sys.argv[1]
start = sys.argv[2]
end = sys.argv[3]

# Read websites data from CSV file
with open('../data/csv/top-1m.csv') as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data)
    csvFile.close()

print len(websites)
with open(str(filename), "wb") as file:
	writer = csv.writer(file,  delimiter=',')
	for data in websites:
		if(int(data[0]) > int(start) and int(data[0]) <= int(end)):
			writer.writerow(data)
	file.close()