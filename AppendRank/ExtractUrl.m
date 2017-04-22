function [url, rankExists] = ExtractUrl(line)
    httpsLoc = strfind(line, 'https');
    %% Replace http, HTTP, HTTPS with https
    if (isempty(httpsLoc))      
        httpsLoc = strfind(line, 'http');    
        if (isempty(httpsLoc))
            httpsLoc = strfind(line, 'HTTP');
            if (isempty(httpsLoc))
                httpsLoc = strfind(line, 'HTTPS'); 
                if (isempty(httpsLoc))
                    httpsLoc = strfind(line, 'Http');
                    if (isempty(httpsLoc))
                        httpsLoc = strfind(line, 'Https');
                    end
                end
            end
        end
    end
    if(isempty(httpsLoc)), url = []; rankExists = 0; return; end
    
    httpsLoc = httpsLoc(1);
    
    %%
    quoteLocs = strfind(line, '"');
    endQuoteLoc = quoteLocs(find(quoteLocs > httpsLoc));
    endQuoteLoc = endQuoteLoc(1);
    url = line(httpsLoc+8:endQuoteLoc-1);
    if(~isempty(strfind(url, 'www'))) url = url(5:end); end
    slashLoc = strfind(url, '/');
    if(~isempty(slashLoc)) url = url(1:slashLoc(1)-1); end
    
    rankExists = 1;
    if(isempty(strfind(line, 'rank'))), rankExists = 0; end
end