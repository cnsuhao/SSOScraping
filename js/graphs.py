import re
from graph_tool.all import *

singles = set()
pairs = []
fb = re.compile('facebook|fb', re.I)
listIdps = [re.compile('google', re.I), re.compile('yahoo', re.I), re.compile('500px', re.I), re.compile('aol', re.I),
            re.compile('twitter', re.I), re.compile('vk|vkontakte', re.I), re.compile('yammer', re.I),
            re.compile('yandex', re.I), re.compile('zendesk', re.I), re.compile('amazon', re.I), re.compile('flickr', re.I),
            re.compile('bitbucket', re.I), re.compile('bitly', re.I), re.compile('cloud[\-\s]*foundry', re.I),
            re.compile('dailymotion', re.I), re.compile('deviantart', re.I), re.compile('discogs', re.I),
            re.compile('huddle', re.I), re.compile('netflix', re.I), re.compile('openlink[\-\s]*data[\-\s]*spaces', re.I),
            re.compile('openstreetmap', re.I), re.compile('opentable', re.I), re.compile('passport', re.I),
            re.compile('paypal', re.I), re.compile('plurk', re.I), re.compile('sina[\-\s]*weibo', re.I),
            re.compile('stack[\-\s]*exchange', re.I), re.compile('statusnet', re.I), re.compile('ubuntu[\-\s]*one', re.I),
            re.compile('viadeo', re.I), re.compile('vimeo', re.I), re.compile('withings', re.I), re.compile('xero', re.I),
            re.compile('xing', re.I), re.compile('goodreads', re.I), re.compile('google[\-\s]*app[\-\s]*engine', re.I),
            re.compile('groundspeak', re.I), re.compile('intel[\-\s]*cloud[\-\s]*services', re.I), re.compile('jive', re.I),
            re.compile('linkedin', re.I), re.compile('trello', re.I), re.compile('tumblr', re.I), re.compile('mixi', re.I),
            re.compile('microsoft', re.I), re.compile('myspace', re.I), re.compile('etsy', re.I), re.compile('evernote', re.I),
            re.compile('yelp', re.I), re.compile('dropbox', re.I), re.compile('twitch', re.I), re.compile('stripe', re.I),
            re.compile('basecamp', re.I), re.compile('box', re.I), re.compile('formstack', re.I), re.compile('github', re.I),
            re.compile('reddit', re.I), re.compile('instagram', re.I), re.compile('foursquare', re.I),
            re.compile('fitbit', re.I), re.compile('imgur', re.I), re.compile('salesforce', re.I), re.compile('strava', re.I),
            re.compile('battle.net', re.I)]


def calcVertexType(inputStr):
    vertexType = '1'
    if fb.search(inputStr) is not None:
        vertexType = '-1'
        return vertexType
    for idp in listIdps:
        if idp.search(inputStr) is not None:
            vertexType = '0'
            break
    return vertexType

def checkObjPresence(obj, list):
    present = False
    for item in list:
        splitObj = obj.split(',')
        splitlistObj = item.split(',')
        if splitObj[0] == splitlistObj[0] and splitObj[1] == splitlistObj[1]:
            present = True
            break
    return present

#Read from edges file
filename = 'generatedEdges.txt'
with open(filename) as edgeFile:
    for line in edgeFile:
        split = line.split('\t')
        singleIdp = split[0].strip()
        singleRp = split[1].strip()
        pair = singleIdp+','+singleRp
        if not(checkObjPresence(pair, pairs)):
            pairs.append(pair)
        rpVtype = calcVertexType(singleRp)
        idpVtype = calcVertexType(singleIdp)
        singles.add(singleIdp+','+idpVtype)
        singles.add(singleRp+','+rpVtype)
print len(pairs)
g1 = Graph(directed=False)

vprop_type = g1.new_vertex_property('string')
vprop_value = g1.new_vertex_property('string')
vprop_color = g1.new_vertex_property('string')
vprop_shape = g1.new_vertex_property('string')

for each in singles:
    print "vertex addition"
    newV = g1.add_vertex()
    vertexVal = each.split(',')[0]
    vertexType = each.split(',')[1]
    vprop_value[newV] = vertexVal
    vprop_type[newV] = vertexType
    if vertexType == '0':
        vprop_color[newV] = 'yellow'
        vprop_shape[newV] = 'triangle'
    if vertexType == '1':
        vprop_color[newV] = 'white'
        vprop_shape[newV] = 'circle'
    if vertexType == '-1':
        vprop_color[newV] = 'blue'
        vprop_shape[newV] = 'square'

edgeList = []
for pair in pairs:
    idp = pair.split(',')[0]
    rp = pair.split(',')[1]
    print "hi"
    #Logic for first figure
    src = [v for v in g1.get_vertices() if vprop_value[v] == idp][0]
    trgt = [v for v in g1.get_vertices() if vprop_value[v] == rp][0]
    edgeList.append((src,trgt))
    if fb.search(vprop_value[src]) is not None:
        if vprop_type[trgt] == '1':
            vprop_color[trgt] = 'green'
g1.add_edge_list(edge_list=edgeList)

graph_draw(g1, bg_color=[1,1,1,1], vertex_size=10, vertex_color="black", vertex_fill_color=vprop_color,
           vertex_shape=vprop_shape, vertex_pen_width=0.5, edge_color="black", output_size=(400, 400), output="fig1.pdf")


g2 = Graph(g1)
rpsWoFb = []
#Logic for second figure
for v in g2.get_vertices():
    print "second addition"
    if vprop_type[v] == '1':
        neighbors = g2.get_out_neighbours(v)
        gen = (w for w in neighbors if vprop_type[w] == '-1')
        if len(list(gen)) > 0:
            continue
        else:
            rpsWoFb.append(v)
for v in rpsWoFb:
    print "third addition"
    neighbors = g2.get_out_neighbours(v)
    for w in neighbors:
        nextNeighbors = g2.get_out_neighbours(w)
        gen = (y for y in nextNeighbors if vprop_type[y] == '-1')
        if len(list(gen)) > 0:
            vprop_color[v] = "red"

graph_draw(g2, bg_color=[1,1,1,1], vertex_size=10, vertex_color="black", vertex_fill_color=vprop_color, vertex_shape=vprop_shape,
           vertex_pen_width=0.5, edge_color="black", output_size=(400, 400), output="fig2.pdf")