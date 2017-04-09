import subprocess
import csv
import os

os.environ["DISPLAY"]=":1"
xvfb = subprocess.Popen(['Xvfb', ':1'])
websites = []
with open('../data/top-20k.csv') as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data[1])
    csvFile.close()

for site in websites:
	site = "https://"+site
	print site
	cmd = "node DEBUG=nightmare* index.js "+site
	subprocess.call(cmd, shell=True)
