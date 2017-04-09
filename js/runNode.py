import subprocess
import csv

websites = []
with open('../data/summa.csv') as csvFile:
    reader = csv.reader(csvFile, delimiter=",")
    for data in reader:
        websites.append(data[1])
    csvFile.close()

for site in websites:
    site = "https://"+site
    print site
    subprocess.call("xvfb-run --server-args='-screen 0 1024x768x24' node index.js "+site, shell=True)
