import csv
import os
import json
import subprocess
import sys



os.environ["DISPLAY"]=":3"


filename = sys.argv[1]
logName = sys.argv[2]
cmd = "node main.js -w 2 "+json.dumps(filename)+" | tee -a "+json.dumps(logName)
print cmd
subprocess.call(cmd, shell=True)