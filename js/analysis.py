import json

def LoadData(logFileName):
    log_data = []
    rankList = []
    with open(logFileName) as log_file:
        for line in log_file:
            jsonLine = json.loads(line)

            if 'error' in jsonLine:
                continue

            rank = jsonLine['rank']
            if rank in rankList:
                for ssoPair in jsonLine['sso']:
                    if ssoPair not in log_data[rankList.index(rank)]['sso']:
                        log_data[rankList.index(rank)]['sso'].append(ssoPair)
                continue
            else:
                rankList.append(rank)

            log_data.append(jsonLine)
    return log_data


def GetAnalysisData(logData):
    analysisData, ssoProviders, ssoTypes = ([] for i in range(3))
    for jsonLine in logData:
        for ssoPair in jsonLine['sso']:
            #for pair in ssoPair:
                items = ssoPair.split(',')
                provider = items[0]
                type = items[1]
                if provider not in ssoProviders:
                    ssoProviders.append(provider)
                if type not in ssoTypes:
                    ssoTypes.append(type)

                analysisData.append([jsonLine['url'], provider, type])

    return analysisData, ssoProviders, ssoTypes

def GetCount(analysisData, provider, type):
    return

logFileName = 'top-7k.csv_log.txt'
logData = LoadData(logFileName)
analysisData, ssoProviders, ssoTypes = GetAnalysisData(logData)
GetCount(analysisData, 'facebook', 'openid')