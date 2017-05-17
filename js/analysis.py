import json
import re
import sys
from operator import itemgetter
from urlparse import urlparse

lgRe = re.compile('log[\-\s]*[io]+n', re.I)
sgRe = re.compile('sign[\-\s]*[io]+n', re.I)
suRe = re.compile('sign[\-\s]*up+', re.I)
crRe = re.compile('create[\-\s]*account+', re.I)
rgRe = re.compile('register', re.I)
gsRe = re.compile('get[\-\s]*started', re.I)
rnRe = re.compile('registration', re.I)
euRe = re.compile('existing[\-\s]*user', re.I)
jnRe = re.compile('join', re.I)

reList = [lgRe, sgRe, euRe, suRe, crRe, rgRe, gsRe, rnRe, jnRe]

def find(s, ch):
    return [i for i, ltr in enumerate(s) if ltr == ch]


def LoadData(logFileName):
    rankList, log_data, ssoProviders, ssoTypes = ([] for i in range(4))
    with open(logFileName) as log_file:
        for line in log_file:
            jsonLine = json.loads(line)

            if 'error' in jsonLine:
                continue

            rank = jsonLine['rank']
            if rank not in rankList:
                rankList.append(jsonLine['rank'])

            loginType = ''
            for idx, reType in enumerate(reList):
                match = reType.search(jsonLine['url'])
                if match is None:
                    continue
                if idx < 3:
                    loginType = 'login'
                else:
                    loginType = 'signup'
            if loginType == '':
                loginType = 'misc'

            url = jsonLine['url']
            parseduri = urlparse((jsonLine['url']).encode('ascii', 'ignore'))
            domain = '{uri.netloc}'.format(uri=parseduri)

            if domain.find('www') != -1:
                domain = domain.translate(None, 'www')
                domain = domain.replace('.', '', 1)

            if len(jsonLine['sso']) == 0:
                log_data.append([jsonLine['rank'], url, domain, loginType, '', ''])
            else:
                for ssoPair in jsonLine['sso']:
                    items = ssoPair.split(',')
                    provider = items[0]
                    type = items[1]
                    if provider == 'vk' or provider == 'vkontakte':
                        provider = 'vk'
                    if provider not in ssoProviders:
                        ssoProviders.append(provider)
                    if type not in ssoTypes:
                        ssoTypes.append(type)
                    log_data.append([jsonLine['rank'], url, domain, loginType, provider, type])
    log_data = sorted(log_data, key=itemgetter(2))
    return len(rankList), ssoProviders, ssoTypes, log_data

def GetCount(numSites, ssoProviders, ssoTypes, logData):
    idpLoginSignupCount, percentageIdp, edges = ([] for i in range(3))
    sumPer=0
    totalIdp = 0
    for provider in ssoProviders:
        loginSlice = [x for x in logData if (x[3]=='login'and x[4]==provider)]
        signupSlice = [x for x in logData if (x[3] == 'signup' and x[4] == provider)]
        miscSlice = [x for x in logData if (x[3] == 'misc' and x[4] == provider)]
        idpLoginSignupCount.append([provider, 'login', len(loginSlice)])
        idpLoginSignupCount.append([provider, 'signup', len(signupSlice)])
        idpLoginSignupCount.append([provider, 'misc', len(miscSlice)])
        total = len(loginSlice) + len(signupSlice) + len(miscSlice)
        totalIdp = totalIdp + total
        percentage = (total/float(numSites))*100
        percentageIdp.append([provider, total, percentage])
        sumPer = sumPer + percentage

    for logLine in logData:
        if logLine[4] == '' or logLine[4] is None or logLine[2] == '' or logLine[2] is None:
            continue
        edges.append([logLine[2], logLine[4]])

    return totalIdp, idpLoginSignupCount, percentageIdp, edges

def WriteResultsToFiles(numSites, totalIdp, idpLoginSignupCount, percentageIdp, edges):
    print ('Processed Websites: ', numSites)
    print ('Websites with IDP: ', totalIdp)
    print ('IDP Login Signup Count: ')

    for line in idpLoginSignupCount:
        opLine = ''
        for element in line:
            opLine  = opLine + str(element) + '\t'
        print ('\t' + opLine)

    print ('IDP Count Percentage')
    for line in percentageIdp:
        opLine = ''
        for element in line:
            opLine = opLine + str(element) + '\t'
        print ('\t' + opLine)

    edges = sorted(edges, key=itemgetter(0))
    for line in edges:
        opLine = ''
        for idx, element in enumerate(line):
            element = element.rstrip()
            uel = element.encode('ascii', 'ignore')
            opLine = opLine + str(uel) + '\t'
        with open('generatedEdges.txt', 'a') as efile:
            efile.write(opLine + '\n')
    return

logFileName = sys.argv[1]
numSites, ssoProviders, ssoTypes, logData = LoadData(logFileName)
totalIdp, idpLoginSignupCount, percentageIdp, edges = GetCount(numSites, ssoProviders, ssoTypes, logData)
WriteResultsToFiles(numSites, totalIdp, idpLoginSignupCount, percentageIdp, edges)
