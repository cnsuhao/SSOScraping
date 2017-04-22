function [rank, log] = ExtractData(logFile, rankFile)
    lid = fopen(logFile, 'r');
    log = [];
    lineCount = 0;
    while ~feof(lid)
        lineCount = lineCount + 1;
        line = fgets(lid);
        [url, rankExists] = ExtractUrl(line);
        log = [log; struct('lineNo', lineCount, 'url', url, 'rankExists', rankExists)]; 
    end


    rid = fopen(rankFile, 'r');
    rankData = textscan(rid, '%d%s', 'delimiter', ',');
    ranks = rankData{1}; urls = rankData{2};
    rank = [];
    for  i = 1:length(ranks)
        rank = [rank; struct('rank', ranks(i), 'url', urls{i})];
    end
end

