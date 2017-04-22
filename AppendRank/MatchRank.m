function log = MatchRank(rank, log)
    for i=1:length(log)
        urlLog = log(i).url;
        if (isempty(urlLog)), continue; end
        for j=1:length(rank)
            if (strcmp(urlLog, rank(j).url) == 1)
                log(i).rank = rank(j).rank;
                break;
            end
        end
    end
end