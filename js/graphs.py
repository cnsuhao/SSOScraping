import sys
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


#Read from edges file
filename = 'sampleedges.txt'
with open(filename) as edgeFile:
    for line in edgeFile:
        split = line.split(' ')
        singleIdp = split[0].strip()
        singleRp = split[1].strip()
        pair = singleIdp+','+singleRp
        pairs.append(pair)
        rpVtype = calcVertexType(singleRp)
        idpVtype = calcVertexType(singleIdp)
        singles.add(singleIdp+','+idpVtype)
        singles.add(singleRp+','+rpVtype)

g1 = Graph(directed=False)

vprop1_type = g1.new_vertex_property('string')
vprop1_value = g1.new_vertex_property('string')
vprop1_color = g1.new_vertex_property('string')
vprop1_shape = g1.new_vertex_property('string')
eprop1_color = g1.new_edge_property('string')

for each in singles:
    newV = g1.add_vertex()
    vertexVal = each.split(',')[0]
    vertexType = each.split(',')[1]
    vprop1_value[newV] = vertexVal
    vprop1_type[newV] = vertexType
    if vertexType == '0':
        vprop1_color[newV] = 'yellow'
        vprop1_shape[newV] = 'triangle'
    if vertexType == '1':
        vprop1_color[newV] = 'white'
        vprop1_shape[newV] = 'circle'
    if vertexType == '-1':
        vprop1_color[newV] = 'blue'
        vprop1_shape[newV] = 'square'

for pair in pairs:
    idp = pair.split(',')[0]
    rp = pair.split(',')[1]
    src = ''
    trgt = ''

    #Logic for first figure
    for v in g1.get_vertices():
        if vprop1_value[v] == idp:
            src = v
        elif vprop1_value[v] == rp:
            trgt = v
    newE = g1.add_edge(src, trgt)
    eprop1_color[newE] = 'black'
    if fb.search(vprop1_value[src]) is not None:
        if vprop1_type[trgt] == '1':
            vprop1_color[trgt] = 'green'

graph_draw(g1, bg_color=[1,1,1,1], vertex_size=10, vertex_color="black", vertex_fill_color=vprop1_color, vertex_shape=vprop1_shape, vertex_pen_width=0.5, edge_color=eprop1_color,
output_size=(400, 400), output="fig1.pdf")


g2 = Graph(g1)
rpsWoFb = []
#Logic for second figure
for v in g2.get_vertices():
    if vprop1_type[v] == '1':
        neighbors = g2.get_out_neighbours(v)
        gen = (w for w in neighbors if vprop1_type[w] == '-1')
        if len(list(gen)) > 0:
            continue
        else:
            rpsWoFb.append(v)
for v in rpsWoFb:
    neighbors = g2.get_out_neighbours(v)
    for w in neighbors:
        nextNeighbors = g2.get_out_neighbours(w)
        gen = (y for y in nextNeighbors if vprop1_type[y] == '-1')
        if len(list(gen)) > 0:
            vprop1_color[v] = "red"

graph_draw(g2, bg_color=[1,1,1,1], vertex_size=10, vertex_color="black", vertex_fill_color=vprop1_color, vertex_shape=vprop1_shape, vertex_pen_width=0.5, edge_color=eprop1_color,
output_size=(400, 400), output="fig2.pdf")