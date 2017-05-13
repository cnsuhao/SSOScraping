import csv
import os
import json
import subprocess
import sys



os.environ["DISPLAY"]=":3"


filename = sys.argv[1]
logName = sys.argv[2]
cmd = "node main.js -w 2 " + filename +" | tee -a "+ logName
print cmd
subprocess.call(cmd, shell=True)