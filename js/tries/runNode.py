import subprocess
import csv
import os

os.environ["DISPLAY"]=":3"
websites = []
with open('../data/top-20k.csv') as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data[1])
    csvFile.close()

for sitenum in range(len(websites)):
	if(sitenum < 4809): continue
	site = "https://www."+websites[sitenum]
	print site
	cmd = "DEBUG=nightmare:actions* node index.js "+site
	subprocess.call(cmd, shell=True)