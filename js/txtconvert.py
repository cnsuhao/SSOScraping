import sys

errors = []
runs = []
success = []

filename = sys.argv[1]
fname = str(filename)+'/'+str(filename)+'.csv_log.txt'
with open('../data/Runs - success/'+fname) as tfile:
    fileStr = tfile.readlines()
    for i in fileStr:
        if i.find('error') != -1 and i.find('message') != -1:
            errors.append(i)
        elif i.find('oauth-keyword') != -1 or i.find('oauth-url') != -1 or i.find('openid') != -1 or i.find('no-url') != -1:
            success.append(i)
        elif i.find('sso') != -1:
            runs.append(i)
e = open('../data/Runs - success/'+str(filename)+'/'+str(filename)+'_errors.txt', 'w+')
e.write(('\n').join(errors))
r = open('../data/Runs - success/'+str(filename)+'/'+str(filename)+'_runs.txt', 'w+')
r.write(('\n').join(runs))
s = open('../data/Runs - success/'+str(filename)+'/'+str(filename)+'_success.txt', 'w+')
s.write(('\n').join(success))
