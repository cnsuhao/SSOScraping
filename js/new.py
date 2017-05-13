#!/usr/bin/env python

import collections
import json
import sys

if len(sys.argv) != 3:
    sys.exit("Usage: %s ORIGINAL LOG" % sys.argv[0])

sites = collections.OrderedDict()
with open(sys.argv[1], "r") as f:
    for line in f:
        rank, domain = line.rstrip().split(',', 2)
        rank = int(rank)
        sites[rank] = domain

with open(sys.argv[2], "r") as f:
    for line in f:
        record = json.loads(line)
        rank = int(record["rank"])
        sites.pop(rank, None)

for rank, domain in sites.items():
    print("{:d},{}".format(rank, domain))
